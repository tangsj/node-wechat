/**
 * 微信API路由处理
 * @type {Object}
 */
const express = require('express');

const weixin = require('../../controller/weixin')

const router = express.Router();

router.get('/', (req, res) => {
  res.send('weixin server');
});

/**
 * 授权地址重定向
 */
router.get('/redirect', weixin.redirect);

/**
 * 拉取用户信息
 */
router.get('/auth', weixin.auth);

/**
 * 获取jsapi签名
 */
router.post('/jsapi', weixin.jsapi);

/**
 * 媒体文件下载
 */
router.get('/media/download', weixin.mediaDownload)

module.exports = router;
