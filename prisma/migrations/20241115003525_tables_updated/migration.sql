/*
  Warnings:

  - You are about to drop the column `user_id` on the `SocialMedia` table. All the data in the column will be lost.
  - You are about to drop the column `forceTwoFactorDisable` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isTwoFactorEmailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetOtp2FA` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `passwordResetOtpExpiry2FA` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `twoFactorEmail` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Header` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Navigation` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `SocialMedia` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Header" DROP CONSTRAINT "Header_user_id_fkey";

-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_user_id_fkey";

-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_user_id_fkey";

-- AlterTable
ALTER TABLE "SocialMedia" DROP COLUMN "user_id",
ADD COLUMN     "url" TEXT,
ADD COLUMN     "userId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "forceTwoFactorDisable",
DROP COLUMN "isTwoFactorEmailVerified",
DROP COLUMN "passwordResetOtp2FA",
DROP COLUMN "passwordResetOtpExpiry2FA",
DROP COLUMN "twoFactorEmail",
ADD COLUMN     "bio" TEXT;

-- DropTable
DROP TABLE "Header";

-- DropTable
DROP TABLE "Navigation";

-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,

    CONSTRAINT "Post_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Comment" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "authorId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Like" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,
    "postId" TEXT NOT NULL,

    CONSTRAINT "Like_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Follower" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "followingId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Follower_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Like" ADD CONSTRAINT "Like_postId_fkey" FOREIGN KEY ("postId") REFERENCES "Post"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Follower" ADD CONSTRAINT "Follower_followingId_fkey" FOREIGN KEY ("followingId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SocialMedia" ADD CONSTRAINT "SocialMedia_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
