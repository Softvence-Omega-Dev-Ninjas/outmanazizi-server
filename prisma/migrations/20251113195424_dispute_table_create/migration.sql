-- CreateTable
CREATE TABLE "Dispute" (
    "id" TEXT NOT NULL,
    "bidId" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "isSolved" TEXT NOT NULL,
    "pictures" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Dispute_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Dispute" ADD CONSTRAINT "Dispute_id_fkey" FOREIGN KEY ("id") REFERENCES "Bid"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
