import type { Element } from "shared";
import { createElementSchema, updateElementSchema } from "shared";
import { z } from "zod";
import { create } from "zustand";

import * as elementService from "../services/elementService";
type CreateElementData = z.infer<typeof createElementSchema>;
type UpdateElementData = z.infer<typeof updateElementSchema>;

interface ElementState {
  elements: Element[];
  loading: boolean;
  error: string | null;
  fetchElements: (boardId: string) => Promise<void>;
  createElement: (boardId: string, elementData: CreateElementData) => Promise<Element | undefined>;
  deleteElement: (elementId: string) => Promise<void>;
  updateElement: (
    elementId: string,
    elementData: UpdateElementData,
  ) => Promise<Element | undefined>;
}

export const useElementStore = create<ElementState>((set, get) => ({
  elements: [],
  loading: false,
  error: null,

  fetchElements: async (boardId: string) => {
    set({ loading: true });
    try {
      const data = await elementService.getElements(boardId);
      set({ elements: data, loading: false, error: null });
    } catch {
      set({ error: "Failed to fetch elements", loading: false });
    }
  },

  createElement: async (boardId: string, elementData: CreateElementData) => {
    set({ loading: true });
    try {
      const data = await elementService.createElement(boardId, elementData);
      set({ elements: [...get().elements, data], loading: false, error: null });
      return data;
    } catch {
      set({ error: "Failed to create element", loading: false });
      return undefined;
    }
  },

  deleteElement: async (elementId: string) => {
    set({ loading: true });
    try {
      await elementService.deleteElement(elementId);
      set((state) => ({
        elements: state.elements.filter((element) => element.id !== elementId),
        loading: false,
        error: null,
      }));
    } catch {
      set({ error: "Failed to delete element", loading: false });
    }
  },

  updateElement: async (elementId: string, elementData: UpdateElementData) => {
    set({ loading: true });
    try {
      const data = await elementService.updateElement(elementId, elementData);

      set((state) => ({
        elements: state.elements.map((element) => (element.id === elementId ? data : element)),
        loading: false,
        error: null,
      }));
      return data;
    } catch {
      set({ error: "failed to update element", loading: false });
      return undefined;
    }
  },
}));
