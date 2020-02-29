/* global hexo */
'use strict';
const fs = require('hexo-fs');
const path = require('path');
const axios = require("axios");
const log = require('hexo-log')({
  debug: false,
  silent: false
});

let options = {
  options: [
    { name: '-u, --update', desc: 'Update bangumi data' },
    { name: '-d, --delete', desc: 'Delete bangumi data' }
  ]
};
hexo.extend.generator.register('bangumis', function (locals) {
  if (!this.config.bangumi || !this.config.bangumi.enable) {
    return;
  }
  return require('./lib/bangumi-generator').call(this, locals);
});
hexo.extend.console.register('bangumi', 'Update bilibili bangumis data', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(__dirname, "/data/"))) {
      fs.rmdirSync(path.join(__dirname, "/data/"));
      log.info('Bangumis data has been deleted');
    }
  } else {
    if (!this.config.bangumi || !this.config.bangumi.enable) {
      log.info("Please add config to _config.yml");
      return;
    }
    if (!this.config.bangumi.vmid) {
      log.info("Please add vmid to _config.yml");
      return;
    }
    saveBangumiData(this.config.bangumi.vmid);
  }
});

async function getBangumiPage(vmid, status) {
  let response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`);
  if (response && response.data && response.data.code === 0 && response.data.message === "0" && response.data.data && typeof response.data.data.total !== "undefined"){
    return {success:true,data:Math.ceil(response.data.data.total / 50) + 1};
  } else if (response && response.data && response.data.message!=="0"){
    return { success: false, data: response.data.message};
  } else if (response && response.data){
    return { success: false, data: response.data };
  }else{
    return { success: false, data: response };
  }
}
async function getBangumi(vmid, status, pn) {
  let response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=50&pn=${pn}`)
  let $data = [];
  if (response.data.code === 0) {
    let data = response.data.data;
    let list = data.list;
    for (let bangumi of list) {
      $data.push({
        title: bangumi.title,
        type: bangumi.season_type_name,
        area: bangumi.areas[0].name,
        cover: bangumi.cover + "@220w_280h.webp",
        totalCount: total(bangumi.total_count),
        id: bangumi.media_id,
        follow: count(bangumi.stat.follow),
        view: count(bangumi.stat.view),
        danmaku: count(bangumi.stat.danmaku),
        coin: count(bangumi.stat.coin),
        score: bangumi.rating ? bangumi.rating.score : "暂无评分",
        des: bangumi.evaluate
      });
    }
    return $data;
  }
}
function count(e) {
  return e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e;
}
function total(e) {
  return e === -1 ? `未完结` : `全${e}话`;
}
async function biliBangumi(vmid, status) {
  let page = await getBangumiPage(vmid, status);
  if(page.success){
    let list = [];
    for (let i = 1; i < page.data; i++) {
      let data = await getBangumi(vmid, status, i);
      list.push(...data);
    }
    return list;
  }else{
    console.log("Get bangumi data error:",page.data);
    return [];
  }
}
async function saveBangumiData(vmid) {
  log.info("Getting bilibili bangumis, please wait...");
  let startTime = new Date().getTime();
  let wantWatch = await biliBangumi(vmid, 1);
  let watching = await biliBangumi(vmid, 2);
  let watched = await biliBangumi(vmid, 3);
  let endTime = new Date().getTime();
  log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded in ' + (endTime - startTime) + " ms");
  let bangumis = { wantWatch, watching, watched };
  if (!fs.existsSync(path.join(__dirname, "/data/"))) {
    fs.mkdirsSync(path.join(__dirname, "/data/"));
  }
  fs.writeFile(path.join(__dirname, "/data/bangumis.json"), JSON.stringify(bangumis), err => {
    if (err) {
      log.info("Failed to write data to bangumis.json");
      console.error(err);
    } else {
      log.info("Bilibili bangumis data has been saved");
    }
  });
}