// src/app/card/card.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto'; // Import trực tiếp hàm băm MD5 từ lõi Node.js
import FormData = require('form-data'); // Import chuẩn Node.js FormData để tránh trùng với trình duyệt

import { RechargeCardDto } from './dto/recharge-card.dto';
import { CallbackCardDto } from './dto/callback-card.dto';
import { UpdateCardConfigDto } from './dto/update-card-config.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';

@Injectable()
export class CardService {
  constructor(private readonly prisma: PrismaService) {}

  // =====================================
  // GET CONFIG
  // =====================================
  async getConfig() {
    return await this.prisma.cardConfig.findFirst();
  }

  // =====================================
  // UPDATE CONFIG
  // =====================================
  async updateConfig(body: UpdateCardConfigDto) {
    const config = await this.prisma.cardConfig.findFirst();

    // Nếu chưa có cấu hình nào thì tạo mới
    if (!config) {
      return await this.prisma.cardConfig.create({
        data: body,
      });
    }

    // Nếu đã có cấu hình, cập nhật hàng đầu tiên đó mà không cần quan tâm ID là gì
    await this.prisma.cardConfig.updateMany({
      data: body,
    });

    // Trả về dữ liệu mới nhất sau khi cập nhật
    return await this.prisma.cardConfig.findFirst();
  }

