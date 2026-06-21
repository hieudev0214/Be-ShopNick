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
    // Sử dụng $transaction để đảm bảo an toàn tuyệt đối cho dòng tiền
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

      // 3. Tính toán và kiểm tra số dư (Xử lý mượt mà kiểu dữ liệu Decimal)
      const accountPrice = account.salePrice
        ? account.salePrice
        : account.price;
      const priceNum = Number(accountPrice);
      const balanceNum = Number(wallet.balance);

      if (balanceNum < priceNum) {
        throw new BadRequestException(
          'Số dư tài khoản không đủ, vui lòng nạp thêm tiền!',
        );
      }

      const balanceAfter = wallet.balance.sub(priceNum);
      const totalSpentAfter = wallet.totalSpent.add(priceNum);

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
          totalAmount: accountPrice,
          currency: 'VND',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          status: 'completed', // Đánh dấu hoàn thành để giao nick ngay
          items: {
            create: {
              accountID: account.id,
              itemName: account.productName,
              // Chụp ảnh (snapshot) toàn bộ thông tin tài khoản bao gồm cả tài khoản mật khẩu
              itemSnapshot: JSON.parse(JSON.stringify(account)),
              unitPrice: accountPrice,
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
          direction: 'debit', // debit = trừ tiền
          amount: accountPrice,
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
