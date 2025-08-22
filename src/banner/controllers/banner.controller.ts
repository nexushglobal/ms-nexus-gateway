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
  Put,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Public } from '../../common/decorators/public.decorator';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto } from '../../common/dto/pagination.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { APP_SERVICE } from '../../config/services';
import { CreateBannerDto } from '../dto/create-banner.dto';
import { OrderBannersDto } from '../dto/order-banners.dto';
import { UpdateBannerDto } from '../dto/update-banner.dto';
import { SerializedFile } from '../interfaces/serialized-file.interface';

@Controller('banners')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BannerController {
  constructor(
    @Inject(APP_SERVICE)
    private readonly appClient: ClientProxy,
  ) {}

  @Post()
  @Roles('FAC')
  @UseInterceptors(FileInterceptor('bannerImage'))
  @UsePipes(new ValidationPipe({ transform: true }))
  createBanner(
    @Body() createBannerDto: CreateBannerDto,
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

    return this.appClient.send('banner.create', {
      createBannerDto,
      file: serializedFile,
    });
  }

  @Get()
  @Roles('FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  findAllBanners(@Query() paginationDto: PaginationDto) {
    return this.appClient.send('banner.findAll', paginationDto);
  }

  @Patch(':id')
  @Roles('FAC')
  @UseInterceptors(FileInterceptor('bannerImage'))
  @UsePipes(new ValidationPipe({ transform: true }))
  updateBanner(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateBannerDto: UpdateBannerDto,
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
          fileIsRequired: false, // Opcional para update
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

    return this.appClient.send('banner.update', {
      id,
      updateBannerDto,
      file: serializedFile,
    });
  }

  @Put('list/order')
  @Roles('FAC')
  @UsePipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  )
  orderBanners(@Body() orderBannersDto: OrderBannersDto) {
    console.log(
      'OrderBannersDto received:',
      JSON.stringify(orderBannersDto, null, 2),
    );
    return this.appClient.send('banner.order', orderBannersDto);
  }

  @Get('active')
  @Public()
  @Roles('CLI')
  findActiveBanners() {
    return this.appClient.send('banner.findActiveOnly', {});
  }
}
