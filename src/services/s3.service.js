import AWS from 'aws-sdk';
import multer from 'multer';
import multerS3 from 'multer-s3';

AWS.config.update({
  secretAccessKey: 'pjHApekXBaP6F6pqSBAJ1yCBeJ/SEjnjI8w+znZ3',
  accessKeyId: 'AKIAIE6D3FAD22QDBA4A',
  region: 'us-east-1'
});

const s3 = new AWS.S3();

const getExtension = (file) => {
  return file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
}

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
}

export const upload = multer({
  fileFilter,
  storage: multerS3({
    acl: 'public-read',
    s3,
    bucket: 'scruitsbucket',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'TESTING_METADATA'});
    },
    key: function (req, file, cb) {
      cb(null, Math.floor(Date.now() / 1000).toString() + Math.floor(Math.random()*1000).toString() + getExtension(file))
    }
  })
});