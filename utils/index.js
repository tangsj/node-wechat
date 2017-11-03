const path = require('path');

module.exports = {
  /**
   * 获取文件扩展名
   */
  getExt: pathname => path.extname(pathname).substring(1),
  /**
   * url参数转对象
   */
  queryStringToObject: qstring => {
    var param = {};
    if (qstring.indexOf("?") != -1) {
      qstring = qstring.substr(1);
    }
    strs = qstring.split("&");
    for(var i = 0; i < strs.length; i ++) {
       param[strs[i].split("=")[0]]= decodeURIComponent(strs[i].split("=")[1]);
    }
    return param;
  },
  /*
   * 对象转url参数
   * params: 需要转换的对象
   * flag: 是否需要对数据进行url编码
   */
  buildQueryString(params, flag = true) {
    const esc = flag ? encodeURIComponent : q => q;
    const query = Object.keys(params)
      .map(k => `${esc(k)}=${esc(params[k])}`)
      .join('&');
    return query;
  },
  /**
   * 生成一个指定长度的随机字符串
   * 
   * @param {any} len 
   * @returns 
   */
  randomString(len) {
    len = len || 10;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';/****默认去掉了容易混淆的字符oOLl,9gq,Vv,Uu,I1****/
    var maxPos = $chars.length;
    var pwd = '';
    for (i = 0; i < len; i++) {
      pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
  },
  /**
   * 对象根据key 排序后转查询字符串
   * 
   * @param {any} args 
   * @returns 
   */
  raw(args) {
    var keys = Object.keys(args);
    keys = keys.sort()
    var newArgs = {};
    keys.forEach(function (key) {
      newArgs[key.toLowerCase()] = args[key];
    });
  
    var string = '';
    for (var k in newArgs) {
      string += '&' + k + '=' + newArgs[k];
    }
    string = string.substr(1);
    return string;
  }
};
