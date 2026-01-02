import { DeleteObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from './s3.client';

export async function deleteFileFromS3(fileUrl: string): Promise<boolean> {
  try {
    const url = new URL(fileUrl);
    const key = url.pathname.substring(1);

    const deleteCommand = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET!,
      Key: key,
    });

    await s3Client.send(deleteCommand);
    console.log(`Successfully deleted file from S3: ${key}`);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
}
