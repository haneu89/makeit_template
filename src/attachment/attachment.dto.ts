export class AttachmentDto {
  fileName: string;
  fileSize: number;
  mime: string;
  savedName?: string;
  realPath?: string;
  storage?: string;
  file?: Express.Multer.File;
  viewRole?: 'ADMIN' | 'MANAGER' | 'USER' | null;

  static getFileUrl(savedName: string): string {
    return `${process.env.NEXT_PUBLIC_APP_URL}/api/file/${savedName}`;
  }
}

export class AttachmentResponseDto extends AttachmentDto {
  id: number;
  createdAt: Date;
  updatedAt: Date;
  fileUrl: string;
  viewRole?: 'ADMIN' | 'MANAGER' | 'USER' | null;

  static fromEntity(entity: any): AttachmentResponseDto {
    return {
      ...entity,
      fileUrl: AttachmentDto.getFileUrl(entity.savedName),
    };
  }
} 