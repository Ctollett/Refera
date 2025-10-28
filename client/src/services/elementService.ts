import { createElementSchema, updateElementSchema } from "shared";
import { z } from "zod";

import axiosInstance from "./axiosService";

type CreateElementData = z.infer<typeof createElementSchema>;
type UpdateElementData = z.infer<typeof updateElementSchema>;

export const getElements = async (boardId: string) => {
  try {
    const response = await axiosInstance.get(`/boards/${boardId}/elements`);
    return response.data;
  } catch (error) {
    console.error("Failed to get elements", error);
    throw error;
  }
};

export const createElement = async (boardId: string, elementData: CreateElementData) => {
  try {
    const response = await axiosInstance.post(`/boards/${boardId}/elements`, elementData);
    console.log("Element successfully created");
    return response.data;
  } catch (error) {
    console.error("Element failed to be created", error);
    throw error;
  }
};

export const updateElement = async (elementId: string, elementData: UpdateElementData) => {
  try {
    const response = await axiosInstance.put(`/elements/${elementId}`, elementData);
    console.log("Element successfully updated");
    return response.data;
  } catch (error) {
    console.error("Element failed to be updated", error);
    throw error;
  }
};

export const deleteElement = async (elementId: string) => {
  try {
    const response = await axiosInstance.delete(`/elements/${elementId}`);
    console.log("Element successfully deleted");
    return response.data;
  } catch (error) {
    console.error("Failed to delete element", error);
    throw error;
  }
};

// Additional utility functions for better frontend integration

/**
 * Update element position - useful for drag and drop functionality
 */
export const updateElementPosition = async (
  elementId: string,
  position: { x: number; y: number },
) => {
  return updateElement(elementId, {
    position_x: position.x,
    position_y: position.y,
  });
};

/**
 * Update element size - useful for resize functionality
 */
export const updateElementSize = async (
  elementId: string,
  size: { width: number; height: number },
) => {
  return updateElement(elementId, {
    width: size.width,
    height: size.height,
  });
};
