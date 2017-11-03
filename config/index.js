/**
 * APP 配置信息
 * @type {Object}
 */
const Config = {
  port: 3000, // 服务运行端口
  wx: { // 多公众号配置 
    fcbk: {
      appId: '',
      appSecret: '',
    }
  },
  db: { // 数据库配置信息 可以配置多台服务器及多个数据库
    tangsj: {
      host: 'ip',
      user: 'root',
      pass: '',
      database: ['databasename'],
    },
  },
};

module.exports = Config;
