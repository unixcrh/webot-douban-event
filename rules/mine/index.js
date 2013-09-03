var error = require('debug')('weixin:reply:error');

module.exports = function(webot) {

var cwd = process.cwd();
var task = require(cwd + '/lib/task');

var _ = require('lodash');


var render_event_list = _.template([
  '你当前标记了<%= total %>个要参加的活动:',
  '',
  '<% _.each(events, function(item, i) { %>' +
    '<%= (i + 1) %>. [<%= _.format_time(item.begin_time) %>]',
    '   <a href="<%= item.alt %>"><%= item.title %></a>',
  '<% }) %>' +
  '<% if (total > events.length) { %>' +
    '...',
  '<% } %>',
  '<a href="http://www.douban.com/location/mine/events">查看详细»</a>'
].join('\n'));



webot.set('mine events', {
  pattern: /^我的(活动)?|mine$/,
  handler: function(info, next) {
    var user = info.user;
    if (!user.access_token) {
      info.user.make_connect_url(function(err, url) {
        if (err) return next(500);
        next(null, '<a href="' + url + '">请先绑定豆瓣账号</a>');
      });
      return;
    }
    task.api(function(oauth2) {
      client = oauth2.clientFromToken(user.access_token, user._id);
      client.get('/v2/event/user_participated/' + client.user_id, {
        count: 7,
        status: 'ongoing'
      }, function(err, ret) {
      //client.get('/shuo/v2/statuses/home_timeline', function(err, ret) {
        if (err) {
          error('[API] get mine events failed: ', err);
          info.ended = true;
          return next('T.T 获取活动出错了，稍后再试吧');
        }
        next(null, render_event_list(ret));
      });
    });
  }
});




  
};
