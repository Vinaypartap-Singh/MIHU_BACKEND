import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import prisma from "../db/db.config.js";
import {
  handleCatchError,
  handleTryResponseError,
  verifyUserAndReturn,
} from "../helper.js";

const commentHandler = Router();

// Post a comment
commentHandler.post("/post/:id/comment", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const { id } = req.params; // Get post ID from URL parameter
    const { content } = req.body;

    const user = await verifyUserAndReturn(user_id);

    if (!content) {
      return handleTryResponseError(res, 400, "Comment content is required");
    }

    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post) {
      return handleTryResponseError(res, 404, "Post Not Found");
    }

    const newComment = await prisma.comment.create({
      data: {
        content: content,
        postId: id,
        authorId: user_id,
      },
    });

    return handleTryResponseError(
      res,
      200,
      "Comment Added Successfully",
      newComment
    );
  } catch (error) {
    return handleCatchError(error, res, "Error While Adding Comment");
  }
});

// Update a comment
commentHandler.put("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const { id } = req.params; // Get comment ID from URL parameter
    const { content } = req.body;
    const user = await verifyUserAndReturn(user_id);

    if (!content) {
      return handleTryResponseError(res, 400, "Comment content is required");
    }

    const comment = await prisma.comment.findUnique({
      where: { id: id },
    });

    if (!comment) {
      return handleTryResponseError(res, 404, "Comment Not Found");
    }

    // Ensure the user is the author of the comment
    if (comment.authorId !== user_id) {
      return handleTryResponseError(
        res,
        403,
        "You can only edit your own comments"
      );
    }

    const updatedComment = await prisma.comment.update({
      where: { id: id },
      data: {
        content: content,
      },
    });

    return handleTryResponseError(
      res,
      200,
      "Comment Updated Successfully",
      updatedComment
    );
  } catch (error) {
    return handleCatchError(error, res, "Error While Updating Comment");
  }
});

// Delete a comment
commentHandler.delete("/comment/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const { id } = req.params; // Get comment ID from URL parameter

    const user = await verifyUserAndReturn(user_id);

    const comment = await prisma.comment.findUnique({
      where: { id: id },
    });

    if (!comment) {
      return handleTryResponseError(res, 404, "Comment Not Found");
    }

    // Ensure the user is the author of the comment
    if (comment.authorId !== user_id) {
      return handleTryResponseError(
        res,
        403,
        "You can only delete your own comments"
      );
    }

    // Delete the comment from the database
    await prisma.comment.delete({
      where: { id: id },
    });

    return handleTryResponseError(res, 200, "Comment Deleted Successfully");
  } catch (error) {
    return handleCatchError(error, res, "Error While Deleting Comment");
  }
});

// Get all comments for a post
commentHandler.get("/post/:id/comments", async (req, res) => {
  try {
    const { id } = req.params; // Get post ID from URL parameter

    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        comments: {
          include: {
            author: true, // Optionally include comment author's details
          },
        },
      },
    });

    if (!post) {
      return handleTryResponseError(res, 404, "Post Not Found");
    }

    // Return the list of comments
    return handleTryResponseError(
      res,
      200,
      "Comments Retrieved Successfully",
      post.comments
    );
  } catch (error) {
    return handleCatchError(error, res, "Error While Fetching Comments");
  }
});

export default commentHandler;
