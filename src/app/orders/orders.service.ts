import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateMultipleOrderDto } from './dto/create-multiple-order.dto';

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

  async getHistory(userId: string) {
    if (!userId) {
      return [];
    }

    return this.prisma.order.findMany({
      where: {
        userID: userId, // Chắc chắn có giá trị cụ thể, không lo bị quét toàn bộ DB nữa
        paymentStatus: 'paid',
      },
      include: {
        items: {
          include: {
            account: {
              include: {
                game: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async createMultipleOrder(userId: string, dto: CreateMultipleOrderDto) {
    if (!userId) {
      throw new BadRequestException(
        'Không tìm thấy thông tin đăng nhập hợp lệ!',
      );
    }

    const { accountIds } = dto;

    return this.prisma.$transaction(async (tx) => {
      // 1. Tìm tất cả các tài khoản game dựa vào mảng ID gửi lên
      const accounts = await tx.gameAccount.findMany({
        where: { id: { in: accountIds } },
      });

      if (accounts.length === 0) {
        throw new NotFoundException('Không tìm thấy tài khoản game nào!');
      }

      // Kiểm tra xem có acc nào đã bị bán hoặc ẩn không
      const unavailableAccs = accounts.filter(
        (acc) => acc.status !== 'available',
      );
      if (unavailableAccs.length > 0) {
        throw new BadRequestException(
          `Có ${unavailableAccs.length} tài khoản đã bị bán hoặc bị ẩn mất rồi!`,
        );
      }

      // 2. Kiểm tra ví tiền người mua
      const wallet = await tx.wallet.findUnique({
        where: { userID: userId },
      });

      if (!wallet || wallet.status !== 'active') {
        throw new BadRequestException(
          'Ví tiền không tồn tại hoặc đang bị khóa!',
        );
      }

      // 3. Tính tổng số tiền của tất cả các acc cộng lại
      let totalFinalPrice = 0;
      const itemsData = accounts.map((account) => {
        const originalPrice = Number(account.price || 0);
        const salePrice = Number(account.salePrice || 0);
        const finalPriceNum = salePrice > 0 ? salePrice : originalPrice;

        totalFinalPrice += finalPriceNum; // Cộng dồn tổng bill

        return {
          accountID: account.id,
          itemName: account.productName,
          itemSnapshot: JSON.parse(JSON.stringify(account)),
          unitPrice: finalPriceNum,
          status: 'completed' as const,
        };
      });

      const balanceNum = Number(wallet.balance || 0);
      if (balanceNum < totalFinalPrice) {
        throw new BadRequestException(
          'Số dư tài khoản không đủ để thanh toán toàn bộ đơn hàng!',
        );
      }

      // Tính số dư sau khi trừ bằng hàm Prisma Decimal chuẩn xác
      const balanceAfter = wallet.balance.sub(totalFinalPrice);
      const totalSpentAfter = wallet.totalSpent.add(totalFinalPrice);

      // 4. Thực hiện TRỪ TIỀN ví người dùng
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalSpent: totalSpentAfter,
        },
      });

      // 5. Cập nhật trạng thái TẤT CẢ tài khoản game sang 'sold'
      await tx.gameAccount.updateMany({
        where: { id: { in: accountIds } },
        data: {
          status: 'sold',
          buyerUserID: userId,
        },
      });

      // 6. Khởi tạo 1 hóa đơn Order tổng chứa ĐA PHẦN TỬ (items)
      const order = await tx.order.create({
        data: {
          orderCode: 'DH_MULTI_' + Date.now(),
          userID: userId,
          totalAmount: totalFinalPrice,
          currency: 'VND',
          paymentMethod: 'wallet',
          paymentStatus: 'paid',
          status: 'completed',
          items: {
            create: itemsData, // Đẩy mảng danh sách acc đã map ở trên vào đây
          },
        },
      });

      // 7. Ghi nhận lịch sử biến động số dư
      await tx.walletTransaction.create({
        data: {
          walletID: wallet.id,
          userID: userId,
          txnCode: 'TXN_BUY_' + Date.now(),
          txnType: 'purchase',
          direction: 'debit',
          amount: totalFinalPrice,
          balanceBefore: wallet.balance,
          balanceAfter: balanceAfter,
          relatedType: 'order',
          relatedID: order.id,
          note: `Mua đồng thời ${accounts.length} tài khoản game thành công.`,
        },
      });

      return {
        success: true,
        message: `Mua thành công liền lúc ${accounts.length} tài khoản!`,
        orderCode: order.orderCode,
        // 🛠️ BỔ SUNG: Trả thêm thông tin tài khoản, mật khẩu về cho Frontend bốc ra popup
        purchasedAccounts: accounts.map((acc) => ({
          productName: acc.productName,
          accountInfo: acc.accountInfo,
        })),
      };
    });
  }
}
