import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  async createOrder(userId: string, dto: CreateOrderDto) {
    if (!userId) {
      throw new BadRequestException(
        'Không tìm thấy thông tin đăng nhập hợp lệ (UserId trống)!',
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // 1. Kiểm tra tài khoản game muốn mua
      const account = await tx.gameAccount.findUnique({
        where: { id: dto.accountId },
      });

      if (!account) {
        throw new NotFoundException('Tài khoản game không tồn tại!');
      }

      if (account.status !== 'available') {
        throw new BadRequestException(
          'Tài khoản game này đã được bán hoặc đã bị ẩn!',
        );
      }

      // 2. Kiểm tra ví tiền của người mua
      const wallet = await tx.wallet.findUnique({
        where: { userID: userId },
      });

      if (!wallet) {
        throw new BadRequestException('Ví tiền của bạn chưa được khởi tạo!');
      }

      if (wallet.status !== 'active') {
        throw new BadRequestException('Ví tiền của bạn hiện đang bị khóa!');
      }

      // ================= 🛠️ ĐÃ SỬA: ĐỌC GIÁ SỐ THỰC CHUẨN XÁC =================
      const originalPrice = Number(account.price || 0);
      const salePrice = Number(account.salePrice || 0);

      // Nếu salePrice có giá trị thực tế lớn hơn 0 thì áp dụng giá giảm, ngược lại dùng giá gốc
      const finalPriceNum = salePrice > 0 ? salePrice : originalPrice;
      const balanceNum = Number(wallet.balance || 0);

      if (balanceNum < finalPriceNum) {
        throw new BadRequestException(
          'Số dư tài khoản không đủ, vui lòng nạp thêm tiền!',
        );
      }

      // Thực hiện các phép tính logic số dư bằng hàm sub và add của Prisma Decimal
      const balanceAfter = wallet.balance.sub(finalPriceNum);
      const totalSpentAfter = wallet.totalSpent.add(finalPriceNum);
      // =======================================================================

      // 4. Thực hiện TRỪ TIỀN ví người dùng
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalSpent: totalSpentAfter,
        },
      });

      // 5. Cập nhật trạng thái tài khoản game sang 'sold' và gán chủ sở hữu mới
      await tx.gameAccount.update({
        where: { id: account.id },
        data: {
          status: 'sold',
          buyerUserID: userId,
        },
      });

      // 6. Khởi tạo hóa đơn Order & OrderItem khớp chuẩn Schema
      const order = await tx.order.create({
        data: {
          orderCode: 'DH_' + Date.now(),
          userID: userId,
          sellerID: account.sellerID,
          totalAmount: finalPriceNum, // Sử dụng giá trị cuối cùng đã tính toán
          currency: 'VND',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          status: 'completed',
          items: {
            create: {
              accountID: account.id,
              itemName: account.productName,
              itemSnapshot: JSON.parse(JSON.stringify(account)),
              unitPrice: finalPriceNum, // Sử dụng giá trị cuối cùng đã tính toán
              status: 'completed',
            },
          },
        },
      });

      // 7. Ghi nhận lịch sử biến động số dư (WalletTransaction)
      await tx.walletTransaction.create({
        data: {
          walletID: wallet.id,
          userID: userId,
          txnCode: 'TXN_BUY_' + Date.now(),
          txnType: 'purchase',
          direction: 'debit',
          amount: finalPriceNum, // Sử dụng giá trị cuối cùng đã tính toán
          balanceBefore: wallet.balance,
          balanceAfter: balanceAfter,
          relatedType: 'order',
          relatedID: order.id,
          note: `Mua thành công mã tài khoản: ${account.productCode}`,
        },
      });

      return {
        success: true,
        message: 'Mua tài khoản thành công!',
        orderCode: order.orderCode,
      };
    });
  }
}
