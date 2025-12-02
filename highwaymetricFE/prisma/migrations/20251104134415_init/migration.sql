-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "postgis";

-- CreateEnum
CREATE TYPE "HighwayStatus" AS ENUM ('PLANNING', 'CONSTRUCTION', 'COMPLETED', 'MAINTENANCE');

-- CreateTable
CREATE TABLE "Highway" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "ref" TEXT,
    "description" TEXT,
    "geom" Geometry(MultiLineString, 4326),
    "status" "HighwayStatus" NOT NULL DEFAULT 'PLANNING',
    "contractorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "estimatedBudget" DOUBLE PRECISION,
    "actualCost" DOUBLE PRECISION,
    "reworkCount" INTEGER DEFAULT 0,
    "completionDate" TIMESTAMP(3),
    "lengthKm" DOUBLE PRECISION,
    "state" TEXT,

    CONSTRAINT "Highway_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NewsArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "highwayId" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "NewsArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Highway_name_key" ON "Highway"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Highway_ref_key" ON "Highway"("ref");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_name_key" ON "Contractor"("name");

-- CreateIndex
CREATE UNIQUE INDEX "NewsArticle_url_key" ON "NewsArticle"("url");

-- AddForeignKey
ALTER TABLE "Highway" ADD CONSTRAINT "Highway_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NewsArticle" ADD CONSTRAINT "NewsArticle_highwayId_fkey" FOREIGN KEY ("highwayId") REFERENCES "Highway"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
