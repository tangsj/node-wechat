const fs = require('fs');
const path = require('path');
const axios = require('axios');
const config = require('../config');
const utils = require('../utils');
const token = require('./token');
const CryptoJs = require('crypto-js');
const jsSHA = require('jssha');
const ffmpeg = require('ffmpeg');

const WX = {
  /**
   * 授权地址重定向
   * @param url 重定向url地址。需要进行url编码
   * @param type 授权类型 snsapi_base（隐式授权） snsapi_userinfo（显示授权）
   * @param pro 微信配置对象名称， 在 config.wx 下配置
   * 请求示例： http://api.tangsj.com/wx/redirect?url=http%3A%2F%2Fweixin.tangsj.com%2Findex.html%3Fparams1%3D1%26params%3D2&pro=fcbk
   */
  redirect(req, res) {
    let url = req.query.url;
    const type = req.query.type || 'snsapi_userinfo';
    const pro = req.query.pro;
  
    if (!url) {
      res.send('请提供授权回调地址');
      return;
    }
  
    if (!pro) {
      res.send('未指定项目微信配置对象名称');
      return;
    }
  
    const wxconfig = config.wx[pro];

    if (!wxconfig) {
      res.send('微信配置对象未找到');
      return;
    }
  
    url = decodeURIComponent(url);
    const urlArr = url.split('?');
    url = urlArr[0];
  
    const params = encodeURIComponent(`${urlArr[1]}&pro=${pro}`);
    const authUrl = encodeURIComponent(`http://api.tangsj.com/wx/auth?callback=${url}`);
  
    const codeUrl = `https://open.weixin.qq.com/connect/oauth2/authorize?appid=${wxconfig.appId}&redirect_uri=${authUrl}&response_type=code&scope=${type}&state=${params}#wechat_redirect`;
    res.redirect(codeUrl.trim());
  },
  /**
   * 拉取用户信息
   * 通过 code 换取用户信息
   */
  auth(req, res) {
    const callback = req.query.callback;
    const code = req.query.code;
    const state = req.query.state;

    if (!callback || !code || !state) {
      res.send('参数错误！');
      return;
    }

    const stateObj = utils.queryStringToObject(state);

    const wxconfig = config.wx[stateObj.pro];
    
    if (!wxconfig) {
      res.send('微信配置对象未找到');
      return;
    }

    /* 跳转 */
    function redirect(data) {
      const params = Object.assign(data, stateObj);
      res.redirect(`${callback}?${utils.buildQueryString(params)}`);
    }

    WX._getToken(code, wxconfig).then(data => {
      if (data.scope === 'snsapi_base') { // （隐式授权, 授权到这里就结束了）
        redirect({
          openid: data.openid
        });
      } else {
        WX._getInfo(data.access_token, data.openid).then(info => {
          redirect(info);
        }, error => {
          res.send(error);
        });
      }
    }, error => {
      res.send(error);
    });
  },
  /**
   * 获取jsapi签名
   * 
   */
  jsapi(req, res) {
    const url = req.body.url;
    const pro = req.body.pro;
  
    if (!url) {
      res.send('请提供当前网页的URL');
      return;
    }
  
    if (!pro) {
      res.send('未指定项目微信配置对象名称');
      return;
    }
  
    const wxconfig = config.wx[pro];

    if (!wxconfig) {
      res.send('微信配置对象未找到');
      return;
    }
    
    token.jsapiTicket(wxconfig).then(response => {
      // 对所有待签名参数按照字段名的ASCII 码从小到大排序（字典序）后
      const signatureObj = {
        jsapi_ticket: response.ticket,
        noncestr: utils.randomString(11),
        timestamp: (Date.now() / 1000 | 0) + '',
        url: url,
      }
      const signatureStr = utils.raw(signatureObj);
      
      var shaObj = new jsSHA("SHA-1", "TEXT");
      shaObj.update(signatureStr);

      res.json({
        url: url,
        appId: wxconfig.appId, // 必填，公众号的唯一标识
        timestamp: signatureObj.timestamp, // 必填，生成签名的时间戳
        nonceStr: signatureObj.noncestr, // 必填，生成签名的随机串
        signature: shaObj.getHash("HEX"),// 必填，签名，见附录1
      });
    });
  },
  /**
   * 媒体文件下载保存到服务器
   * 
   * @param {any} req 
   * @param {any} res 
   */
  mediaDownload(req, res) {
    const media_id = req.query.media_id;
    const pro = req.query.pro;

    if (!media_id) {
      res.send('请提供下载media_id');
      return;
    }
  
    if (!pro) {
      res.send('未指定项目微信配置对象名称');
      return;
    }
  
    const wxconfig = config.wx[pro];

    if (!wxconfig) {
      res.send('微信配置对象未找到');
      return;
    }

    token.accessToken(wxconfig).then(t => {
      const fileFolder = path.resolve(__dirname, '../media', wxconfig.appId);
      const fileName = media_id + '.amr';
      const mp3Name = media_id + '.mp3';
      const filePath = path.join(fileFolder, fileName);
      const mp3FilePath = path.join(fileFolder, mp3Name);

      function createFile() {
        if (!fs.existsSync(filePath)) { // 音频文件是否存在
          fs.writeFile(filePath, '', err => {
            if (err) {
              res.status(500).send('服务器错误');
              return
            }
            download();
          });
        } else {
          download();
        }
      }

      if (!fs.existsSync(fileFolder)) { // 判断appid对应目录是否存在
        fs.mkdir(fileFolder, err => {
          if (err) {
            res.status(500).send('服务器错误');
            return
          }
          createFile();
        });
      } else {
        createFile();
      }

      function download() {
        axios.get('https://api.weixin.qq.com/cgi-bin/media/get', {
          params: {
            access_token: t.access_token,
            media_id: media_id,
          },
          responseType: 'stream',
        }).then(mediaRes => {
          const writer = fs.createWriteStream(filePath);
          writer.on('pipe', () => {
          });
          writer.on('finish', () => {
            console.log('文件写完了。开始转换mp3');
            WX._mp3Converter(filePath, mp3FilePath).then(() => {
              res.json({
                code: 200,
                message: '文件下载到服务成功',
                data: {
                  filename: mp3Name,
                }
              });
            }, (err) => {
              res.json({
                code: 500,
                message: '文件下载到服务失败',
                data: err,
              });
            });
          });

          mediaRes.data.pipe(writer);
        });
      }
    });
  },
  /**
   * 将amr 转换为 mp3
   */
  _mp3Converter(amrpath, mp3path) {
    return new Promise((resolve, reject) => {
      // 得用ffmpeg 将 amr 转换为 mp3
      try {
        var process = new ffmpeg(amrpath);
        process.then(function (voice) {
          voice.fnExtractSoundToMP3(mp3path, function (error, file) {
            if (!error) {
              resolve();
            } else {
              reject(error);
            }
          });
        }, function (err) {
          reject(err);
        });
      } catch (e) {
        reject(e.msg);
      }
    });
  },
  /* 获取 授权 access_token， 这个和 普通access_token是不一样的 */
  _getToken(code, wxconfig) {
    return new Promise((resolve, reject) => {
      const url = 'https://api.weixin.qq.com/sns/oauth2/access_token';
      const token = axios.get(url, {
        params: {
          appid: wxconfig.appId,
          secret: wxconfig.appSecret,
          code: code,
          grant_type: 'authorization_code',
        }
      });
  
      token.then(response => {
        resolve(response.data);
      }).catch(error => {
        reject('access_token获取失败！');
      });
    });
  },
  /**
   * 显示授权获取用户信息
   */
  _getInfo(token, openid) {
    return new Promise((resolve, reject) => {
      const url = 'https://api.weixin.qq.com/sns/userinfo';
      const info = axios.get(url, {
        params: {
          access_token: token,
          openid: openid,
          lang: 'zh_CN',
        }
      });
      info.then(response => {
        resolve(response.data);
      }).catch(error => {
        reject('用户信息获取失败！');
      });
    });
  },
}

module.exports = WX;
