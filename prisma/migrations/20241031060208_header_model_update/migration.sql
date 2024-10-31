/*
  Warnings:

  - You are about to drop the column `header_id` on the `Navigation` table. All the data in the column will be lost.
  - You are about to drop the column `header_id` on the `SocialMedia` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Navigation" DROP CONSTRAINT "Navigation_header_id_fkey";

-- DropForeignKey
ALTER TABLE "SocialMedia" DROP CONSTRAINT "SocialMedia_header_id_fkey";

-- AlterTable
ALTER TABLE "Navigation" DROP COLUMN "header_id";

-- AlterTable
ALTER TABLE "SocialMedia" DROP COLUMN "header_id";
