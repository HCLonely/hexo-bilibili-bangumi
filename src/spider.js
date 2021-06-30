var axios = require('axios');
var cheerio = require('cheerio') 
const fs = require('hexo-fs')
const path = require('path')
const log = require('hexo-log')
var util = require("util")
const bangumiData = require('bangumi-data');

async function getPageNum(userid, status){
    var idlist = [];
    res = await axios.get(`https://bangumi.tv/anime/list/${userid}/${status}`)
    $ = cheerio.load(res.data);
    var pagenum = $('#multipage').find('a').length;
    pagenum = pagenum > 0 ? pagenum : 1
    console.log(pagenum);
    for (var i=0; i<pagenum; i++){
      res = await axios.get(`https://bangumi.tv/anime/list/${userid}/${status}?page=${i+1}`)
      $ = cheerio.load(res.data);
      $('li','#browserItemList').each(function(index, elem) {
        idlist.push($(elem).attr('id').split('_')[1]);
      })
    }
    return idlist;
}

async function dealBgmtvData(rawdata, idlist){
  const $unfixedIndexData = [];
  const $data = [];
  var elem = null
  // fix async
  for (var i=0;i<rawdata.length;i++){
    elem = rawdata[i];
    if (!elem?.data?.name)
    {
      $unfixedIndexData.push(i)
      console.log('fix bangumi data')
      // console.log(idlist[i])
      fData = await fixData(idlist[i])
      console.log(fData)
      $data.push(fData)
    }else{
      jp_title = elem?.data?.name ?? null
      //TODO undefined?

      cn_name = findBangumiCn(jp_title) ?? (await queryCNName(idlist[i])) ?? jp_title

      title = cn_name
      score = elem?.data?.rating?.score ?? null
      summary = elem?.data?.summary ?? null
      wish = elem?.data?.collection?.wish ?? null
      collect = elem?.data?.collection?.collect ?? null
      doing = elem?.data?.collection?.doing ?? null
      totalCount = elem?.data?.eps?.length ?? null 
      type = elem?.data?.type === 2 ? '番剧' : '其他'
      viewArray = elem?.data?.collection ? Object.values(elem?.data?.collection) : null
      view = viewArray ? (function(){
        var sum = 0;
        viewArray.forEach(function(val){
          sum += val;
        });
        return sum
      })() : null
      cover = elem?.data?.image ? "https:" + elem?.data?.image : null
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
        view: view
      })
      }
  }
  fixedData = await bgmFix($unfixedIndexData, idlist)
  fixData.forEach(function(fixElem, fixIndex){$data[$unfixedData[fixIndex]] = fixElem})
  cnData = await jpFix($jpIndexData, idlist)
  return $data
}

async function bgmFix(unfixedIndexes, idlist){
  const response = await axios.all(
    unfixedIndexes.map(subIndex => axios.get(`https://bgm.tv/subject/${idlist[subIndex]}`)))
    const $fixedData = []
    
    for (var i = 0; i < response.length; i++){
      var res = response[i]
      var id = idlist[unfixedIndexes[i]]
      const $ = cheerio.load(res.data);
      
      // cover
      const cover = 'https:' +　$('img','#bangumiInfo')?.attr('src')
      const score = $('span[property*="v:average"]').text()
      // name
      const cn_name = await queryCNName(id)
      // totalCount
      const hastotalCount = $('span', '#infobox')[1].children[0].data;
      const totalCount = $('span', '#infobox')[1].next.data;
      // wantWatch
      const wish = $('a[href$="wishes"]').text()
      // watching
      const collect = $('a[href$="collections"]').text()
      // watched
      const doing = $('a[href$="doings"]').text()
      // view
      const people = $('.tip_i').find('a')
      var s = 0;
      for(var p=1; p<people.length;p++)
      {
          s+= parseInt(people[p].children[0].data.split('人')[0]) 
      }
      const view = s
      const des = $('#subject_summary').text()
      const type = $('option[selected*=selected]').attr('value')
      $fixedData.push({
        title: cn_name,
        score: score,
        des: des,
        wish: wish,
        collect: collect,
        doing: doing,
        cover: cover,
        totalCount: totalCount,
        type: type,
        view: view,
        id: id
      })
    }
  return $fixedData

}
async function jpFix(jpIndexes, idlist){
  const response = await axios.all(
    jpIndexes.map(subIndex => axios.get(`https://bgm.tv/subject/${idlist[subIndex]}`)))

  console.log(response)
}
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
  return null
}

