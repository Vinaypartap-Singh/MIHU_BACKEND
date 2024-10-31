/*
  Warnings:

  - Added the required column `address` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `businessType` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `contactEmail` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `country` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `postalCode` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Header` table without a default value. This is not possible if the table is not empty.
  - Added the required column `header_id` to the `Navigation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Header" ADD COLUMN     "address" TEXT NOT NULL,
ADD COLUMN     "businessType" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "contactEmail" TEXT NOT NULL,
ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "coverImage" TEXT,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "openingHours" JSONB,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "photos" TEXT[],
ADD COLUMN     "postalCode" TEXT NOT NULL,
ADD COLUMN     "privacyPolicy" TEXT,
ADD COLUMN     "registrationNumber" TEXT,
ADD COLUMN     "returnPolicy" TEXT,
ADD COLUMN     "shippingPolicy" TEXT,
ADD COLUMN     "state" TEXT NOT NULL,
ADD COLUMN     "tagline" TEXT,
ADD COLUMN     "taxId" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "Navigation" ADD COLUMN     "header_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "Navigation" ADD CONSTRAINT "Navigation_header_id_fkey" FOREIGN KEY ("header_id") REFERENCES "Header"("id") ON DELETE CASCADE ON UPDATE CASCADE;
