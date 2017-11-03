/**
 * 根路由处理
 * @type {Object}
 */
const express = require('express');
const file = require('./file');
const wx = require('./wx');

const router = express.Router();

// 设置跨域访问
router.all('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  res.header('X-Powered-By', 'codecook');
  next();
});

router.use('/file', file);
router.use('/wx', wx);

module.exports = router;
