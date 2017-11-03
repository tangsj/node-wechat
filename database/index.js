const mysql = require('mysql');
const config = require('../config');

/**
 * 数据库连接池
 * @type {Object}
 */
const map = {};

Object.keys(config.db).forEach((key) => {
  const dbItem = config.db[key];
  const dbcf = {
    host: dbItem.host,
    user: dbItem.user,
    password: dbItem.pass,
    connectionLimit: 10,
  };
  dbItem.database.forEach((dbname) => {
    const pool = mysql.createPool(Object.assign({}, dbcf, {
      database: dbname,
    }));

    map[`${key}.${dbname}`] = pool;
  });
});

const DB = {
  getConnection: (type, callback) => {
    const poll = map[type];
    if (poll) {
      poll.getConnection((err, connection) => {
        if (err) { throw new Error(`获取数据库连接失败！[${type}]`); }
        callback(connection);
      });
    } else {
      throw new Error('未找到数据库连接对象');
    }
  },
};

module.exports = DB;
