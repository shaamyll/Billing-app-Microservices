-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'FAILED', 'CANCELLED', 'EXPIRED');

-- CreateTable
CREATE TABLE "Booking" (
    "id" UUID NOT NULL,
    "tripId" UUID NOT NULL,
    "seatId" UUID NOT NULL,
    "userId" UUID NOT NULL,
    "fromStopSeq" INTEGER NOT NULL,
    "toStopSeq" INTEGER NOT NULL,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "holdExpiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Booking_tripId_seatId_idx" ON "Booking"("tripId", "seatId");

-- CreateIndex
CREATE INDEX "Booking_userId_idx" ON "Booking"("userId");
