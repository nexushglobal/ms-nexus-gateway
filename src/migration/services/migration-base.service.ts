import { BadRequestException, Injectable } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { Observable } from 'rxjs';

export interface FileValidationOptions {
  requiredExtensions?: string[];
  maxFiles?: number;
  exactFiles?: number;
  requiredFilePatterns?: string[];
}

export interface MigrationCommand {
  cmd: string;
  data: any;
}

@Injectable()
export class MigrationBaseService {
  /**
   * Valida un archivo único JSON
   */
  validateSingleJsonFile(
    file: Express.Multer.File,
    entityName: string,
  ): Express.Multer.File {
    if (!file) {
      throw new BadRequestException(
        `Se requiere un archivo JSON con los datos de ${entityName}`,
      );
    }

    if (!file.originalname.toLowerCase().endsWith('.json')) {
      throw new BadRequestException('El archivo debe ser de tipo JSON');
    }

    return file;
  }

  /**
   * Valida múltiples archivos con patrones específicos
   */
  validateMultipleFiles(
    files: Express.Multer.File[],
    options: FileValidationOptions,
  ): { [key: string]: Express.Multer.File } {
    const { exactFiles, requiredFilePatterns } = options;

    if (!files || (exactFiles && files.length !== exactFiles)) {
      throw new BadRequestException(
        `Se requieren exactamente ${exactFiles} archivos: ${requiredFilePatterns?.join(', ')}`,
      );
    }

    const foundFiles: { [key: string]: Express.Multer.File } = {};

    if (requiredFilePatterns) {
      for (const pattern of requiredFilePatterns) {
        const file = files.find((f) =>
          f.originalname.toLowerCase().includes(pattern.toLowerCase()),
        );

        if (!file) {
          throw new BadRequestException(
            `Los archivos deben contener "${pattern}" en sus nombres`,
          );
        }

        foundFiles[pattern] = file;
      }
    }

    return foundFiles;
  }

  /**
   * Parsea un archivo JSON y valida que sea un array
   */
  parseJsonArrayFromFile(file: Express.Multer.File, entityName: string): any[] {
    try {
      const data = JSON.parse(file.buffer.toString('utf8'));

      if (!Array.isArray(data)) {
        throw new BadRequestException(
          `El archivo JSON debe contener un array de ${entityName}`,
        );
      }

      return data;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException('El archivo JSON tiene formato inválido');
      }
      throw new BadRequestException(
        `Error procesando archivo: ${error.message}`,
      );
    }
  }

  /**
   * Parsea múltiples archivos JSON
   */
  parseMultipleJsonFiles(files: { [key: string]: Express.Multer.File }): {
    [key: string]: any;
  } {
    const parsedData: { [key: string]: any } = {};

    try {
      for (const [key, file] of Object.entries(files)) {
        parsedData[key] = JSON.parse(file.buffer.toString('utf8'));
      }

      return parsedData;
    } catch (error) {
      if (error instanceof SyntaxError) {
        throw new BadRequestException(
          'Uno o más archivos JSON tienen formato inválido',
        );
      }
      throw new BadRequestException(
        `Error procesando archivos: ${error.message}`,
      );
    }
  }

  /**
   * Envía comando a microservicio
   */
  sendMigrationCommand(
    client: ClientProxy,
    command: MigrationCommand,
  ): Observable<any> {
    return client.send({ cmd: command.cmd }, command.data);
  }

  /**
   * Migración de archivo único - patrón completo
   */
  migrateSingleFileArray(
    client: ClientProxy,
    file: Express.Multer.File,
    entityName: string,
    command: string,
    dataKey: string,
  ): Observable<any> {
    console.log(`Archivo de ${entityName} recibido:`, file?.originalname);

    // Validar archivo
    this.validateSingleJsonFile(file, entityName);

    // Parsear y validar contenido
    const data = this.parseJsonArrayFromFile(file, entityName);

    // Enviar comando
    return this.sendMigrationCommand(client, {
      cmd: command,
      data: { [dataKey]: data },
    });
  }
}
