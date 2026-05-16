-- CreateTable
CREATE TABLE "CardConfig" (
    "id" SERIAL NOT NULL,
    "api_url" TEXT NOT NULL,
    "partner_id" TEXT NOT NULL,
    "partner_key" TEXT NOT NULL,
    "callback_url" TEXT,
    "viettel_fee" INTEGER,
    "vinaphone_fee" INTEGER,
    "mobifone_fee" INTEGER,
    "garena_fee" INTEGER,
    "zing_fee" INTEGER,
    "vnmobi_fee" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CardHistory" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "telco" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "code" TEXT NOT NULL,
    "serial" TEXT NOT NULL,
    "request_id" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CardHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CardHistory_request_id_key" ON "CardHistory"("request_id");
