/* eslint-disable no-plusplus */
(function () {
  Element.prototype.siblings = function () {
    const siblingElement = [];
    const sibs = this.parentNode.children;
    for (let i = 0; i < sibs.length; i++) {
      if (sibs[i] !== this) {
        siblingElement.push(sibs[i]);
      }
    }
    return siblingElement;
  };
  // eslint-disable-next-line func-style
  function tabClick() {
    // 修改标签样式
    this.classList.add('bangumi-active');
    let sibs = this.siblings();
    for (let j = 0; j < sibs.length; j++) {
      sibs[j].classList.remove('bangumi-active');
    }
    // 显示对应板块
    const itemId = this.id.replace('tab', 'item');
    const target = document.getElementById(itemId);
    target.classList.remove('bangumi-hide');
    target.classList.add('bangumi-show');
    sibs = document.getElementById(itemId).siblings();
    for (let k = 0; k < sibs.length; k++) {
      sibs[k].classList.remove('bangumi-show');
      sibs[k].classList.add('bangumi-hide');
    }
  }
  const tabs = document.getElementsByClassName('bangumi-tab');
  for (let i = 0; i < tabs.length; i++) {
    tabs[i].onclick = tabClick;
    tabs[i].onclick.apply(tabs[i]);
  }

  if (typeof pagenumsPre !== 'undefined') {
    axios.get(new URL('../bangumis.json', window.location.href)).then((response) => {
      if (response.data) {
        const html = {
          wantWatch: response.data.wantWatch.slice(10).map((item) => ejs.render(ejsTemplate, { item, loading, metaColor, type }))
            .join('\n'),
          watching: response.data.watching.slice(10).map((item) => ejs.render(ejsTemplate, { item, loading, metaColor, type }))
            .join('\n'),
          watched: response.data.watched.slice(10).map((item) => ejs.render(ejsTemplate, { item, loading, metaColor, type }))
            .join('\n')
        };
        document.querySelectorAll('#bangumi-item1>.bangumi-pagination')[0].insertAdjacentHTML('beforeBegin', html.wantWatch);
        document.querySelectorAll('#bangumi-item2>.bangumi-pagination')[0].insertAdjacentHTML('beforeBegin', html.watching);
        document.querySelectorAll('#bangumi-item3>.bangumi-pagination')[0].insertAdjacentHTML('beforeBegin', html.watched);
      }
    });
  }
}());
