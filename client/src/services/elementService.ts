import { createElementSchema } from "shared";
import { z } from "zod";

type CreateElementData = z.infer<typeof createElementSchema>;

import axiosInstance from "./axiosService";

export const createElement = async (elementData: CreateElementData) => {
  try {
    const response = await axiosInstance.post("/elements", elementData);
    console.log("Element successfully created");

    return response.data;
  } catch (error) {
    console.error("Element failed to be created", error);
    throw error;
  }
};
