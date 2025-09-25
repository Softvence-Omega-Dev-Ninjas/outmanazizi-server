import { diskStorage } from 'multer';
import { extname } from 'path';

export const storageConfig = (folder = './public/uploads') =>
  diskStorage({
    destination: folder,
    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = extname(file.originalname); // keeps dot + extension (.jpg, .png)
      callback(null, `${uniqueSuffix}${ext}`);
    },
  });
