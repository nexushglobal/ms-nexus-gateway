import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  Param,
  ParseFilePipeBuilder,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { PaginationDto } from 'src/common/dto/pagination.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { APP_SERVICE } from 'src/config/services';
import { CreateEventDto } from '../dto/create-event.dto';
import { UpdateEventStatusDto } from '../dto/update-event-status.dto';
import { UpdateEventDto } from '../dto/update-event.dto';
import { SerializedFile } from '../interfaces/serialized-file.interface';

@Controller('events')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EventsController {
  constructor(
    @Inject(APP_SERVICE)
    private readonly appClient: ClientProxy,
  ) {}

  // ADMIN ENDPOINTS
  @Post()
  @Roles('SYS', 'FAC')
  @UseInterceptors(FileInterceptor('eventImage'))
  @UsePipes(new ValidationPipe({ transform: true }))
  createEvent(
    @Body() createEventDto: CreateEventDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    const serializedFile: SerializedFile = {
      buffer: file.buffer.toString('base64'),
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
    };

    return this.appClient.send('event.create', {
      createEventDto,
      file: serializedFile,
    });
  }

  @Get()
  @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllEvents(@Query() paginationDto: PaginationDto) {
    return this.appClient.send('event.findAll', paginationDto);
  }

  @Get(':id')
  @Roles('SYS', 'FAC')
  findOneEvent(@Param('id', ParseIntPipe) id: number) {
    return this.appClient.send('event.findOne', { id });
  }

  @Patch(':id')
  @Roles('SYS', 'FAC')
  @UseInterceptors(FileInterceptor('eventImage'))
  @UsePipes(new ValidationPipe({ transform: true }))
  updateEvent(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventDto: UpdateEventDto,
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 5, // 5MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: false,
        }),
    )
    file?: Express.Multer.File,
  ) {
    let serializedFile: SerializedFile | undefined;

    if (file) {
      serializedFile = {
        buffer: file.buffer.toString('base64'),
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
        encoding: file.encoding,
      };
    }

    return this.appClient.send('event.update', {
      id,
      updateEventDto,
      file: serializedFile,
    });
  }

  @Patch(':id/status')
  @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  updateEventStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateEventStatusDto: UpdateEventStatusDto,
  ) {
    return this.appClient.send('event.updateStatus', {
      id,
      updateEventStatusDto,
    });
  }

  // CLIENT ENDPOINTS
  @Get('available/list')
  @Roles('CLI')
  findAvailableEvents(@UserId() userId: string) {
    return this.appClient.send('event.findAvailableEvents', { userId });
  }

  @Get('available/:id')
  @Roles('CLI')
  findAvailableEventById(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: string,
  ) {
    return this.appClient.send('event.findAvailableEventById', { id, userId });
  }
}
