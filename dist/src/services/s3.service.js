"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.upload = void 0;

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

var _multer = _interopRequireDefault(require("multer"));

var _multerS = _interopRequireDefault(require("multer-s3"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_awsSdk.default.config.update({
  secretAccessKey: 'pjHApekXBaP6F6pqSBAJ1yCBeJ/SEjnjI8w+znZ3',
  accessKeyId: 'AKIAIE6D3FAD22QDBA4A',
  region: 'us-east-1'
});

var s3 = new _awsSdk.default.S3();

var getExtension = function getExtension(file) {
  return file.mimetype === 'image/jpeg' ? '.jpg' : '.png';
};

var fileFilter = function fileFilter(req, file, cb) {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type, only JPEG and PNG is allowed!'), false);
  }
};

var upload = (0, _multer.default)({
  fileFilter: fileFilter,
  storage: (0, _multerS.default)({
    acl: 'public-read',
    s3: s3,
    bucket: 'scruitsbucket',
    metadata: function metadata(req, file, cb) {
      cb(null, {
        fieldName: 'TESTING_METADATA'
      });
    },
    key: function key(req, file, cb) {
      cb(null, Math.floor(Date.now() / 1000).toString() + Math.floor(Math.random() * 1000).toString() + getExtension(file));
    }
  })
});
exports.upload = upload;
//# sourceMappingURL=s3.service.js.map
