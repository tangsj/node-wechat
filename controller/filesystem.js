/**
 * 文件系统处理
 * @type {Object}
 */
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const md5 = require('md5');
const util = require('../utils');

/**
 * 自定义存储
 */
const storage = multer.diskStorage({
  destination(req, file, cb) {
    if (!req.body.type) {
      // 未指定上传文件类型  上传到 默认目录
      req.body.type = 'default';
    }
    const filepath = path.join('.', 'uploads', req.body.type);
    if (!fs.existsSync(filepath)) {
      fs.mkdirSync(filepath);
    }
    cb(null, filepath);
  },
  filename(req, file, cb) {
    const ext = util.getExt(file.originalname);
    cb(null, `${Date.now()}-${md5(file.originalname).substr(0, 5)}.${ext}`);
  },
});

/**
 * 文件上传参数
 * @type {[type]}
 */
const upload = multer({
  storage,
});

/**
 * 单文件上传 
 * 文件名称：file
 */
const singleUpload = upload.single('file');

module.exports = {
  single(req, res) {
    // 单文件上传
    singleUpload(req, res, (e, data) => {
      if (e) {
        // 发生错误
        res.json({
          code: 500,
          message: e.message,
        });
        return;
      }
      res.json({
        code: 200,
        message: '文件上传成功',
        data: {
          path: req.file.path,
          originalname: req.file.originalname,
        }
      });
    });
  },
};
