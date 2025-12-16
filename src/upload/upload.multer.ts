import multerS3 from 'multer-s3';
import { s3Client } from '../libs/s3/s3.client';
import { extname } from 'path';

export const multerS3Config = {
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.AWS_S3_BUCKET!,
    acl: process.env.AWS_S3_API_ACL as any,
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      const fileName = `${Date.now()}-${file.originalname}`;
      const folder = file.mimetype === 'application/pdf' ? 'absent/pdf' : 'absent/images';
      cb(null, `${folder}/${fileName}`);
    },
  }),

//   --- VALIDATION MAX FILE ---
  limits: {
    fileSize: 5 * 1024 * 1024, 
  },

  // --- VALIDATION MIMETYPE ---
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes = [
      'image/png',
      'image/jpeg',
      'image/jpg',
      'application/pdf',
    ];

    // --- VALIDATION EXTENSIONS --
    const allowedExt = ['.png', '.jpg', '.jpeg', '.pdf'];
    const ext = extname(file.originalname).toLowerCase();

    if (!allowedMimeTypes.includes(file.mimetype) || !allowedExt.includes(ext)) {
      return cb(
        new Error(
          'Invalid file type. Only PNG, JPG, JPEG, and PDF are allowed.',
        ),
        false,
      );
    }

    cb(null, true);
  },
};
