import { Request, Response } from "express";

import { prisma } from "../lib/prisma.js";

export const getSessions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const sessions = await prisma.session.findMany({
      where: { userId: userId },
    });
    return res.status(200).json(sessions);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving sessions" });
  }
};

export const createSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, folderId, referenceAnalysis } = req.body;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: userId,
        },
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const newSession = await prisma.session.create({
      data: {
        name: name,
        folderId: folderId || null,
        referenceAnalysis: referenceAnalysis,
        userId: userId,
      },
    });
    return res.status(201).json({
      message: "Session created successfully",
      session: {
        id: newSession.id,
        name: newSession.name,
        folderId: newSession.folderId,
        referenceAnalysis: newSession.referenceAnalysis,
        userId: newSession.userId,
        createdAt: newSession.createdAt,
      },
    });
  } catch (error) {
    console.error("POST error: ", error);
    return res.status(500).json({
      error: "Session create failed",
    });
  }
};

export const updateSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { name, folderId } = req.body;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await prisma.session.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!session) {
      return res.status(404).json({ message: "No session found" });
    }

    if (folderId) {
      const folder = await prisma.folder.findFirst({
        where: {
          id: folderId,
          userId: userId,
        },
      });

      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
    }

    const updatedSession = await prisma.session.update({
      where: { id: id },
      data: {
        name: name,
        folderId: folderId || null,
      },
    });

    return res.status(200).json({
      message: "Session updated successfully",
      session: {
        id: updatedSession.id,
        name: updatedSession.name,
        folderId: updatedSession.folderId,
        referenceAnalysis: updatedSession.referenceAnalysis,
        userId: updatedSession.userId,
        createdAt: updatedSession.createdAt,
      },
    });
  } catch (error) {
    console.error("PUT error: ", error);
    return res.status(500).json({
      error: "Session update failed",
    });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await prisma.session.findFirst({
      where: {
        id: id,
        userId: userId,
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Session does not exist" });
    }

    const deletedSession = await prisma.session.delete({
      where: {
        id: id,
      },
    });
    return res.status(200).json({
      message: "Session deleted successfully",
      session: {
        id: deletedSession.id,
        name: deletedSession.name,
        folderId: deletedSession.folderId,
        referenceAnalysis: deletedSession.referenceAnalysis,
        userId: deletedSession.userId,
        createdAt: deletedSession.createdAt,
      },
    });
  } catch (error) {
    console.error("DELETE error: ", error);
    return res.status(500).json({
      error: "Session delete failed",
    });
  }
};

export const getSessionById = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.userId;
    const { id } = req.params;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const session = await prisma.session.findFirst({
      where: {
        id: id,
        userId: userId, // Ensure user owns it
      },
      include: {
        folder: true, // Include folder details
        // Include related elements, analyses, etc.
      },
    });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.status(200).json(session);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Error retrieving session" });
  }
};