  // =====================================
  // RECHARGE (NẠP THẺ LÊN THEGIARE.COM)
  // =====================================
  async recharge(body: RechargeCardDto) {
    const { user_id, telco, amount, code, serial } = body;

    // 1. LẤY CẤU HÌNH API
    const config = await this.prisma.cardConfig.findFirst();
    if (!config) {
      throw new BadRequestException('Chưa cấu hình card API');
    }

    // 2. TẠO MÃ GIAO DỊCH DUY NHẤT
    const request_id = Date.now().toString();

    // 3. LƯU LỊCH SỬ THẺ Ở TRẠNG THÁI CHỜ DUYỆT (PENDING)
    await this.prisma.cardHistory.create({
      data: {
        user_id,
        telco,
        amount,
        code,
        serial,
        request_id,
        status: 'pending',
      },
    });

    try {
      // 4. 🛡️ TÍNH CHỮ KÝ BẢO MẬT MD5 (partner_key + code + serial)
      const rawSignString = config.partner_key + code + serial;
      const sign = createHash('md5').update(rawSignString).digest('hex');

      // 5. 📦 ĐÓNG GÓI DỮ LIỆU DẠNG MULTIPART/FORM-DATA THEO YÊU CẦU ĐỐI TÁC
      const form = new FormData();
      form.append('telco', telco);
      form.append('code', code);
      form.append('serial', serial);
      form.append('amount', amount.toString());
      form.append('request_id', request_id);
      form.append('partner_id', config.partner_id);
      form.append('sign', sign);
      form.append('command', 'charging');

      // 6. 🚀 GỬI DỮ LIỆU SANG SERVER THEGIARE.COM
      const response = await axios.post(config.api_url, form, {
        headers: {
          ...form.getHeaders(), // Trích xuất chính xác header Content-Type kèm boundary
        },
      });

      return {
        success: true,
        message: 'Gửi thẻ lên hệ thống thành công',
        data: response.data,
      };
    } catch (err: any) {
      console.error('Lỗi khi gọi Card API:', err.response?.data || err.message);

      // CẬP NHẬT TRẠNG THÁI THÈ THẤT BẠI KHI CỔNG API LỖI NHẬN THÈ
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },
        data: {
          status: 'failed',
          message: err.response?.data?.message || 'Card API Error',
        },
      });

      throw new BadRequestException(
        err.response?.data?.message || 'Card API Error',
      );
    }
  }

  // =====================================
  // CALLBACK (NHẬN KẾT QUẢ TỪ THEGIARE TRẢ VỀ)
  // =====================================
  async callback(body: CallbackCardDto) {
    const { request_id, status, value, message } = body;

    // 1. TÌM KIẾM THẺ TRONG LỊCH SỬ DỰA VÀO REQUEST_ID
    const card = await this.prisma.cardHistory.findUnique({
      where: {
        request_id,
      },
    });

    if (!card) {
      return {
        success: false,
        message: 'Card not found',
      };
    }

    // 2. KHÔNG XỬ LÝ LẠI NẾU THẺ NÀY ĐÃ THÀNH CÔNG RỒI
    if (card.status === 'success') {
      return {
        success: true,
      };
    }

    // =====================================
    // TRƯỜNG HỢP: THẺ ĐÚNG (STATUS = 1)
    // =====================================
    if (status == 1) {
      // 1. LẤY BẢNG CẤU HÌNH PHÍ TỪ ADMIN
      const config = await this.prisma.cardConfig.findFirst();

      // Xác định mức phí dựa trên loại thẻ (ép về viết thường để match với telco gửi lên)
      const currentTelco = card.telco ? card.telco.toLowerCase() : '';
      let feePercent = 20; // Mức phí dự phòng nếu không tìm thấy cấu hình

      if (config) {
        if (currentTelco.includes('viettel')) {
          feePercent = config.viettel_fee ?? 20;
        } else if (currentTelco.includes('vina')) {
          feePercent = config.vinaphone_fee ?? 20;
        } else if (currentTelco.includes('mobi')) {
          feePercent = config.mobifone_fee ?? 20;
        } else if (currentTelco.includes('zing')) {
          feePercent = config.zing_fee ?? 20;
        } else if (currentTelco.includes('garena')) {
          feePercent = config.garena_fee ?? 20;
        } else if (currentTelco.includes('vnmobi')) {
          feePercent = config.vnmobi_fee ?? 20;
        }
      }

      // 2. TÍNH TOÁN SỐ TIỀN THỰC CỘNG (Mệnh giá gốc - Phần trăm chiết khấu)
      const originValue = Number(value); // 10000
      const realMoneyToClick = originValue - originValue * (feePercent / 100); // 10000 - 2000 = 8000

      // Cập nhật trạng thái thẻ thành công trong DB
      await this.prisma.cardHistory.update({
        where: { request_id },
        data: {
          status: 'success',
          message: message || `Nạp thẻ thành công (Chiết khấu ${feePercent}%)`,
        },
      });

      // Tìm ví (Wallet) của người dùng
      const wallet = await this.prisma.wallet.findFirst({
        where: { userID: card.user_id! },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet không tồn tại');
      }

      // Đưa số tiền thực nhận sau khi trừ phí (realMoneyToClick) vào hàm tính toán ví
      const balanceBefore = wallet.balance;
      const balanceAfter = wallet.balance.add(realMoneyToClick);
      const totalDepositAfter = wallet.totalDeposit.add(realMoneyToClick);

      // 3. Cộng tiền vào ví và cập nhật tổng nạp (totalDeposit)
      await this.prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          balance: balanceAfter,
          totalDeposit: totalDepositAfter,
        },
      });

      // 4. Tạo lịch sử biến động số dư (WalletTransaction)
      await this.prisma.walletTransaction.create({
        data: {
          walletID: wallet.id,
          userID: card.user_id!,
          txnCode: 'CARD_' + Date.now(),
          txnType: 'deposit',
          direction: 'credit',
          amount: realMoneyToClick, // Log đúng số tiền 8k thực nhận vào lịch sử biến động
          balanceBefore: balanceBefore,
          balanceAfter: balanceAfter,
          relatedType: 'deposit_request',
          relatedID: request_id,
          note: `Nạp thẻ ${card.telco} thành công (Nhận ${realMoneyToClick}đ sau khi trừ ${feePercent}% phí)`,
        },
      });
    }

    // =====================================
    // TRƯỜNG HỢP: THẺ SAI MỆNH GIÁ (STATUS = 2)
    // =====================================
    else if (status == 2) {
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },
        data: {
          status: 'wrong_value',
          message: message || 'Sai mệnh giá thẻ',
        },
      });

      // Lưu ý: Nếu phía thegiare có hỗ trợ phạt vẫn cộng một phần tiền nhỏ,
      // bạn có thể bổ sung logic cộng tiền tương tự như status == 1 tại đây tùy chính sách.
    }

    // =====================================
    // TRƯỜNG HỢP: THẺ LỖI / THẺ SAI (STATUS KHÁC)
    // =====================================
    else {
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },
        data: {
          status: 'failed',
          message: message || 'Thẻ sai hoặc đã qua sử dụng',
        },
      });
    }

    return {
      success: true,
    };
  }

  // =====================================
  // HISTORIES (LẤY DANH SÁCH LỊCH SỬ KÈM TÊN USER)
  // =====================================
  async histories() {
    return await this.prisma.cardHistory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      // 💡 BỔ SUNG ĐOẠN NÀY: Để lấy thêm thông tin từ bảng liên kết User
      include: {
        user: {
          select: {
            username: true, // Hoặc fullName: true tùy theo cột trong schema của bạn
            email: true,
          },
        },
      },
    });
  }
}
