/* global hexo */
'use strict'
const fs = require('hexo-fs')
const path = require('path')
const axios = require('axios')
const cheerio = require('cheerio')
const util = require('util')
const bangumiData = require('bangumi-data')
const log = require('hexo-log')({
  debug: false,
  silent: false
})
const ProgressBar = require('progress')
const { config } = require('process')

if (typeof URL !== 'function') var { URL } = require('url')

const options = {
  options: [
    { name: '-u, --update', desc: 'Update bangumi data' },
    { name: '-d, --delete', desc: 'Delete bangumi data' }
  ]
}
hexo.extend.generator.register('bangumis', function (locals) {
  if (!this?.config?.bangumi?.enable) {
    return
  }
  return require('./lib/bangumi-generator').call(this, locals)
})
hexo.extend.console.register('bangumi', 'Generate pages of bilibili bangumis for Hexo', options, function (args) {
  if (args.d) {
    if (fs.existsSync(path.join(this.source_dir, '/_data/bangumis.json'))) {
      fs.unlinkSync(path.join(this.source_dir, '/_data/bangumis.json'))
      log.info('Bangumis data has been deleted')
    }
  } else if (args.u) {
    if (!this?.config?.bangumi) {
      log.info('Please add config to _config.yml')
      return
    }
    if (!this.config.bangumi.enable) {
      return
    }
    if (!this.config.bangumi.vmid) {
      log.info('Please add vmid to _config.yml')
      return
    }
    if (this.config.bangumi.bgmtv){
      log.info('Use bgmtv to construct!')
      var constructMethod = bgmtvBangumi   
    }else{
      log.info('Use bilibili to construct!')
      var constructMethod = biliBangumi // 保留原模式供选择
    }
    saveBangumiData(constructMethod, this.config.bangumi.vmid, this.config.bangumi.webp, this.config.bangumi.progress ?? true, this.source_dir)
  } else {
    log.info('Unknown command, please use "hexo bangumi -h" to see the available commands')
  }
})

async function getBangumiPage (vmid, status) {
  const response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`)
  if (response?.data?.code === 0 && response?.data?.message === '0' && response?.data?.data && typeof response?.data?.data?.total !== 'undefined') {
    return { success: true, data: Math.ceil(response.data.data.total / 30) + 1 }
  } else if (response && response.data && response.data.message !== '0') {
    return { success: false, data: response.data.message }
  } else if (response && response.data) {
    return { success: false, data: response.data }
  } else {
    return { success: false, data: response }
  }
}
async function getBangumi (vmid, status, webp, pn) {
  const response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=1&follow_status=${status}&vmid=${vmid}&ps=30&pn=${pn}`)
  const $data = []
  if (response?.data?.code === 0) {
    const data = response?.data?.data
    const list = data?.list || []
    for (const bangumi of list) {
      let cover = bangumi?.cover
      if (cover) {
        const href = new URL(cover)
        href.protocol = 'https'
        if (webp) href.pathname += '@220w_280h.webp'
        cover = href.href
      }
      $data.push({
        title: bangumi?.title,
        type: bangumi?.season_type_name,
        area: bangumi?.areas?.[0]?.name,
        cover: cover,
        totalCount: total(bangumi?.total_count),
        id: bangumi?.media_id,
        follow: count(bangumi?.stat?.follow),
        view: count(bangumi?.stat?.view),
        danmaku: count(bangumi?.stat?.danmaku),
        coin: count(bangumi.stat.coin),
        score: bangumi?.rating ? bangumi?.rating?.score : '暂无评分',
        des: bangumi?.evaluate
      })
    }
    return $data
  }
}
function count (e) {
  return e ? (e > 10000 && e < 100000000 ? `${(e / 10000).toFixed(1)} 万` : e > 100000000 ? `${(e / 100000000).toFixed(1)} 亿` : e) : '-'
}
function total (e) {
  return e ? (e === -1 ? '未完结' : `全${e}话`) : '-'
}
async function biliBangumi (vmid, status, webp, progress) {
  const page = await getBangumiPage(vmid, status, webp)
  if (page?.success) {
    const list = []
    let bar = null
    if (progress) bar = new ProgressBar(`正在获取 ${status === 1 ? '[想看]' : status === 2 ? '[在看]' : '[已看]'} 番剧 [:bar] :percent :elapseds`, { total: page.data - 1, complete: '█' })
    for (let i = 1; i < page.data; i++) {
      if (progress) bar.tick()
      const data = await getBangumi(vmid, status, webp, i)
      list.push(...data)
    }
    return list
  } else {
    console.log('Get bangumi data error:', page?.data)
    return []
  }
}

