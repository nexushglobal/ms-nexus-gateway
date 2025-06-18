import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';

@Injectable()
export class FileTypeFixInterceptor implements NestInterceptor {
  private readonly logger = new Logger(FileTypeFixInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    if (request.file) {
      this.fixMimeType(request.file);
      this.logger.debug(
        `Fixed mimetype for file: ${request.file.originalname}`,
      );
    }

    if (request.files) {
      if (Array.isArray(request.files)) {
        request.files.forEach((file) => this.fixMimeType(file));
        this.logger.debug(`Fixed mimetypes for ${request.files.length} files`);
      } else {
        Object.values(request.files).forEach((files: any) => {
          if (Array.isArray(files)) {
            files.forEach((file) => this.fixMimeType(file));
          } else {
            this.fixMimeType(files);
          }
        });
      }
    }

    return next.handle();
  }

  private fixMimeType(file: Express.Multer.File): void {
    const originalMimetype = file.mimetype;

    if (this.shouldFixMimeType(file)) {
      const extension = file.originalname.toLowerCase().split('.').pop();
      const correctedMimeType = this.getMimeTypeFromExtension(extension);

      if (correctedMimeType) {
        file.mimetype = correctedMimeType;
        this.logger.warn(
          `Corrected mimetype for ${file.originalname}: ${originalMimetype} -> ${correctedMimeType}`,
        );
      }
    }
  }

  private shouldFixMimeType(file: Express.Multer.File): boolean {
    return (
      file.mimetype === 'text/plain' ||
      file.mimetype === 'application/octet-stream' ||
      !file.mimetype ||
      (this.isImageFile(file.originalname) &&
        !file.mimetype.startsWith('image/'))
    );
  }

  private isImageFile(filename: string): boolean {
    const extension = filename.toLowerCase().split('.').pop();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'];
    return imageExtensions.includes(extension || '');
  }

  private getMimeTypeFromExtension(
    extension: string | undefined,
  ): string | null {
    if (!extension) return null;

    const mimeTypeMap: Record<string, string> = {
      // Imágenes
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      gif: 'image/gif',
      webp: 'image/webp',
      bmp: 'image/bmp',
      svg: 'image/svg+xml',
      ico: 'image/x-icon',

      // Documentos
      pdf: 'application/pdf',
      doc: 'application/msword',
      docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      xls: 'application/vnd.ms-excel',
      xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ppt: 'application/vnd.ms-powerpoint',
      pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',

      // Audio
      mp3: 'audio/mpeg',
      wav: 'audio/wav',
      ogg: 'audio/ogg',

      // Video
      mp4: 'video/mp4',
      avi: 'video/x-msvideo',
      mov: 'video/quicktime',

      // Comprimidos
      zip: 'application/zip',
      rar: 'application/x-rar-compressed',
      '7z': 'application/x-7z-compressed',

      // Texto
      txt: 'text/plain',
      csv: 'text/csv',
      json: 'application/json',
      xml: 'application/xml',
      html: 'text/html',
      css: 'text/css',
      js: 'application/javascript',
    };

    return mimeTypeMap[extension.toLowerCase()] || null;
  }
}
