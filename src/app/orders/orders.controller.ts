import { Body, Controller, Post, UseGuards, Req, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { CreateMultipleOrderDto } from './dto/create-multiple-order.dto';

@ApiTags('Quản Lý Đơn Hàng Mua Acc')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: 'Khách hàng thực hiện mua tài khoản game bằng số dư ví',
  })
  create(@Req() req: any, @Body() createOrderDto: CreateOrderDto) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;

    return this.ordersService.createOrder(userId, createOrderDto);
  }

  @Get('history')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Lịch sử tài khoản game đã mua của người dùng' })
  async getPurchaseHistory(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    return this.ordersService.getHistory(userId);
  }

  @Post('multiple')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary:
      'Khách hàng thực hiện mua NHIỀU tài khoản game cùng lúc bằng số dư ví',
  })
  createMultiple(
    @Req() req: any,
    @Body() createMultipleOrderDto: CreateMultipleOrderDto,
  ) {
    const userId = req.user?.id || req.user?.sub || req.user?.userId;
    return this.ordersService.createMultipleOrder(
      userId,
      createMultipleOrderDto,
    );
  }
}
