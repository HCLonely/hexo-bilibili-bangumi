/* global hexo */
'use strict'
const fs = require('hexo-fs')
const path = require('path')
const axios = require('axios')
const log = require('hexo-log')({
  debug: false,
  silent: false
})
const ProgressBar = require('progress')

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
    if (fs.existsSync(path.join(this.source_dir, '/_data/'))) {
      fs.rmdirSync(path.join(this.source_dir, '/_data/'))
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
    saveBangumiData(this.config.bangumi.vmid, this.config.bangumi.webp, this.config.bangumi.progress ?? true, this.source_dir)
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
async function saveBangumiData(vmid, webp = true, progress, sourceDir) {
  log.info('Getting bilibili bangumis, please wait...')
  const startTime = new Date().getTime()
  const wantWatch = await biliBangumi(vmid, 1, webp, progress)
  const watching = await biliBangumi(vmid, 2, webp, progress)
  const watched = await biliBangumi(vmid, 3, webp, progress)
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
      log.info('Bilibili bangumis data has been saved')
    }
  })
}
