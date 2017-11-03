/**
 * 程序主入口
 * @author tangsj
 */
const colors = require('colors');
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const router = require('./router');
const config = require('./config');
const db = require('./database');

const app = express();

/**
 * db middleware
 */
app.use((req, res, next) => {
  req.getConnection = db.getConnection;
  next();
});

app.use(express.static('./public'));
app.use(express.static('./media'));
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded

/**
 * 路由挂载
 * @type {[type]}
 */
app.use('/', router);

// 捕获 404
app.use((req, res, next) => {
  const err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  // render the error page
  res.status(err.status || 500);
  res.send(err.message);
});

const server = app.listen(config.port, () => {
  console.warn(`app listening at port: ${config.port}`.green);
});
