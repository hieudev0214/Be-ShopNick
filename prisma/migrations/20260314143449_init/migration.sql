-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'user');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('pending_verification', 'active', 'locked', 'banned');

-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('email_link', 'phone_otp');

-- CreateEnum
CREATE TYPE "VerificationPurpose" AS ENUM ('register', 'forgot_password', 'change_email', 'change_phone');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('pending', 'verified', 'expired', 'cancelled');

-- CreateEnum
CREATE TYPE "SellerRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "SellerStatus" AS ENUM ('active', 'suspended');

-- CreateEnum
CREATE TYPE "GameStatus" AS ENUM ('active', 'hidden');

-- CreateEnum
CREATE TYPE "AccountPostedByType" AS ENUM ('admin', 'seller');

-- CreateEnum
CREATE TYPE "AccountStatus" AS ENUM ('available', 'pending_handover', 'sold', 'hidden');

-- CreateEnum
CREATE TYPE "AccountApprovalStatus" AS ENUM ('approved', 'pending_review', 'rejected');

-- CreateEnum
CREATE TYPE "WalletStatus" AS ENUM ('active', 'locked');

-- CreateEnum
CREATE TYPE "WalletTransactionType" AS ENUM ('deposit', 'purchase', 'refund', 'adjustment');

-- CreateEnum
CREATE TYPE "WalletTransactionDirection" AS ENUM ('credit', 'debit');

-- CreateEnum
CREATE TYPE "WalletTransactionRelatedType" AS ENUM ('deposit_request', 'order', 'admin_adjustment', 'refund');

-- CreateEnum
CREATE TYPE "DepositRequestStatus" AS ENUM ('pending', 'paid', 'cancelled', 'expired', 'rejected');

-- CreateEnum
CREATE TYPE "DepositMethod" AS ENUM ('bank_transfer');

-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending_handover', 'handing_over', 'completed', 'cancelled', 'refunded');

-- CreateEnum
CREATE TYPE "OrderPaymentStatus" AS ENUM ('paid', 'refunded');

-- CreateEnum
CREATE TYPE "OrderPaymentMethod" AS ENUM ('wallet');

-- CreateEnum
CREATE TYPE "OrderItemStatus" AS ENUM ('pending_handover', 'handed_over', 'completed', 'refunded', 'cancelled');

-- CreateEnum
CREATE TYPE "HandoverChannel" AS ENUM ('zalo', 'phone', 'telegram', 'facebook');

