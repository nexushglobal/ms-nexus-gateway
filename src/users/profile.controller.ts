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
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdateBankInfoDto } from './dto/update-back-info.dto';
import { UpdateBillingInfoDto } from './dto/update-billing-info.dto';
import { UpdateContactInfoDto } from './dto/update-conteact-info.dto';
import { UpdatePersonalInfoDto } from './dto/update-profile-info.dto';

@Controller('user/profile/')
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
  @Put('/personal-info')
  updatePersonalInfo(
    @UserId() userId: string,
    @Body() updatePersonalInfoDto: UpdatePersonalInfoDto,
  ) {
    return this.userClient.send(
      { cmd: 'user.profile.updatePersonalInfo' },
      { userId, updatePersonalInfoDto },
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
    const fileData = {
      file: {
        buffer: photo.buffer,
        originalname: photo.originalname,
        mimetype: photo.mimetype,
        size: photo.size,
      },
    };

    return this.userClient.send(
      { cmd: 'user.profile.updatePhoto' },
      { userId, updatePhotoDto: fileData },
    );
  }

  @Put('/change-password')
  changePassword(
    @UserId() userId: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    return this.userClient.send(
      { cmd: 'user.changePassword' },
      {
        userId,
        currentPassword: changePasswordDto.currentPassword,
        newPassword: changePasswordDto.newPassword,
      },
    );
  }
}
