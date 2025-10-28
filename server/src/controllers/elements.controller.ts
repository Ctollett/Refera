import { Request, Response } from "express";

import { prisma } from "../prisma/client.js";

/**
 * Create a new element
 * @param req - Express request with body: { name, description, }
 * @param res - Express response with { user, token }
 *
 */

export const getElements = async (req: Request, res: Response) => {
  const boardId = req.params.id;
  const userId = req.user!.userId;

  try {
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      return res.status(404).json({
        error: "No board found",
      });
    } else if (board.ownerId != userId) {
      const collaborator = await prisma.boardCollaborator.findUnique({
        where: {
          userId_boardId: {
            userId: userId,
            boardId: boardId,
          },
        },
      });
      if (!collaborator) {
        return res.status(403).json({
          error: "User does not have access to this board",
        });
      }
    }

    const fetchedElement = await prisma.element.findMany({
      where: {
        boardId: boardId,
      },
    });

    return res.status(200).json(fetchedElement);
  } catch (error) {
    console.error("Fetching error", error);
    return res.status(500).json({
      error: "Failed to get elements",
    });
  }
};

export const createElement = async (req: Request, res: Response) => {
  const boardId = req.params.id;
  const { type, position_x, position_y, width, height, data } = req.body;
  const userId = req.user!.userId;

  try {
    const board = await prisma.board.findUnique({
      where: {
        id: boardId,
      },
    });

    if (!board) {
      return res.status(404).json({
        error: "No board found",
      });
    } else if (board.ownerId != userId) {
      const collaborator = await prisma.boardCollaborator.findUnique({
        where: {
          userId_boardId: {
            userId: userId,
            boardId: boardId,
          },
        },
      });
      if (!collaborator || collaborator.role === "VIEWER") {
        return res.status(403).json({
          error: "User does not have permission to create elements",
        });
      }
    }

    const newElement = await prisma.element.create({
      data: {
        type: type,
        position_x: position_x,
        position_y: position_y,
        width: width,
        height: height,
        data: data,
        boardId: boardId,
      },
    });

    return res.status(201).json(newElement);
  } catch (error) {
    console.error("Create element error", error);
    return res.status(500).json({
      error: "Failed to create new element",
    });
  }
};

export const updateElement = async (req: Request, res: Response) => {
  const elementId = req.params.id;
  const updateData = req.body;
  const userId = req.user!.userId;

  try {
    const element = await prisma.element.findUnique({
      where: {
        id: elementId,
      },
    });

    if (!element) {
      return res.status(404).json({
        error: "No element found",
      });
    }

    const boardId = element.boardId;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return res.status(404).json({
        error: "No board found",
      });
    }

    if (board.ownerId != userId) {
      const collaborator = await prisma.boardCollaborator.findUnique({
        where: {
          userId_boardId: {
            userId: userId,
            boardId: boardId,
          },
        },
      });
      if (!collaborator || collaborator.role === "VIEWER") {
        return res.status(403).json({
          error: "User does not have permission to update elements",
        });
      }
    }

    const updatedElement = await prisma.element.update({
      where: { id: elementId },
      data: updateData,
    });

    return res.status(200).json(updatedElement);
  } catch (error) {
    console.error("Update error", error);
    return res.status(500).json({
      error: "Failed to update element",
    });
  }
};

export const deleteElement = async (req: Request, res: Response) => {
  const elementId = req.params.id;
  const userId = req.user!.userId;

  try {
    const element = await prisma.element.findUnique({
      where: {
        id: elementId,
      },
    });

    if (!element) {
      return res.status(404).json({
        error: "Element does not exist",
      });
    }

    const boardId = element.boardId;

    const board = await prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board) {
      return res.status(404).json({
        error: "No board found",
      });
    }

    if (board.ownerId != userId) {
      const collaborator = await prisma.boardCollaborator.findUnique({
        where: {
          userId_boardId: {
            userId: userId,
            boardId: boardId,
          },
        },
      });
      if (!collaborator || collaborator.role === "VIEWER") {
        return res.status(403).json({
          error: "User does not have permission to update elements",
        });
      }
    }

    await prisma.element.delete({
      where: { id: elementId },
    });

    return res.status(200).json({ message: "Element deleted successfully" });
  } catch (error) {
    console.error("Delete element error", error);
    return res.status(500).json({
      error: "Failed to delete element",
    });
  }
};
