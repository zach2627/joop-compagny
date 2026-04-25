ALTER TABLE "banners"
ALTER COLUMN "ctaHref" SET DEFAULT '/store/products';

UPDATE "banners"
SET "ctaHref" = '/store/products'
WHERE "ctaHref" = '/products';
