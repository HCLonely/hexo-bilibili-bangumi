/*
 * @Author       : HCLonely
 * @Date         : 2024-09-11 15:40:57
 * @LastEditTime : 2025-07-09 20:36:01
 * @LastEditors  : HCLonely
 * @FilePath     : /hexo-bilibili-bangumi/src/lib/templates/index.js
 * @Description  : 前端页面交互脚本，实现标签页切换和分页加载功能。
 *                 包含自定义DOM操作方法、标签页点击事件处理，以及
 *                 通过AJAX异步加载更多数据的分页功能。
 */

// eslint-disable-next-line no-unused-vars
function initPagination() {
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

  function runWhenIdle(callback) {
    if (typeof requestIdleCallback === 'function') {
      requestIdleCallback(callback);
      return;
    }
    setTimeout(() => {
      callback({
        timeRemaining: () => 0
      });
    }, 16);
  }

  function createBangumiPageRenderer() {
    if (hexoBilibiliBangumiOptions.pug && typeof hexoBilibiliBangumiOptions.pug.compile === 'function') {
      const render = hexoBilibiliBangumiOptions.pug.compile(hexoBilibiliBangumiOptions.pugTemplate);
      return function hexoBilibiliBangumiRenderPage(item) {
        return render({
          item,
          ...hexoBilibiliBangumiOptions.pugOptions
        });
      };
    }
    return function hexoBilibiliBangumiRenderPage(item) {
      return hexoBilibiliBangumiOptions.pug.render(hexoBilibiliBangumiOptions.pugTemplate, {
        item,
        ...hexoBilibiliBangumiOptions.pugOptions
      });
    };
  }

  function renderItemsInIdle(items, renderPage, onComplete) {
    const html = [];
    let index = 0;
    function renderBatch(deadline) {
      let renderedInFrame = false;
      while (index < items.length && (!renderedInFrame || deadline.timeRemaining() > 0)) {
        html.push(renderPage(items[index]));
        index++;
        renderedInFrame = true;
      }
      if (index < items.length) {
        runWhenIdle(renderBatch);
        return;
      }
      onComplete(html.join('\n'));
    }
    runWhenIdle(renderBatch);
  }

  function renderTasksInIdle(tasks) {
    const renderPage = createBangumiPageRenderer();
    let taskIndex = 0;
    function runNextTask() {
      if (taskIndex >= tasks.length) return;
      const task = tasks[taskIndex];
      taskIndex++;
      renderItemsInIdle(task.items, renderPage, (html) => {
        document.querySelectorAll(task.selector)[0].insertAdjacentHTML('beforeBegin', html);
        runNextTask();
      });
    }
    runNextTask();
  }

  if (typeof hexoBilibiliBangumiOptions.pagenumsPre !== 'undefined' && !document.querySelectorAll('.bangumi-tabs')[0].getAttribute('fetched')) {
    document.querySelectorAll('.bangumi-tabs')[0].setAttribute('fetched', 'true');
    fetch(new URL('../bangumis.json', window.location.href)).then((response) => response.json()).then((data) => {
      if (data) {
        renderTasksInIdle([
          {
            items: data.wantWatch.slice(10),
            selector: '#bangumi-item1>.bangumi-pagination'
          },
          {
            items: data.watching.slice(10),
            selector: '#bangumi-item2>.bangumi-pagination'
          },
          {
            items: data.watched.slice(10),
            selector: '#bangumi-item3>.bangumi-pagination'
          }
        ]);
      }
    });
  }

  document.getElementsByClassName('bangumi-tab')[hexoBilibiliBangumiOptions.show].click();
};