-- CreateEnum
CREATE TYPE "HandoverStatus" AS ENUM ('pending', 'contacted', 'delivered', 'failed', 'disputed');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "fullName" TEXT,
    "username" TEXT,
    "avatarUrl" TEXT,
    "zaloPhone" TEXT,
    "zaloName" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'user',
    "status" "UserStatus" NOT NULL DEFAULT 'pending_verification',
    "emailVerifiedAt" TIMESTAMP(3),
    "phoneVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "purpose" "VerificationPurpose" NOT NULL,
    "target" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "verifiedAt" TIMESTAMP(3),
    "status" "VerificationStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SellerRequest" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "fullName" TEXT,
    "phone" TEXT,
    "zaloPhone" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "note" TEXT,
    "status" "SellerRequestStatus" NOT NULL DEFAULT 'pending',
    "reviewedBy" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SellerRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seller" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "requestID" TEXT,
    "shopName" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "bankAccountName" TEXT,
    "bankAccountNumber" TEXT,
    "bankName" TEXT,
    "status" "SellerStatus" NOT NULL DEFAULT 'active',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Seller_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Game" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "thumbnailUrl" TEXT,
    "description" TEXT,
    "status" "GameStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Game_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAccount" (
    "id" TEXT NOT NULL,
    "sellerID" TEXT,
    "gameID" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "price" DECIMAL(15,2) NOT NULL,
    "originalPrice" DECIMAL(15,2),
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "rankInfo" TEXT,
    "serverInfo" TEXT,
    "platformInfo" TEXT,
    "loginType" TEXT,
    "bindInfo" TEXT,
    "levelInfo" TEXT,
    "skinCount" INTEGER,
    "heroCount" INTEGER,
    "extraInfo" JSONB,
    "status" "AccountStatus" NOT NULL DEFAULT 'available',
    "postedByType" "AccountPostedByType" NOT NULL DEFAULT 'admin',
    "approvalStatus" "AccountApprovalStatus" NOT NULL DEFAULT 'approved',
    "approvedBy" TEXT,
    "approvedAt" TIMESTAMP(3),
    "rejectReason" TEXT,
    "buyerUserID" TEXT,
    "soldAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAccount_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAccountImage" (
    "id" TEXT NOT NULL,
    "accountID" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GameAccountImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GameAccountSecret" (
    "id" TEXT NOT NULL,
    "accountID" TEXT NOT NULL,
    "gameUsernameEnc" TEXT,
    "gamePasswordEnc" TEXT,
    "linkedEmailEnc" TEXT,
    "linkedEmailPassEnc" TEXT,
    "backupCodeEnc" TEXT,
    "noteEnc" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GameAccountSecret_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wallet" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "balance" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalDeposit" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "totalSpent" DECIMAL(15,2) NOT NULL DEFAULT 0,
    "status" "WalletStatus" NOT NULL DEFAULT 'active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Wallet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WalletTransaction" (
    "id" TEXT NOT NULL,
    "walletID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "txnCode" TEXT NOT NULL,
    "txnType" "WalletTransactionType" NOT NULL,
    "direction" "WalletTransactionDirection" NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "balanceBefore" DECIMAL(15,2) NOT NULL,
    "balanceAfter" DECIMAL(15,2) NOT NULL,
    "relatedType" "WalletTransactionRelatedType",
    "relatedID" TEXT,
    "note" TEXT,
    "createdByAdminID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WalletTransaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DepositRequest" (
    "id" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "depositCode" TEXT NOT NULL,
    "amount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "method" "DepositMethod" NOT NULL DEFAULT 'bank_transfer',
    "bankName" TEXT NOT NULL,
    "bankAccountName" TEXT NOT NULL,
    "bankAccountNumber" TEXT NOT NULL,
    "transferContent" TEXT NOT NULL,
    "status" "DepositRequestStatus" NOT NULL DEFAULT 'pending',
    "paidAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3),
    "note" TEXT,
    "rawPayload" JSONB,
    "confirmedByAdminID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DepositRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "orderCode" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "sellerID" TEXT,
    "totalAmount" DECIMAL(15,2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'VND',
    "paymentMethod" "OrderPaymentMethod" NOT NULL DEFAULT 'wallet',
    "paymentStatus" "OrderPaymentStatus" NOT NULL DEFAULT 'paid',
    "status" "OrderStatus" NOT NULL DEFAULT 'pending_handover',
    "buyerNote" TEXT,
    "adminNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" TEXT NOT NULL,
    "orderID" TEXT NOT NULL,
    "accountID" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemSnapshot" JSONB NOT NULL,
    "unitPrice" DECIMAL(15,2) NOT NULL,
    "status" "OrderItemStatus" NOT NULL DEFAULT 'pending_handover',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HandoverLog" (
    "id" TEXT NOT NULL,
    "orderID" TEXT NOT NULL,
    "orderItemID" TEXT NOT NULL,
    "accountID" TEXT NOT NULL,
    "handoverChannel" "HandoverChannel" NOT NULL DEFAULT 'zalo',
    "receiverContact" TEXT,
    "status" "HandoverStatus" NOT NULL DEFAULT 'pending',
    "handedByAdminID" TEXT,
    "handoverNote" TEXT,
    "deliveredAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "HandoverLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "orderItemID" TEXT NOT NULL,
    "userID" TEXT NOT NULL,
    "sellerID" TEXT,
    "accountID" TEXT,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "content" TEXT,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorUserID" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityID" TEXT,
    "oldData" JSONB,
    "newData" JSONB,
    "note" TEXT,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "User_status_idx" ON "User"("status");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");

-- CreateIndex
CREATE INDEX "Verification_userID_createdAt_idx" ON "Verification"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "Verification_target_purpose_idx" ON "Verification"("target", "purpose");

-- CreateIndex
CREATE INDEX "Verification_status_expiresAt_idx" ON "Verification"("status", "expiresAt");

-- CreateIndex
CREATE INDEX "SellerRequest_userID_createdAt_idx" ON "SellerRequest"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "SellerRequest_status_createdAt_idx" ON "SellerRequest"("status", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_userID_key" ON "Seller"("userID");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_requestID_key" ON "Seller"("requestID");

-- CreateIndex
CREATE UNIQUE INDEX "Seller_slug_key" ON "Seller"("slug");

-- CreateIndex
CREATE INDEX "Seller_status_idx" ON "Seller"("status");

-- CreateIndex
CREATE INDEX "Seller_createdAt_idx" ON "Seller"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "Game_slug_key" ON "Game"("slug");

-- CreateIndex
CREATE INDEX "Game_status_idx" ON "Game"("status");

-- CreateIndex
CREATE INDEX "Game_createdAt_idx" ON "Game"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "GameAccount_code_key" ON "GameAccount"("code");

-- CreateIndex
CREATE UNIQUE INDEX "GameAccount_slug_key" ON "GameAccount"("slug");

-- CreateIndex
CREATE INDEX "GameAccount_gameID_idx" ON "GameAccount"("gameID");

-- CreateIndex
CREATE INDEX "GameAccount_sellerID_idx" ON "GameAccount"("sellerID");

-- CreateIndex
CREATE INDEX "GameAccount_status_idx" ON "GameAccount"("status");

-- CreateIndex
CREATE INDEX "GameAccount_approvalStatus_idx" ON "GameAccount"("approvalStatus");

-- CreateIndex
CREATE INDEX "GameAccount_buyerUserID_idx" ON "GameAccount"("buyerUserID");

-- CreateIndex
CREATE INDEX "GameAccount_price_idx" ON "GameAccount"("price");

-- CreateIndex
CREATE INDEX "GameAccount_createdAt_idx" ON "GameAccount"("createdAt");

-- CreateIndex
CREATE INDEX "GameAccountImage_accountID_sortOrder_idx" ON "GameAccountImage"("accountID", "sortOrder");

-- CreateIndex
CREATE UNIQUE INDEX "GameAccountSecret_accountID_key" ON "GameAccountSecret"("accountID");

-- CreateIndex
CREATE UNIQUE INDEX "Wallet_userID_key" ON "Wallet"("userID");

-- CreateIndex
CREATE INDEX "Wallet_status_idx" ON "Wallet"("status");

-- CreateIndex
CREATE UNIQUE INDEX "WalletTransaction_txnCode_key" ON "WalletTransaction"("txnCode");

-- CreateIndex
CREATE INDEX "WalletTransaction_userID_createdAt_idx" ON "WalletTransaction"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_walletID_createdAt_idx" ON "WalletTransaction"("walletID", "createdAt");

-- CreateIndex
CREATE INDEX "WalletTransaction_relatedType_relatedID_idx" ON "WalletTransaction"("relatedType", "relatedID");

-- CreateIndex
CREATE INDEX "WalletTransaction_createdByAdminID_idx" ON "WalletTransaction"("createdByAdminID");

-- CreateIndex
CREATE UNIQUE INDEX "DepositRequest_depositCode_key" ON "DepositRequest"("depositCode");

-- CreateIndex
CREATE UNIQUE INDEX "DepositRequest_transferContent_key" ON "DepositRequest"("transferContent");

-- CreateIndex
CREATE INDEX "DepositRequest_userID_createdAt_idx" ON "DepositRequest"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "DepositRequest_status_createdAt_idx" ON "DepositRequest"("status", "createdAt");

-- CreateIndex
CREATE INDEX "DepositRequest_expiredAt_idx" ON "DepositRequest"("expiredAt");

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderCode_key" ON "Order"("orderCode");

-- CreateIndex
CREATE INDEX "Order_userID_createdAt_idx" ON "Order"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "Order_sellerID_createdAt_idx" ON "Order"("sellerID", "createdAt");

-- CreateIndex
CREATE INDEX "Order_status_createdAt_idx" ON "Order"("status", "createdAt");

-- CreateIndex
CREATE INDEX "OrderItem_orderID_idx" ON "OrderItem"("orderID");

-- CreateIndex
CREATE INDEX "OrderItem_accountID_idx" ON "OrderItem"("accountID");

-- CreateIndex
CREATE INDEX "HandoverLog_orderID_createdAt_idx" ON "HandoverLog"("orderID", "createdAt");

-- CreateIndex
CREATE INDEX "HandoverLog_status_createdAt_idx" ON "HandoverLog"("status", "createdAt");

-- CreateIndex
CREATE INDEX "HandoverLog_handedByAdminID_idx" ON "HandoverLog"("handedByAdminID");

-- CreateIndex
CREATE UNIQUE INDEX "Review_orderItemID_key" ON "Review"("orderItemID");

-- CreateIndex
CREATE INDEX "Review_accountID_createdAt_idx" ON "Review"("accountID", "createdAt");

-- CreateIndex
CREATE INDEX "Review_sellerID_createdAt_idx" ON "Review"("sellerID", "createdAt");

-- CreateIndex
CREATE INDEX "Review_userID_createdAt_idx" ON "Review"("userID", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityID_createdAt_idx" ON "AuditLog"("entityType", "entityID", "createdAt");

-- CreateIndex
CREATE INDEX "AuditLog_actorUserID_createdAt_idx" ON "AuditLog"("actorUserID", "createdAt");

-- AddForeignKey
ALTER TABLE "Verification" ADD CONSTRAINT "Verification_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SellerRequest" ADD CONSTRAINT "SellerRequest_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seller" ADD CONSTRAINT "Seller_requestID_fkey" FOREIGN KEY ("requestID") REFERENCES "SellerRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_sellerID_fkey" FOREIGN KEY ("sellerID") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_gameID_fkey" FOREIGN KEY ("gameID") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccount" ADD CONSTRAINT "GameAccount_buyerUserID_fkey" FOREIGN KEY ("buyerUserID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccountImage" ADD CONSTRAINT "GameAccountImage_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "GameAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameAccountSecret" ADD CONSTRAINT "GameAccountSecret_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "GameAccount"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wallet" ADD CONSTRAINT "Wallet_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_walletID_fkey" FOREIGN KEY ("walletID") REFERENCES "Wallet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WalletTransaction" ADD CONSTRAINT "WalletTransaction_createdByAdminID_fkey" FOREIGN KEY ("createdByAdminID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DepositRequest" ADD CONSTRAINT "DepositRequest_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerID_fkey" FOREIGN KEY ("sellerID") REFERENCES "Seller"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderID_fkey" FOREIGN KEY ("orderID") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "GameAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_orderID_fkey" FOREIGN KEY ("orderID") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_orderItemID_fkey" FOREIGN KEY ("orderItemID") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "GameAccount"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HandoverLog" ADD CONSTRAINT "HandoverLog_handedByAdminID_fkey" FOREIGN KEY ("handedByAdminID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_orderItemID_fkey" FOREIGN KEY ("orderItemID") REFERENCES "OrderItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userID_fkey" FOREIGN KEY ("userID") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_accountID_fkey" FOREIGN KEY ("accountID") REFERENCES "GameAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorUserID_fkey" FOREIGN KEY ("actorUserID") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
