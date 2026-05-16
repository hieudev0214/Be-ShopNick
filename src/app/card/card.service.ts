// src/app/card/card.service.ts

import { BadRequestException, Injectable } from '@nestjs/common';

import axios from 'axios';

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

    if (!config) {
      return await this.prisma.cardConfig.create({
        data: body,
      });
    }

    return await this.prisma.cardConfig.update({
      where: {
        id: config.id,
      },

      data: body,
    });
  }

  // =====================================
  // RECHARGE
  // =====================================
  async recharge(body: RechargeCardDto) {
    const { user_id, telco, amount, code, serial } = body;

    // GET CONFIG
    const config = await this.prisma.cardConfig.findFirst();

    if (!config) {
      throw new BadRequestException('Chưa cấu hình card API');
    }

    // REQUEST ID
    const request_id = Date.now().toString();

    // SAVE HISTORY
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
      // CALL CARD API
      const response = await axios.post(config.api_url, {
        telco,

        amount,

        code,

        serial,

        request_id,

        partner_id: config.partner_id,

        partner_key: config.partner_key,
      });

      return {
        success: true,

        message: 'Gửi thẻ thành công',

        data: response.data,
      };
    } catch (error) {
      console.log(error);

      // UPDATE FAILED
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },

        data: {
          status: 'failed',

          message: 'Card API Error',
        },
      });

      throw new BadRequestException('Card API Error');
    }
  }

  // =====================================
  // CALLBACK
  // =====================================
  async callback(body: CallbackCardDto) {
    const { request_id, status, value, message } = body;

    // FIND CARD
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

    // ALREADY SUCCESS
    if (card.status === 'success') {
      return {
        success: true,
      };
    }

    // =========================
    // SUCCESS
    // =========================
    if (status == 1) {
      // UPDATE CARD
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },

        data: {
          status: 'success',
          message,
        },
      });

      // FIND WALLET
      const wallet = await this.prisma.wallet.findFirst({
        where: {
          userID: card.user_id!,
        },
      });

      if (!wallet) {
        throw new BadRequestException('Wallet không tồn tại');
      }

      // BALANCE
      const balanceBefore = Number(wallet.balance);

      const balanceAfter = balanceBefore + Number(value);

      // UPDATE WALLET
      await this.prisma.wallet.update({
        where: {
          id: wallet.id,
        },

        data: {
          balance: balanceAfter,

          totalDeposit: Number(wallet.totalDeposit) + Number(value),
        },
      });

      // CREATE TRANSACTION
      await this.prisma.walletTransaction.create({
        data: {
          walletID: wallet.id,

          userID: card.user_id!,

          txnCode: 'CARD_' + Date.now(),

          txnType: 'deposit',

          direction: 'credit',

          amount: Number(value),

          balanceBefore,

          balanceAfter,

          relatedType: 'deposit_request',

          relatedID: request_id,

          note: `Nạp thẻ ${card.telco}`,
        },
      });
    }

    // =========================
    // WRONG VALUE
    // =========================
    else if (status == 2) {
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },

        data: {
          status: 'wrong_value',

          message,
        },
      });
    }

    // =========================
    // FAILED
    // =========================
    else {
      await this.prisma.cardHistory.update({
        where: {
          request_id,
        },

        data: {
          status: 'failed',

          message,
        },
      });
    }

    return {
      success: true,
    };
  }

  // =====================================
  // HISTORIES
  // =====================================
  async histories() {
    return await this.prisma.cardHistory.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