async function getBangumiCDN(idlist){
    const url = "https://cdn.jsdelivr.net/gh/czy0729/Bangumi-Subject@master/data/"
    const response = await axios.all(
        idlist.map(subjectId => axios.get(url + `${parseInt(parseInt(subjectId) / 100)}/${subjectId}.json`)))
      return response
}

async function biliBangumi(userid, status, webp, progress){
    status = status === 1 ? 'wish' : status === 2 ? 'do' : 'collect';
    idlist = await getPageNum(585999, status);
    rawdata = await getBangumiCDN(idlist);
    finaldata = await dealBgmtvData(rawdata, idlist);
    return finaldata;
}

async function saveBangumiData(vmid, webp = true, progress, sourceDir) {
    console.log('Getting bilibili bangumis, please wait...')
    const startTime = new Date().getTime()
    const wantWatch = await biliBangumi(vmid, 1, webp, progress)
    const watching = await biliBangumi(vmid, 2, webp, progress)
    const watched = await biliBangumi(vmid, 3, webp, progress)
    const endTime = new Date().getTime()
    console.log(wantWatch.length + watching.length + watched.length + ' bangumis have been loaded in ' + (endTime - startTime) + ' ms')
    const bangumis = { wantWatch, watching, watched }
    var sourceDir = '.' // todo
    if (!fs.existsSync(path.join(sourceDir, '/_data/'))) {
      fs.mkdirsSync(path.join(sourceDir, '/_data/'))
    }
    fs.writeFile(path.join(sourceDir, '/_data/bangumis.json'), JSON.stringify(bangumis), err => {
      if (err) {
        console.log('Failed to write data to bangumis.json')
        console.error(err)
      } else {
        console.log('Bilibili bangumis data has been saved')
      }
    })
  }


async function queryCNName(id, jpname = null){
    console.log('query CN name')
    const response =  await axios.get(`https://bgm.tv/subject/${id}`)
    const $ = cheerio.load(response.data);
    const cn_name = $('span', '#infobox')[0]?.next?.data ?? null;
    console.log('return',cn_name ?? jpname ?? null)
    return cn_name ?? jpname ?? null
}

async function fixData(id){
    const res =  await axios.get(`https://bgm.tv/subject/${id}`)
    const $ = cheerio.load(res.data);
    // cover
    const cover = 'https:' +　$('img','#bangumiInfo')?.attr('src')
    const score = $('span[property*="v:average"]').text()
    // name
    const cn_name = await queryCNName(id)
    // totalCount
    const hastotalCount = $('span', '#infobox')[1].children[0].data;
    const totalCount = $('span', '#infobox')[1].next.data;
    // wantWatch
    const wish = $('a[href$="wishes"]').text()
    // watching
    const collect = $('a[href$="collections"]').text()
    // watched
    const doing = $('a[href$="doings"]').text()
    // view
    const people = $('.tip_i').find('a')
    var s = 0;
    for(var i=1; i<people.length;i++)
    {
        s+= parseInt(people[i].children[0].data.split('人')[0]) 
    }
    const view = s
    const des = $('#subject_summary').text()
    const type = $('option[selected*=selected]').attr('value')
    return {
        title: cn_name,
        score: score,
        des: des,
        wish: wish,
        collect: collect,
        doing: doing,
        cover: cover,
        totalCount: totalCount,
        type: type,
        view: view,
        id: id
      }
}
saveBangumiData()