// added by @Freddd13
// 不太会JS，花了半天读了一遍这个项目的代码后，模仿作者的一些用法和现查一些文档改出来的，请见谅
function dealDes(des){  // 解决pc描述过长 移动页面？
  des = des.replace('　',' ');
  var cutNum = 150;
  return des.length > cutNum ? des.substr(0, 150) + '...' : des.substr(0, des.length - 1) + '...'
}

async function getPageNum(userid, status){
  var idlist = [];
  const res = await axios.get(`https://bangumi.tv/anime/list/${userid}/${status}`)
  const $ = cheerio.load(res.data);
  var pagenum = $('#multipage').find('a').length;
  pagenum = pagenum > 0 ? pagenum : 1
  // console.log(pagenum);
  for (var i=0; i<pagenum; i++){
    const res = await axios.get(`https://bangumi.tv/anime/list/${userid}/${status}?page=${i+1}`)
    const $ = cheerio.load(res.data);
    $('li','#browserItemList').each(function(index, elem) {
      idlist.push($(elem).attr('id').split('_')[1]);
    })
  }
  return idlist;
}

function dealBgmtvData(rawdata){
  const $data = [];
  const tmptags = [];

  // 生成数据, 后续再整理
  rawdata.forEach(function(elem) {
    const jp_title = elem?.data?.name ?? null
    //TODO undefined? 有些cdn数据有问题，后面再写一个修复
    const cn_name = jp_title ? findBangumiCn(jp_title) : null
    const title = cn_name
    const score = elem?.data?.rating?.score ?? null
    const summary = elem?.data?.summary ? dealDes(elem?.data?.summary) : null
    const wish = elem?.data?.collection?.wish ?? null
    const collect = elem?.data?.collection?.collect ?? null
    const doing = elem?.data?.collection?.doing ?? null
    // TODO 有些动画计数包含了sp, .5集等，待优化
    const totalCount = elem?.data?.eps?.length ? elem?.data?.eps?.length + '话' : '未知'  // 防止没有样式塌了。。
    const type = elem?.data?.type === 2 ? '番剧' : '其他'
    const viewArray = elem?.data?.collection ? Object.values(elem?.data?.collection) : null
    const id = elem?.data?.id
    const view = viewArray ? (function(){
      var sum = 0;
      viewArray.forEach(function(val){sum += val;});
      return sum;
    })() : null
    const cover = elem?.data?.image ? "https:" + elem?.data?.image : null
    // TODO,tags

    // 完成了一组动画数据
    $data.push({
      title: cn_name,
      score: score,
      des: summary,
      wish: wish,
      collect: collect,
      doing: doing,
      cover: cover,
      totalCount: totalCount,
      type: type,
      view: view,
      id: id
    })
  })
  return $data
}

// 查找中文名
function findBangumiCn(jp = '') {
  const item = bangumiData.items.find(item => item.title === jp)
  if (item) {
    const cn =
      (item.titleTranslate &&
        item.titleTranslate['zh-Hans'] &&
        item.titleTranslate['zh-Hans'][0]) ||
      jp
    return cn
  }
  return jp
}

async function getBangumiCDN(idlist){
    const url = "https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/"
    // 并发请求，很爽
    const response = await axios.all(
        idlist.map(subjectId => axios.get(url + `${parseInt(parseInt(subjectId) / 100)}/${subjectId}.json`)))
      return response
}

async function bgmtvBangumi(vmid, status, webp, progress){  //TODO: webp, progress
    status = status === 1 ? 'wish' : status === 2 ? 'do' : 'collect';
    const idlist = await getPageNum(vmid, status);
    const rawdata = await getBangumiCDN(idlist);
    const finaldata = dealBgmtvData(rawdata);
    // console.log(finaldata)
    return finaldata;
}
// --------

async function saveBangumiData(constructMethod, vmid, webp = true, progress, sourceDir) {
  const methodInfo = constructMethod === biliBangumi ? 'bilibili' : 'bgmtv'
  log.info(`Getting ${methodInfo} bangumis, please wait...`)
  const startTime = new Date().getTime()
  const wantWatch = await constructMethod(vmid, 1, webp, progress)
  const watching = await constructMethod(vmid, 2, webp, progress)
  const watched = await constructMethod(vmid, 3, webp, progress)
  const endTime = new Date().getTime()
  log.info(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded in ' + (endTime - startTime) + ' ms')
  const bangumis = { wantWatch, watching, watched }
  if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
    fs.mkdirsSync(path.join(sourceDir, '/_data/'))
  }
  fs.writeFile(path.join(sourceDir, '/_data/bangumis.json'), JSON.stringify(bangumis), err => {
    if (err) {
      log.info('Failed to write data to bangumis.json')
      console.error(err)
    } else {
      log.info(`All ${methodInfo} bangumis data has been saved`)
    }
  })
}
