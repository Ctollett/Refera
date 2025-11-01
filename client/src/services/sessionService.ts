import { CreateSessionSchema, UpdateSessionSchema } from "shared";
import { z } from "zod";

import axiosInstance from "./axiosService";

type CreateSessionData = z.infer<typeof CreateSessionSchema>;
type UpdateSessionData = z.infer<typeof UpdateSessionSchema>;

export const createSession = async (sessionData: CreateSessionData) => {
  try {
    const response = await axiosInstance.post("/sessions", sessionData);
    return response.data;
  } catch (error) {
    console.error("Failed to create a session", error);
    throw error;
  }
};

export const updateSession = async (sessionId: string, sessionData: UpdateSessionData) => {
  try {
    const response = await axiosInstance.patch(`/sessions/${sessionId}`, sessionData);
    return response.data;
  } catch (error) {
    console.error("Failed to update session", error);
    throw error;
  }
};

export const getSessions = async () => {
  try {
    const response = await axiosInstance.get("/sessions");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch sessions", error);
    throw error;
  }
};

export const getSessionById = async (sessionId: string) => {
  try {
    const response = await axiosInstance.get(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch session: ${sessionId}`, error);
    throw error;
  }
};

export const deleteSession = async (sessionId: string) => {
  try {
    const response = await axiosInstance.delete(`/sessions/${sessionId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to delete session: ${sessionId}`, error);
    throw error;
  }
};
