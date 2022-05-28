-- CreateTable
CREATE TABLE "ReferralCode" (
    "id" TEXT NOT NULL,
    "service" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiry_date" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReferralCode_pkey" PRIMARY KEY ("id")
);
