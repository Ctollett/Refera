import type { Session } from "shared";
import type { CreateSession, UpdateSession } from "shared/src/types/session.types";
import { create } from "zustand";

import * as sessionService from "../services/sessionService";

interface SessionState {
  sessions: Session[];
  loading: boolean;
  error: string | null;
  getSessions: () => Promise<Session[]>;
  getSessionById: (sessionId: string) => Promise<Session>;
  createSession: (sessionData: CreateSession) => Promise<Session>;
  updateSession: (sessionId: string, sessionData: UpdateSession) => Promise<Session>;
  deleteSession: (sessionId: string) => Promise<Session>;
}

export const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  loading: false,
  error: null,

  getSessions: async () => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.getSessions();
      set({ sessions: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch sessions";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  getSessionById: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.getSessionById(sessionId);
      set({ sessions: data, loading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to fetch sessions";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  createSession: async (sessionData: CreateSession) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.createSession(sessionData);
      set({ sessions: [...get().sessions, data], loading: false });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to create session";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  updateSession: async (sessionId: string, sessionData: UpdateSession) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.updateSession(sessionId, sessionData);
      set({
        sessions: get().sessions.map((s) => (s.id === sessionId ? data : s)),
        loading: false,
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update session";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },

  deleteSession: async (sessionId: string) => {
    set({ loading: true, error: null });
    try {
      const data = await sessionService.deleteSession(sessionId);
      set({
        sessions: get().sessions.filter((s) => s.id !== sessionId),
        loading: false,
      });
      return data;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to delete session";
      set({ error: errorMessage, loading: false });
      throw error;
    }
  },
}));
