import { Router } from "express";
import { upload } from "../middleware/multer.middleware.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  handleCatchError,
  handleTryResponseError,
  verifyUserAndReturn,
} from "../helper.js";
import prisma from "../db/db.config.js";
import { uploadOnCloudinary } from "../config/cloudinary.js";
import { postSchema } from "../validations/post.validation.js";

const postHandler = Router();

// Upload a Post
postHandler.post(
  "/upload",
  upload.single("postImage"),
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user;
      const body = req.body;
      const payload = postSchema.parse(body);

      const user = await verifyUserAndReturn(user_id);

      if (!req.file) {
        return handleTryResponseError(res, 400, "No Image File Uploaded");
      }

      const postImageLocalPath = req.file.path;

      const postImage = await uploadOnCloudinary(postImageLocalPath);

      if (!postImage) {
        return handleTryResponseError("Unable to load image to cloudinary.");
      }

      const newPost = await prisma.post.create({
        data: {
          content: payload.content,
          imageUrl: postImage.url,
          authorId: user.id,
        },
      });

      return handleTryResponseError(res, 200, "Post Updated", newPost);
    } catch (error) {
      return handleCatchError(error, res, "Error While Uploading Post");
    }
  }
);

// Update a Post
postHandler.put(
  "/post/:id",
  upload.single("postImage"),
  authMiddleware,
  async (req, res) => {
    try {
      const user_id = req.user;
      const { id } = req.params; // Get post ID from URL parameter
      const body = req.body;
      const payload = postSchema.parse(body);

      const user = await verifyUserAndReturn(user_id);

      // Find the post by ID
      const post = await prisma.post.findUnique({
        where: { id: id },
      });

      if (!post) {
        return handleTryResponseError(res, 404, "Post Not Found");
      }

      // Ensure the user is the author of the post
      if (post.authorId !== user_id) {
        return handleTryResponseError(
          res,
          403,
          "You can only edit your own posts"
        );
      }

      let postImageUrl = post.imageUrl;

      // If a new image is uploaded, handle it
      if (req.file) {
        const postImageLocalPath = req.file.path;
        const postImage = await uploadOnCloudinary(postImageLocalPath);

        if (!postImage) {
          return handleTryResponseError(
            res,
            500,
            "Unable to load image to Cloudinary"
          );
        }
        postImageUrl = postImage.url; // Update image URL
      }

      // Update post content and/or image URL
      const updatedPost = await prisma.post.update({
        where: { id: id },
        data: {
          content: payload.content || post.content, // Update content if provided, else keep old content
          imageUrl: postImageUrl, // Update image URL if a new one is uploaded
        },
      });

      return handleTryResponseSuccess(
        res,
        200,
        "Post Updated Successfully",
        updatedPost
      );
    } catch (error) {
      return handleCatchError(error, res, "Error While Updating Post");
    }
  }
);

// Delete a Post
postHandler.delete("/post/:id", authMiddleware, async (req, res) => {
  try {
    const user_id = req.user;
    const { id } = req.params; // Get post ID from URL parameter

    const user = await verifyUserAndReturn(user_id);

    // Find the post by ID
    const post = await prisma.post.findUnique({
      where: { id: id },
    });

    if (!post) {
      return handleTryResponseError(res, 404, "Post Not Found");
    }

    // Ensure the user is the author of the post
    if (post.authorId !== user_id) {
      return handleTryResponseError(
        res,
        403,
        "You can only delete your own posts"
      );
    }

    // Delete the post from the database
    await prisma.post.delete({
      where: { id: id },
    });

    return handleTryResponseSuccess(res, 200, "Post Deleted Successfully");
  } catch (error) {
    return handleCatchError(error, res, "Error While Deleting Post");
  }
});

// Get a Post by ID
postHandler.get("/post/:id", async (req, res) => {
  try {
    const { id } = req.params; // Get post ID from URL parameter

    // Find the post by ID
    const post = await prisma.post.findUnique({
      where: { id: id },
      include: {
        author: true, // Optionally include author details
        comments: true, // Optionally include comments
        likes: true, // Optionally include likes
      },
    });

    // If the post does not exist
    if (!post) {
      return handleTryResponseError(res, 404, "Post Not Found");
    }

    // Return the post data
    return handleTryResponseSuccess(
      res,
      200,
      "Post Retrieved Successfully",
      post
    );
  } catch (error) {
    return handleCatchError(error, res, "Error While Fetching Post");
  }
});

// Get all posts
postHandler.get("/posts", async (req, res) => {
  try {
    // Retrieve all posts with optional related data (author, comments, likes)
    const posts = await prisma.post.findMany({
      include: {
        author: true, // Include author details (name, email, etc.)
        comments: true, // Include comments for each post
        likes: true, // Include likes for each post
      },
      orderBy: {
        createdAt: "desc", // Order by the latest posts first
      },
    });

    // If no posts are found
    if (posts.length === 0) {
      return handleTryResponseError(res, 404, "No Posts Found");
    }

    // Return the list of posts
    return handleTryResponseSuccess(
      res,
      200,
      "Posts Retrieved Successfully",
      posts
    );
  } catch (error) {
    return handleCatchError(error, res, "Error While Fetching Posts");
  }
});

export default postHandler;
