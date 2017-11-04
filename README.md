# node-wechat（微信相关接口开发）

主要包含微信相关的开发，当然其它和nodejs相关的开发也会放进去。

## 已完成功能
  - 显式授权
  - 隐式授权
  - 微信分享
  - 微信多媒体文件下载
  - 普通文件上传

### 授权地址重定向（显式和隐式）

使用demoURL：http://api.tangsj.com/wx/redirect?url=http%3A%2F%2Fweixin.tangsj.com%2Findex.html%3Fparams1%3D1%26params%3D2&pro=fcbk

参数说明：

url - 回调url地址，需要url编码, url中可以添加其它参数，如parms1,params2

pro - 对应公众号配置名称，在config的wx对象下配置

type -  授权类型 snsapi_base（隐式授权） snsapi_userinfo（显示授权），默认显示授权

### 微信分享

获取wx.config 配置参数 

接口地址：/wx/jsapi

请求类型：post

请求参数：

```json
  {
    url: '', // 当前页面url 部分，不包含 # 号后面部分
    pro: '', // 公众号配置名称
  }
```

返回参数 ：

```json
  {
    url: '',
    appId: '', // 必填，公众号的唯一标识
    timestamp: '', // 必填，生成签名的时间戳
    nonceStr: '', // 必填，生成签名的随机串
    signature: '',// 必填，签名，见附录1
  }
```
### 微信多媒体文件下载

从微信服务器下载用户上传的多媒体文件到自己的服务器上（视频，音频）

接口地址：/wx/media/download

请求类型：get

请求参数：

```json
  {
    media_id: '', // 对应微信服务器的媒体 ID， server_id
    pro: '', // 公众号配置名称
  }
```

返回参数 ：

无

成功下载的文件会保存在media 目录下。会以appid 进行文件夹区分

### 普通文件上传

简单的文件上传，和微信的媒体文件上传无关

接口地址：/file/single

请求类型：post

具体使用可以参看public/upload.html

### 微信普通token

微信的token有 2个小时的有效期，这里做了全局的缓存，缓存目录为cache

缓存 json 文件名格式：access_token_${appid}.json


调取方法：

```js
import Token from 'controller/token.js';

Token.accessToken(config);
```

### 微信分享token

有效时间同样为 2小时

缓存 json 文件名格式：jsapi_ticket_${appid}.json


调取方法：

```js
import Token from 'controller/token.js';

Token.jsapiTicket(config);
```

### mysql数据操作

1. 数据库连接

只需要在config.js中配置数据库服务器信息就可以了，支持多服务器，多数据库

```js
 db: { // 数据库配置信息 可以配置多台服务器及多个数据库
  tangsj: {
    host: '', // 数据库地址
    user: '', 
    pass: '',
    database: ['project'], // 数据库名称
  },
},
```

2. 执行sql

Demo, 具体可以参看controller/tongji.js

```js
  req.getConnection('tangsj.project', (connection) => { // 从数据库连接池中获取 一个连接对象

    connection.query(sql, (err, results) => { // 执行查询 
      connection.release(); // 将连接放回连接池

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
```
其中：tangsj 对应服务器， project 代码数据库名

