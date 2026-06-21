import { Body, Controller, Post, UseGuards, Req } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

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
}
