import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware.js";
import prisma from "../db/db.config.js";
import {
  handleCatchError,
  handleTryResponseError,
  handleTryResponseSuccess,
} from "../helper.js";

const followerHandler = Router();

// Follow a user
followerHandler.post("/follow/:id", authMiddleware, async (req, res) => {
  try {
    const followerId = req.user; // The user making the request (follower)
    const { id: followingId } = req.params; // The user to be followed
    const user_id = req.user;

    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return handleTryResponseError(res, 400, "Please Log In To like the post");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please Verify Your To like the post"
      );
    }

    if (followerId === followingId) {
      return handleTryResponseError(res, 400, "You cannot follow yourself");
    }

    // Check if the follow relationship already exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (existingFollow) {
      return handleTryResponseError(
        res,
        400,
        "You are already following this user"
      );
    }

    // Create a new follow relationship
    const newFollow = await prisma.follower.create({
      data: {
        followerId: followerId,
        followingId: followingId,
      },
    });

    return handleTryResponseSuccess(
      res,
      200,
      "Followed successfully",
      newFollow
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while following user");
  }
});

// Unfollow a user
followerHandler.delete("/unfollow/:id", authMiddleware, async (req, res) => {
  try {
    const followerId = req.user; // The user making the request (follower)
    const { id: followingId } = req.params; // The user to be unfollowed
    const user_id = req.user;

    const user = await prisma.user.findUnique({
      where: {
        id: user_id,
      },
    });

    if (!user) {
      return handleTryResponseError(res, 400, "Please Log In To like the post");
    }

    if (!user.emailVerified) {
      return handleTryResponseError(
        res,
        400,
        "Please Verify Your To like the post"
      );
    }

    if (followerId === followingId) {
      return handleTryResponseError(res, 400, "You cannot unfollow yourself");
    }

    // Check if the follow relationship exists
    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    if (!existingFollow) {
      return handleTryResponseError(
        res,
        400,
        "You are not following this user"
      );
    }

    // Delete the follow relationship
    await prisma.follower.delete({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
    });

    return handleTryResponseSuccess(res, 200, "Unfollowed successfully");
  } catch (error) {
    return handleCatchError(error, res, "Error while unfollowing user");
  }
});

// Get all followers of a user
followerHandler.get("/followers/:id", async (req, res) => {
  try {
    const { id: followingId } = req.params;

    // Get all followers of the user
    const followers = await prisma.follower.findMany({
      where: {
        followingId: followingId,
      },
      include: {
        follower: true, // Optionally, include follower details like username, email
      },
    });

    return handleTryResponseSuccess(
      res,
      200,
      "Followers retrieved successfully",
      followers
    );
  } catch (error) {
    return handleCatchError(error, res, "Error while retrieving followers");
  }
});

// Get all users a specific user is following
followerHandler.get("/following/:id", async (req, res) => {
  try {
    const { id: followerId } = req.params;

    // Get all users the follower is following
    const following = await prisma.follower.findMany({
      where: {
        followerId: followerId,
      },
      include: {
        following: true, // Optionally, include following details like username, email
      },
    });

    return handleTryResponseSuccess(
      res,
      200,
      "Following retrieved successfully",
      following
    );
  } catch (error) {
    return handleCatchError(
      error,
      res,
      "Error while retrieving following list"
    );
  }
});

export default followerHandler;
