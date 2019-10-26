import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import cors from 'cors';
import routes from '../src/routes/index.routes'
import {runSendNotification} from '../src/services/notification.service'

const app = express()

app.use(bodyParser.json({limit: '50mb', extended: true}));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

app.use(express.json())

app.use(cors());

// mount all routes on /api path
app.use('/api', routes());

// connect to mongo db
// const mongoUri = 'mongodb://scruits:scruitsdb@scruits-shard-00-00-osfrr.mongodb.net:27017,scruits-shard-00-01-osfrr.mongodb.net:27017,scruits-shard-00-02-osfrr.mongodb.net:27017/scruitdb?ssl=true&replicaSet=scruits-shard-0&authSource=admin&retryWrites=true;'
const mongoUri = 'mongodb://scruits:scruitsdb@scruits-shard-00-00-osfrr.mongodb.net:27017,scruits-shard-00-01-osfrr.mongodb.net:27017,scruits-shard-00-02-osfrr.mongodb.net:27017/scruitsdb_test?ssl=true&replicaSet=scruits-shard-0&authSource=admin&retryWrites=true;'
mongoose.connect(mongoUri, {useNewUrlParser: true});
mongoose.connection.on('error', () => {
  throw new Error(`unable to connect to database: ${mongoUri}`);
});

runSendNotification()

app.listen(3000)

console.log('app running on port ', 3000);