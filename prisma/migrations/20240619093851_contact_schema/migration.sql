-- CreateTable
CREATE TABLE "Contact" (
    "id" SERIAL NOT NULL,
    "Id" INTEGER NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "emailId" TEXT NOT NULL,
    "linkedId" INTEGER,
    "linPrecedence" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Contact_phoneNumber_emailId_key" ON "Contact"("phoneNumber", "emailId");
