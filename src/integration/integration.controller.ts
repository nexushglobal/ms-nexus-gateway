import {
  Body,
  Controller,
  Inject,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { FileInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { Public } from 'src/common/decorators/public.decorator';
import { INTEGRATION_SERVICE } from '../config/services';
import { DocumentDto } from './dto/validate-document.dto';

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
  @Public()
  validateDocument(@Body() documentData: DocumentDto) {
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
