import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Inject,
  ParseFilePipeBuilder,
  Put,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from 'src/common/decorators/current-user.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { USERS_SERVICE } from '../config/services';
import { UpdateBankInfoDto } from './dto/update-back-info.dto';
import { UpdateBillingInfoDto } from './dto/update-billing-info.dto';
import { UpdateContactInfoDto } from './dto/update-conteact-info.dto';

@Controller('user/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ProfileController {
  constructor(
    @Inject(USERS_SERVICE) private readonly userClient: ClientProxy,
  ) {}
  @Get()
  getUserProfile(@UserId() userId: string) {
    return this.userClient.send(
      { cmd: 'user.profile.getUserProfile' },
      { userId },
    );
  }

  @Put('/contact-info')
  updateContactInfo(
    @UserId() userId: string,
    @Body() updateContactInfoDto: UpdateContactInfoDto,
  ) {
    return this.userClient.send(
      { cmd: 'user.profile.updateContactInfo' },
      { userId, updateContactInfoDto },
    );
  }

  @Put('/billing-info')
  updateBillingInfo(
    @UserId() userId: string,
    @Body() updateBillingInfoDto: UpdateBillingInfoDto,
  ) {
    return this.userClient.send(
      { cmd: 'user.profile.updateBillingInfo' },
      { userId, updateBillingInfoDto },
    );
  }

  @Put('/bank-info')
  updateBankInfo(
    @UserId() userId: string,
    @Body() updateBankInfoDto: UpdateBankInfoDto,
  ) {
    return this.userClient.send(
      { cmd: 'user.profile.updateBankInfo' },
      { userId, updateBankInfoDto },
    );
  }

  @Put('/photo')
  @UseInterceptors(FileInterceptor('photo'))
  updatePhoto(
    @UserId() userId: string,
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
    photo: Express.Multer.File,
  ) {
    // Asegurar que el mimetype sea correcto
    let correctedMimetype = photo.mimetype;

    // Si el mimetype es incorrecto, intentar corregirlo basado en la extensión
    if (
      photo.mimetype === 'text/plain' ||
      !photo.mimetype.startsWith('image/')
    ) {
      const extension = photo.originalname.toLowerCase().split('.').pop();
      switch (extension) {
        case 'png':
          correctedMimetype = 'image/png';
          break;
        case 'jpg':
        case 'jpeg':
          correctedMimetype = 'image/jpeg';
          break;
        case 'webp':
          correctedMimetype = 'image/webp';
          break;
        case 'gif':
          correctedMimetype = 'image/gif';
          break;
        default:
          correctedMimetype = 'image/png'; // fallback
      }
    }

    const fileData = {
      file: {
        buffer: photo.buffer,
        originalname: photo.originalname,
        mimetype: correctedMimetype, // Usar el mimetype corregido
        size: photo.size,
      },
    };

    console.log('File data corrected:', {
      originalname: fileData.file.originalname,
      mimetype: fileData.file.mimetype,
      size: fileData.file.size,
    });

    return this.userClient.send(
      { cmd: 'user.profile.updatePhoto' },
      { userId, updatePhotoDto: fileData },
    );
  }
}
