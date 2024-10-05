-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "profileImage" TEXT,
    "enableTwoFactorEmail" BOOLEAN NOT NULL DEFAULT false,
    "twoFactorEmail" TEXT,
    "twoFactorEmailOTP" INTEGER,
    "twoFactorEmailOTPExpiry" TIMESTAMP(3),
    "isTwoFactorEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "forceTwoFactorDisable" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyOtp" INTEGER,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "emailVerifyOtpExpiry" TIMESTAMP(3),
    "passwordResetOtp" INTEGER,
    "passwordResetOtpExpiry" TIMESTAMP(3),
    "passwordResetOtp2FA" INTEGER,
    "passwordResetOtpExpiry2FA" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
