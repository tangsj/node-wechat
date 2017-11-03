/**
 * 项目数据导出
 */
const Tongji = {
  /**
   * 获取事件分析数据
   * query 参数
   *  siteid 查询站点ID
   *  startTime 开始时间
   *  endTime 结束时间
   *  page 开始页码 0 开始
   *  pageSize 每页大小  默认10
   */
  custom(req, res) {
    const siteid = req.query.siteid;
    const sendData = {
      code: 200,
      message: '查询成功',
      data: [],
    };

    if (!siteid) {
      sendData.code = 500;
      sendData.message = '请提供站点ID';
      res.json(sendData);
      return;
    }

    const page = req.query.page || 0;
    const pageSize = req.query.pageSize || 10;

    let sql = `SELECT * from wd_custom where true and siteid = ${siteid}`;
    if (req.query.startTime && req.query.endTime) {
      sql += ` and export_date BETWEEN "${req.query.startTime}" AND "${req.query.endTime}"`;
    }
    sql += ` LIMIT ${page * pageSize},${pageSize}`;

    req.getConnection('minisite.tongji', (connection) => {
      connection.query(sql, (err, results) => {
        connection.release();

        if (err) {
          sendData.code = 500;
          sendData.message = err.message;
          res.json(sendData);
          return;
        }
        sendData.data = results;
        res.json(sendData);
      });
    });
  },
  /**
   * 获取受访页面分析数据
   * query 参数
   *  siteid 查询站点ID
   *  startTime 开始时间
   *  endTime 结束时间
   *  page 开始页码 0 开始
   *  pageSize 每页大小  默认10
   */
  visit(req, res) {
    const siteid = req.query.siteid;
    const sendData = {
      code: 200,
      message: '查询成功',
      data: [],
    };

    if (!siteid) {
      sendData.code = 500;
      sendData.message = '请提供站点ID';
      res.json(sendData);
      return;
    }

    const page = req.query.page || 0;
    const pageSize = req.query.pageSize || 10;

    let sql = `SELECT * from wd_visit where true and siteid = ${siteid}`;
    if (req.query.startTime && req.query.endTime) {
      sql += ` and export_date BETWEEN "${req.query.startTime}" AND "${req.query.endTime}"`;
    }
    sql += ` LIMIT ${page * pageSize},${pageSize}`;

    req.getConnection('minisite.tongji', (connection) => {
      connection.query(sql, (err, results) => {
        connection.release();

        if (err) {
          sendData.code = 500;
          sendData.message = err.message;
          res.json(sendData);
          return;
        }
        sendData.data = results;
        res.json(sendData);
      });
    });
  },

  
};

module.exports = Tongji;
