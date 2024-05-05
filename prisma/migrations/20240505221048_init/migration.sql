-- CreateTable
CREATE TABLE "ResetPassword" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" TEXT NOT NULL,

    CONSTRAINT "ResetPassword_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_token_key" ON "ResetPassword"("token");

-- CreateIndex
CREATE UNIQUE INDEX "ResetPassword_userId_key" ON "ResetPassword"("userId");
