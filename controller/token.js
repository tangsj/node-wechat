/**
 * Token 管理
 */
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const Token = {
  /**
   * weixin全局普通 access_token
   * token 需要全局缓存，2小时过期
   * 目前文件 读写使用的 是 同步操作，后期需要改为异步操作
   * 
   * @param {any} config weixin配置对象
   * @returns 
   */
  accessToken(config) {
    return new Promise((resolve, reject) => {
      // 缓存文件路径，文件名中通过appid 区分公众号
      const tokenFilePath = path.resolve(__dirname, `../cache/access_token_${config.appId}.json`);
      if (!fs.existsSync(tokenFilePath)) {
        // 文件不存在 先写入一个空文件
        fs.writeFileSync(tokenFilePath, '');
      }
      
      const fileContent = fs.readFileSync(tokenFilePath).toString();
      const token = JSON.parse(fileContent || '{}');

      // 判断 token 是否即将过期
      if (token.access_token) {
        const diff = (Date.now() - token.createTime) / 1000 | 0;
        if (diff < token.expires_in) {
          resolve(token);
          return;
        }
      }
      
      // 重新 获取 token
      axios.get('https://api.weixin.qq.com/cgi-bin/token', {
        params: {
          grant_type: 'client_credential',
          appid: config.appId,
          secret: config.appSecret,
        }
      }).then(res => {
        const data = res.data;
        // token 生成时间
        data.createTime = Date.now();
        // 缓存 data
        fs.writeFile(tokenFilePath, JSON.stringify(data), err => {
          if (err) {
            reject(err);
          }
          resolve(res.data);
        });
      }).catch(err => {
        reject(err)
      });
    });
  },
  /**
   * jsapi_ticket是公众号用于调用微信JS接口的临时票据
   * ticket 需要全局缓存，2小时过期
   * 
   * @param {any} config weixin配置对象
   * @returns 
   */
  jsapiTicket(config) {
    return new Promise((resolve, reject) => {
      // 缓存文件路径，文件名中通过appid 区分公众号
      const ticketFilePath = path.resolve(__dirname, `../cache/jsapi_ticket_${config.appId}.json`);
      if (!fs.existsSync(ticketFilePath)) {
        // 文件不存在 先写入一个空文件
        fs.writeFileSync(ticketFilePath, '');
      }
      
      const fileContent = fs.readFileSync(ticketFilePath).toString();
      const token = JSON.parse(fileContent || '{}');

      // 判断 ticket 是否即将过期
      if (token.ticket) {
        const diff = (Date.now() - token.createTime) / 1000 | 0;
        if (diff < token.expires_in) {
          resolve(token);
          return;
        }
      }

      Token.accessToken(config).then(accRes => {
        // 重新 获取 token
        axios.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket', {
          params: {
            access_token: accRes.access_token,
            type: 'jsapi',
          }
        }).then(res => {
          const data = res.data;
          // token 生成时间
          data.createTime = Date.now();
          // 缓存 data
          fs.writeFile(ticketFilePath, JSON.stringify(data), err => {
            if (err) {
              reject(err);
            }
            resolve(res.data);
          });
        }).catch(err => {
          reject(err)
        });
      });
    });
  }
}

module.exports = Token;
