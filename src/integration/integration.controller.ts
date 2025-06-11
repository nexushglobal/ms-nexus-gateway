import {
  Controller,
  Post,
  Body,
  Inject,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';
import { INTEGRATION_SERVICE } from '../config/services';

@Controller('integration')
export class IntegrationController {
  constructor(
    @Inject(INTEGRATION_SERVICE)
    private readonly integrationClient: ClientProxy,
  ) {}

  @Post('email/send')
  sendEmail(@Body() emailData: any): Observable<any> {
    return this.integrationClient.send(
      { cmd: 'integration.email.send' },
      emailData,
    );
  }

  @Post('files/upload')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ): Observable<any> {
    const fileData = {
      file: {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
      },
      folder: body.folder || 'uploads',
    };

    return this.integrationClient.send(
      { cmd: 'integration.files.upload' },
      fileData,
    );
  }

  @Post('document/validate')
  validateDocument(@Body() documentData: any): Observable<any> {
    return this.integrationClient.send(
      { cmd: 'integration.document.validateDocument' },
      documentData,
    );
  }

  @Post('health')
  async getIntegrationHealth(): Promise<any> {
    const emailHealth$ = this.integrationClient.send(
      { cmd: 'integration.email.health' },
      {},
    );
    const filesHealth$ = this.integrationClient.send(
      { cmd: 'integration.files.health' },
      {},
    );

    return {
      email: await emailHealth$.toPromise(),
      files: await filesHealth$.toPromise(),
    };
  }
}
