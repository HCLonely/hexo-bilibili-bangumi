'use strict';

const I18N = require('hexo-i18n');

const i18n = new I18N({
  languages: ['zh-CN', 'zh-TW', 'en']
});

i18n.set('en', {
  wantWatch: 'Wish',
  watched: 'Watched',
  watching: 'Watching',
  prev: 'Prev',
  next: 'Next',
  top: 'Top',
  end: 'End',
  wantPlay: 'Wish',
  playing: 'Playing',
  played: 'Played',
  type: 'Type',
  tag: 'Tags',
  score: 'Score',
  follow: 'Follow',
  summary: 'Summary',
  comment: 'My Comment',
  noSummary: 'No Summary',
  unknown: 'Unknown',
  view: 'Views',
  coin: 'Coins',
  danmaku: 'Danmaku',
  myScore: 'My Score' // Added myScore translation
});

i18n.set('zh-TW', {
  wantWatch: '想看',
  watched: '看過',
  watching: '在看',
  prev: '上一頁',
  next: '下一頁',
  top: '首頁',
  end: '尾頁',
  wantPlay: '想玩',
  playing: '在玩',
  played: '玩過',
  type: '類型',
  tag: '標籤',
  score: '評分',
  follow: '關注',
  summary: '簡介',
  comment: '我的評價',
  noSummary: '暫無簡介',
  unknown: '未知',
  view: '總播放',
  coin: '硬幣',
  danmaku: '彈幕',
  myScore: '我的評分' // Added myScore translation
});

i18n.set('zh-Hans', {
  wantWatch: '想看',
  watched: '看过',
  watching: '在看',
  prev: '上一页',
  next: '下一页',
  top: '首页',
  end: '尾页',
  wantPlay: '想玩',
  playing: '在玩',
  played: '玩过',
  type: '类型',
  tag: '标签',
  score: '评分',
  follow: '关注',
  summary: '简介',
  comment: '我的评价',
  noSummary: '暂无简介',
  unknown: '未知',
  view: '总播放',
  coin: '硬币',
  danmaku: '弹幕',
  myScore: '我的评分' // Added myScore translation
});

i18n.set('zh-CN', {
  wantWatch: '想看',
  watched: '已看',
  watching: '在看',
  prev: '上一页',
  next: '下一页',
  top: '首页',
  end: '尾页',
  wantPlay: '想玩',
  playing: '在玩',
  played: '玩过',
  type: '类型',
  tag: '标签',
  score: '评分',
  follow: '关注',
  summary: '简介',
  comment: '我的评价',
  noSummary: '暂无简介',
  unknown: '未知',
  view: '总播放',
  coin: '硬币',
  danmaku: '弹幕',
  myScore: '我的评分' // Added myScore translation
});

module.exports.i18n = i18n;
