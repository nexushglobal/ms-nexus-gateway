import {
  Body,
  Controller,
  Delete,
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
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { Roles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { ORDER_SERVICE } from 'src/config/services';
import { AddBenefitDto } from '../dto/add-benefit.dto';
import { CreateProductDto } from '../dto/create-product.dto';
import { FindProductsClientDto } from '../dto/find-products-client.dto';
import { FindProductsDto } from '../dto/find-products.dto';
import { RemoveBenefitDto } from '../dto/remove-benefit.dto';
import { UpdateImageDto, UpdateProductDto } from '../dto/update-product.dto';
import { SerializedFile } from '../interfaces/serialized-file.interface';

@Controller('products')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProductsController {
  constructor(
    @Inject(ORDER_SERVICE)
    private readonly orderClient: ClientProxy,
  ) {}

  @Post()
  @Roles('SYS', 'FAC')
  @UseInterceptors(FilesInterceptor('productImages', 5))
  @UsePipes(new ValidationPipe({ transform: true }))
  createProduct(
    @UserId() userId: string,
    @Body() createProductDto: CreateProductDto,
    @UploadedFiles(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: /(jpg|jpeg|png|webp)$/,
        })
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 2, // 2MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    files: Array<Express.Multer.File> = [],
  ) {
    const serializedFiles = files.map((file) => ({
      buffer: file.buffer.toString('base64'),
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
    }));

    return this.orderClient.send(
      { cmd: 'products.create' },
      {
        createProductDto,
        files: serializedFiles,
        userId,
      },
    );
  }

  @Get()
  @Roles('SYS', 'FAC')
  findAll(@Query() findProductsDto: FindProductsDto) {
    return this.orderClient.send({ cmd: 'products.findAll' }, findProductsDto);
  }

  @Get('clients/list')
  @Roles('CLI')
  findAllForClients(
    @UserId() userId: string,
    @Query() findProductsClientDto: FindProductsClientDto,
  ) {
    return this.orderClient.send(
      { cmd: 'products.findAllWithClients' },
      { userId, ...findProductsClientDto },
    );
  }

  @Get(':id')
  @Roles('SYS', 'FAC')
  findOne(@Param('id') id: number) {
    return this.orderClient.send({ cmd: 'products.findOne' }, { id });
  }

  @Get(':id/client')
  @Roles('CLI')
  findOneWithClients(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: string,
  ) {
    return this.orderClient.send(
      { cmd: 'products.findOneWithClients' },
      { id, userId },
    );
  }

  @Get(':id/clients')
  @Roles('SYS', 'FAC', 'CLI')
  findOnWithClients(
    @Param('id', ParseIntPipe) id: number,
    @UserId() userId: string,
  ) {
    return this.orderClient.send({ cmd: 'products.findOne' }, { id, userId });
  }

  @Patch(':id')
  @Roles('SYS', 'FAC')
  updateProduct(
    @Param('id') id: number,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.orderClient.send(
      { cmd: 'products.update' },
      { productId: id, ...updateProductDto },
    );
  }

  @Get('list/sku-and-name')
  @Roles('SYS', 'FAC')
  findSkuAndName() {
    return this.orderClient.send({ cmd: 'products.findAllWithSkuAndName' }, {});
  }

  @Post(':id/images')
  @Roles('SYS', 'FAC')
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(new ValidationPipe({ transform: true }))
  addImageToProduct(
    @Param('id', ParseIntPipe) id: number,
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
    const serializedFile = {
      buffer: file.buffer.toString('base64'),
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
    };

    return this.orderClient.send(
      { cmd: 'products.addImage' },
      {
        productId: id,
        file: serializedFile,
      },
    );
  }

  @Patch(':productId/images/:imageId')
  @Roles('SYS', 'FAC')
  @UseInterceptors(FileInterceptor('image'))
  @UsePipes(new ValidationPipe({ transform: true }))
  updateProductImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body() updateImageDto: UpdateImageDto,
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

    if (file)
      serializedFile = {
        buffer: file.buffer.toString('base64'),
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldname: file.fieldname,
        encoding: file.encoding,
      };
    return this.orderClient.send(
      { cmd: 'products.updateImage' },
      {
        productId,
        imageId,
        updateImageDto,
        file: serializedFile,
      },
    );
  }

  @Delete(':productId/images/:imageId')
  @Roles('SYS', 'FAC')
  deleteProductImage(
    @Param('productId', ParseIntPipe) productId: number,
    @Param('imageId', ParseIntPipe) imageId: number,
  ) {
    return this.orderClient.send(
      { cmd: 'products.deleteImage' },
      {
        productId,
        imageId,
      },
    );
  }

  @Post('validate-stock-excel')
  @Roles('SYS', 'FAC')
  @UseInterceptors(FileInterceptor('file'))
  @UsePipes(new ValidationPipe({ transform: true }))
  validateStockExcel(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: 1024 * 1024 * 10, // 10MB
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
          fileIsRequired: true,
        }),
    )
    file: Express.Multer.File,
  ) {
    const serializedFile = {
      buffer: file.buffer.toString('base64'),
      originalname: file.originalname,
      mimetype: file.mimetype,
      size: file.size,
      fieldname: file.fieldname,
      encoding: file.encoding,
    };

    return this.orderClient.send(
      { cmd: 'products.validateStockExcel' },
      {
        file: serializedFile,
      },
    );
  }

  @Post(':id/benefits')
  // @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  addBenefit(
    @Param('id', ParseIntPipe) productId: number,
    @Body() body: AddBenefitDto,
  ) {
    return this.orderClient.send(
      { cmd: 'products.addBenefit' },
      { productId, benefit: body.benefit },
    );
  }

  @Delete(':id/benefits')
  // @Roles('SYS', 'FAC')
  @UsePipes(new ValidationPipe({ transform: true }))
  removeBenefit(
    @Param('id', ParseIntPipe) productId: number,
    @Body() body: RemoveBenefitDto,
  ) {
    return this.orderClient.send(
      { cmd: 'products.removeBenefit' },
      { productId, benefit: body.benefit },
    );
  }
}
