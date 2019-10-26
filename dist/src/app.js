"use strict";

var _express = _interopRequireDefault(require("express"));

var _mongoose = _interopRequireDefault(require("mongoose"));

var _bodyParser = _interopRequireDefault(require("body-parser"));

var _cors = _interopRequireDefault(require("cors"));

var _index = _interopRequireDefault(require("../src/routes/index.routes"));

var _notification = require("../src/services/notification.service");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var app = (0, _express.default)();
app.use(_bodyParser.default.json({
  limit: '50mb',
  extended: true
}));
app.use(_bodyParser.default.urlencoded({
  limit: '50mb',
  extended: true
}));
app.use(_express.default.json());
app.use((0, _cors.default)()); // mount all routes on /api path

app.use('/api', (0, _index.default)()); // connect to mongo db
// const mongoUri = 'mongodb://scruits:scruitsdb@scruits-shard-00-00-osfrr.mongodb.net:27017,scruits-shard-00-01-osfrr.mongodb.net:27017,scruits-shard-00-02-osfrr.mongodb.net:27017/scruitdb?ssl=true&replicaSet=scruits-shard-0&authSource=admin&retryWrites=true;'

var mongoUri = 'mongodb://scruits:scruitsdb@scruits-shard-00-00-osfrr.mongodb.net:27017,scruits-shard-00-01-osfrr.mongodb.net:27017,scruits-shard-00-02-osfrr.mongodb.net:27017/scruitsdb_test?ssl=true&replicaSet=scruits-shard-0&authSource=admin&retryWrites=true;';

_mongoose.default.connect(mongoUri, {
  useNewUrlParser: true
});

_mongoose.default.connection.on('error', function () {
  throw new Error("unable to connect to database: ".concat(mongoUri));
});

(0, _notification.runSendNotification)();
app.listen(3000);
console.log('app running on port ', 3000);
//# sourceMappingURL=app.js.map
