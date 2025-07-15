/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-07-09 20:36:29
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/templates/pagination.js
 * @Description  : 分页功能实现脚本，提供首页、上一页、下一页、末页等导航功能。
 *                 实现了页码显示、页面内容切换、图片懒加载等功能，每页显示10条数据，
 *                 支持自定义预加载数据量配置。
 */

(function () {
  const firstpages = document.getElementsByClassName('bangumi-firstpage');
  const previouspages = document.getElementsByClassName('bangumi-previouspage');
  const nextpages = document.getElementsByClassName('bangumi-nextpage');
  const lastpages = document.getElementsByClassName('bangumi-lastpage');
  const pagenums = document.getElementsByClassName('bangumi-pagenum');

  function makePageNum(num, arr) {
    return `${num + 1} / ${Math.ceil(arr.length / 10 === 0 ? 1 : Math.ceil(arr.length / 10))}`;
  }

  function firstBtn() {
    const sibs = this.parentNode.siblings();
    displayPage(sibs, 0);
    this.parentNode.getElementsByClassName('bangumi-pagenum')[0].innerText = makePageNum(0, sibs);
  }

  function previousBtn() {
    const sibs = this.parentNode.siblings();
    let currNum = this.parentNode.getElementsByClassName('bangumi-pagenum')[0].innerText;
    currNum = currNum.substr(0, currNum.indexOf('/') - 1);
    currNum = parseInt(currNum, 10) - 1;
    if (currNum > 0) {
      currNum--;
    }
    displayPage(sibs, currNum);
    this.parentNode.getElementsByClassName('bangumi-pagenum')[0].innerText = makePageNum(currNum, sibs);
  }

  function nextBtn() {
    const sibs = this.parentNode.siblings();
    let currNum = this.parentNode.getElementsByClassName('bangumi-pagenum')[0].innerText;
    currNum = currNum.substr(0, currNum.indexOf('/') - 1);
    currNum = parseInt(currNum, 10) - 1;
    if (currNum < Math.ceil(sibs.length / 10) - 1) {
      currNum++;
    }
    displayPage(sibs, currNum);
    this.parentNode.getElementsByClassName('bangumi-pagenum')[0].innerText = makePageNum(currNum, sibs);
  }

  function lastBtn() {
    const sibs = this.parentNode.siblings();
    displayPage(sibs, Math.ceil(sibs.length / 10) - 1);
    this.parentNode.getElementsByClassName('bangumi-pagenum')[0].innerText =
      makePageNum(Math.ceil(sibs.length / 10) - 1 === -1 ? 0 : Math.ceil(sibs.length / 10) - 1, sibs);
  }

  function displayPage(arr, num) {
    for (let i = 0; i < arr.length; i++) {
      if (Math.floor(i / 10) === num) {
        arr[i].classList.remove('bangumi-hide');
        const [img] = arr[i].getElementsByTagName('img');
        if (hexoBilibiliBangumiOptions.bangumiLazyload) {
          img.src = img.getAttribute('data-src');
        }
      } else {
        arr[i].classList.add('bangumi-hide');
      }
    }
  }

  for (let i = 0; i < firstpages.length; i++) {
    // add listener
    firstpages[i].onclick = firstBtn;
    previouspages[i].onclick = previousBtn;
    nextpages[i].onclick = nextBtn;
    lastpages[i].onclick = lastBtn;

    // set page num
    const size = typeof hexoBilibiliBangumiOptions.pagenumsPre !== 'undefined' ? (hexoBilibiliBangumiOptions.pagenumsPre[i] ?? pagenums[i].parentNode.siblings().length) : pagenums[i].parentNode.siblings().length;
    firstpages[i].click();
    pagenums[i].innerText = `1 / ${Math.ceil(size / 10) === 0 ? 1 : Math.ceil(size / 10)}`;
  }
}());
