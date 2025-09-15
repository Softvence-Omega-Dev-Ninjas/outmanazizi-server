-- CreateTable
CREATE TABLE "public"."AreaAndServices" (
    "id" SERIAL NOT NULL,
    "area" TEXT[],
    "services" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AreaAndServices_pkey" PRIMARY KEY ("id")
);
