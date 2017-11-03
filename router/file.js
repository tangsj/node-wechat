/**
 * 文件系统处理
 * @type {Object}
 */
const express = require('express');
const filesystem = require('../controller/filesystem');

const router = express.Router();

router.get('/', (req, res) => {
  res.send('File System');
});

router.post('/single', filesystem.single);

module.exports = router;
