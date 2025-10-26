import { ElementType } from "@prisma/client";
import { z } from "zod";

const noteDataSchema = z.object({
  text: z.string(),
  color: z.enum(["yellow", "blue", "pink", "green", "orange"]),
});

const todoDataSchema = z.object({
  title: z.string().optional(),
  items: z.array(
    z.object({
      id: z.string(),
      text: z.string(),
      completed: z.boolean(),
    }),
  ),
});

const imageDataSchema = z.object({
  url: z.string().url(),
  fileName: z.string(),
  thumbnailUrl: z.string().url().optional(),
});

const pdfDataSchema = z.object({
  url: z.string().url(),
  fileName: z.string(),
  pageCount: z.number().int().positive(),
});

const linkDataSchema = z.object({
  url: z.string().url(),
  title: z.string(),
});

const commentPinDataSchema = z.object({
  threadId: z.string(),
  userInitial: z.string(),
});

export const createElementSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal(ElementType.NOTE),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    data: noteDataSchema,
  }),
  z.object({
    type: z.literal(ElementType.TODO),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    data: todoDataSchema,
  }),

  z.object({
    type: z.literal(ElementType.IMAGE),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    data: imageDataSchema,
  }),

  z.object({
    type: z.literal(ElementType.PDF),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    data: pdfDataSchema,
  }),

  z.object({
    type: z.literal(ElementType.LINK),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    data: linkDataSchema,
  }),

  z.object({
    type: z.literal(ElementType.COMMENT_PIN),
    position_x: z.number(),
    position_y: z.number(),
    width: z.number(),
    height: z.number(),
    data: commentPinDataSchema,
  }),
]);

export const updateElementSchema = z.object({
  position_x: z.number().optional(),
  position_y: z.number().optional(),
  width: z.number().optional(),
  height: z.number().optional(),
  data: z
    .union([
      noteDataSchema,
      todoDataSchema,
      imageDataSchema,
      pdfDataSchema,
      linkDataSchema,
      commentPinDataSchema,
    ])
    .optional(),
});
