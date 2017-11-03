const axios = require('axios');
const token = require('./controller/token');
const config = require('./config');
// axios.get('https://api.weixin.qq.com/sns/oauth2/access_token?appid=wx34cf9efee3452dec&secret=2af789594564b3a1c6632def12211d23&code=001ym2Zp0DywIr1TrqZp0BI0Zp0ym2ZQ&grant_type=authorization_code').then(res => {
//   console.log(res);
// });


const wxconfig = config.wx.fcbk;

// 获取微信菜单
token.accessToken(wxconfig).then(res => {
  axios.get('https://api.weixin.qq.com/cgi-bin/menu/get', {
    params: {
      access_token: res.access_token,
    }
  }).then(response => {
    console.dir(response.data);
  });
});
