import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import {
  UserId,
  UserEmail,
  UserName,
} from '../../common/decorators/current-user.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { APP_SERVICE } from '../../config/services';
import { PurchaseTicketDto } from '../dto/purchase-ticket.dto';
import { ValidateTicketDto } from '../dto/validate-ticket.dto';

@Controller('tickets')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TicketsController {
  constructor(
    @Inject(APP_SERVICE)
    private readonly appClient: ClientProxy,
  ) {}

  // CLIENT ENDPOINTS

  @Post('purchase')
  @Roles('CLI')
  @UsePipes(new ValidationPipe({ transform: true }))
  purchaseTicket(
    @UserId() userId: string,
    @UserEmail() userEmail: string,
    @UserName() userName: string,
    @Body() purchaseTicketDto: PurchaseTicketDto,
  ) {
    return this.appClient.send('ticket.purchase', {
      ...purchaseTicketDto,
      userId,
      userName: userName || 'Usuario',
      userEmail: userEmail || '',
    });
  }

  @Get('my-tickets')
  @Roles('CLI')
  findMyTickets(@UserId() userId: string) {
    return this.appClient.send('ticket.findUserTickets', { userId });
  }

  @Get('my-tickets/:id')
  @Roles('CLI')
  findMyTicketById(
    @Param('id', ParseIntPipe) ticketId: number,
    @UserId() userId: string,
  ) {
    return this.appClient.send('ticket.findUserTicketById', {
      ticketId,
      userId,
    });
  }

  // ADMIN ENDPOINTS

  @Get()
  @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllTickets(@Query() paginationDto: PaginationDto) {
    return this.appClient.send('ticket.findAll', paginationDto);
  }

  @Get('event/:eventId')
  @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  findTicketsByEvent(
    @Param('eventId', ParseIntPipe) eventId: number,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.appClient.send('ticket.findByEvent', {
      eventId,
      paginationDto,
    });
  }

  @Post('validate')
  @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  validateTicket(@Body() validateTicketDto: ValidateTicketDto) {
    return this.appClient.send('ticket.validate', validateTicketDto);
  }
}
