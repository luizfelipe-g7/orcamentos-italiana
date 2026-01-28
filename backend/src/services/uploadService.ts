import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { env } from '../config/env';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Interface para o arquivo recebido do Multer
export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
  filename?: string; // Adicionado para compatibilidade com diskStorage
}

export const uploadService = {
  async upload(file: UploadedFile): Promise<string> {
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;

    // Se estiver em produção e tiver credenciais AWS, usa S3
    if (env.NODE_ENV === 'production' && env.AWS_ACCESS_KEY_ID) {
      return this.uploadToS3(file, fileName);
    }

    // Caso contrário, salva localmente (para dev/testes)
    return this.uploadLocal(file, fileName);
  },

  async uploadToS3(file: UploadedFile, fileName: string): Promise<string> {
    const s3Client = new S3Client({
      region: env.AWS_REGION,
      credentials: {
        accessKeyId: env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: env.AWS_SECRET_ACCESS_KEY!,
      },
    });

    await s3Client.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET_NAME,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
      })
    );

    return `https://${env.S3_BUCKET_NAME}.s3.${env.AWS_REGION}.amazonaws.com/${fileName}`;
  },

  async uploadLocal(file: UploadedFile, fileName: string): Promise<string> {
    const uploadDir = path.resolve(__dirname, '../../uploads');

    // Cria diretório se não existir
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, file.buffer);

    // Retorna URL relativa (que seria servida estaticamente)
    return `/uploads/${fileName}`;
  },
};
