-- AlterTable: add optional color column to product_images
-- Associates a product image with a specific color variant.
ALTER TABLE "product_images" ADD COLUMN "color" TEXT;
