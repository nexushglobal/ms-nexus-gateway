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
import { Roles } from 'src/common/decorators/roles.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { APP_SERVICE } from '../../config/services';
import { CreateComplaintDto } from '../dto/create-complaint.dto';
import { FindComplaintsDto } from '../dto/find-complaints.dto';

@Controller('app/complaints')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ComplaintsController {
  constructor(
    @Inject(APP_SERVICE)
    private readonly appClient: ClientProxy,
  ) {}

  @Public()
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  createComplaint(@Body() createComplaintDto: CreateComplaintDto) {
    return this.appClient.send(
      { cmd: 'complaints.create' },
      createComplaintDto,
    );
  }

  @Get()
  @Roles('FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAll(@Query() dto: FindComplaintsDto) {
    return this.appClient.send({ cmd: 'complaints.findAll' }, dto);
  }

  @Post(':id/attend')
  @Roles('FAC')
  markAsRead(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { attended: boolean },
  ) {
    return this.appClient.send(
      { cmd: 'complaints.updateStatus' },
      {
        id,
        ...body,
      },
    );
  }
}
