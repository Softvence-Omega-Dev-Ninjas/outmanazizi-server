-- CreateTable
CREATE TABLE "public"."SubServices" (
    "id" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubServices_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."SubServices" ADD CONSTRAINT "SubServices_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "public"."Services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
