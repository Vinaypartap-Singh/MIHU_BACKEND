import { Router } from "express";
import prisma from "../db/db.config.js";
import { handleTryResponseError } from "../helper.js";
import { authMiddleware } from "../middleware/auth.middleware.js";

const likeHandler = Router();

// Like a Post
likeHandler.post(
  "/like/:postId", // The post ID is passed as a URL parameter
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user; // Get the logged-in user's ID from the authMiddleware
      const { postId } = req.params; // Get the post ID from the URL parameter

      const user = await prisma.user.findUnique({
        where: {
          id: user_id,
        },
      });

      if (!user) {
        return handleTryResponseError(
          res,
          400,
          "Please Log In To like the post"
        );
      }

      if (!user.emailVerified) {
        return handleTryResponseError(
          res,
          400,
          "Please Verify Your To like the post"
        );
      }

      // Find the post in the database
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      // If the post doesn't exist, return an error
      if (!post) {
        return handleTryResponseError(res, 404, "Post Not Found");
      }

      // Check if the user has already liked this post
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user_id,
            postId: postId,
          },
        },
      });

      // If the user has already liked the post, return an error
      if (existingLike) {
        return handleTryResponseError(
          res,
          400,
          "You have already liked this post"
        );
      }

      // Otherwise, create a new like entry
      const newLike = await prisma.like.create({
        data: {
          postId,
          userId: user_id,
        },
      });

      // Return the updated like count for the post
      return handleTryResponseError(
        res,
        200,
        "Post Liked Successfully",
        newLike
      );
    } catch (error) {
      return handleCatchError(error, res, "Error While Liking Post");
    }
  }
);

// Unlike a Post
likeHandler.delete(
  "/unlike/:postId", // The post ID is passed as a URL parameter
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user; // Get the logged-in user's ID from the authMiddleware
      const { postId } = req.params; // Get the post ID from the URL parameter

      // Find the post in the database
      const post = await prisma.post.findUnique({
        where: { id: postId },
      });

      // If the post doesn't exist, return an error
      if (!post) {
        return handleTryResponseError(res, 404, "Post Not Found");
      }

      // Check if the user has already liked this post
      const existingLike = await prisma.like.findUnique({
        where: {
          userId_postId: {
            userId: user_id,
            postId: postId,
          },
        },
      });

      // If the user hasn't liked the post, return an error
      if (!existingLike) {
        return handleTryResponseError(
          res,
          400,
          "You haven't liked this post yet"
        );
      }

      // Otherwise, remove the like entry
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId: user_id,
            postId: postId,
          },
        },
      });

      // Return a success message and updated like count
      return handleTryResponseError(res, 200, "Post Unliked Successfully");
    } catch (error) {
      return handleCatchError(error, res, "Error While Unliking Post");
    }
  }
);

export default likeHandler;
