-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "category" "CategoryType" NOT NULL,
    "subCategories" "SubCategory"[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_category_key" ON "Category"("category");
