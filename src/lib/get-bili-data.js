const fs = require('hexo-fs')
const path = require('path')
const axios = require('axios')
const log = require('hexo-log')({
  debug: false,
  silent: false
})
const ProgressBar = require('progress')

async function getDataPage (vmid, status, typeNum) {
  const response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=1&pn=1`)
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
async function getData (vmid, status, useWebp, typeNum, pn) {
  const response = await axios.get(`https://api.bilibili.com/x/space/bangumi/follow/list?type=${typeNum}&follow_status=${status}&vmid=${vmid}&ps=30&pn=${pn}`)
  const $data = []
  if (response?.data?.code === 0) {
    const data = response?.data?.data
    const list = data?.list || []
    for (const bangumi of list) {
      let cover = bangumi?.cover
      if (cover) {
        const href = new URL(cover)
        href.protocol = 'https'
        if (useWebp) href.pathname += '@220w_280h.webp'
        cover = href.href
      }
      $data.push({
        title: bangumi?.title,
        type: bangumi?.season_type_name,
        area: bangumi?.areas?.[0]?.name,
        cover: cover,
        totalCount: total(bangumi?.total_count, typeNum),
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
function total (e, typeNum) {
  return e ? (e === -1 ? '未完结' : `全${e}${typeNum === 1 ? '话' : '集'}`) : '-'
}
async function processData (vmid, status, useWebp, showProgress, typeNum) {
  const page = await getDataPage(vmid, status, typeNum)
  if (page?.success) {
    const list = []
    let bar = null
    if (showProgress) bar = new ProgressBar(`正在获取 ${status === 1 ? '[想看]' : status === 2 ? '[在看]' : '[已看]'} ${typeNum === 1 ? '番剧' : '追剧'} [:bar] :percent :elapseds`, { total: page.data - 1, complete: '█' })
    for (let i = 1; i < page.data; i++) {
      if (showProgress) bar.tick()
      const data = await getData(vmid, status, useWebp, typeNum, i)
      list.push(...data)
    }
    return list
  } else {
    console.log('Get ' + (typeNum === 1 ? 'bangumi' : 'cinema') + ' data error:', page?.data)
    return []
  }
}
module.exports.getBiliData = async function getBiliData (vmid, type, showProgress, sourceDir, useWebp = true) {
  const typeNum = type === 'cinema' ? 2 : 1
  log.info('Getting bilibili ' + type + ', please wait...')
  const startTime = new Date().getTime()
  const wantWatch = await processData(vmid, 1, useWebp, showProgress, typeNum)
  const watching = await processData(vmid, 2, useWebp, showProgress, typeNum)
  const watched = await processData(vmid, 3, useWebp, showProgress, typeNum)
  const endTime = new Date().getTime()
  log.info(wantWatch.length + watching.length + watched.length + ' ' + type + 's have been loaded in ' + (endTime - startTime) + ' ms')
  const bangumis = { wantWatch, watching, watched }
  if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
    fs.mkdirsSync(path.join(sourceDir, '/_data/'))
  }
  fs.writeFile(path.join(sourceDir, '/_data/' + type + 's.json'), JSON.stringify(bangumis), err => {
    if (err) {
      log.info('Failed to write data to ' + type + 's.json')
      console.error(err)
    } else {
      log.info('Bilibili ' + type + 's data has been saved')
    }
  })
}
