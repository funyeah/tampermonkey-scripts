// ==UserScript==
// @name         Fix 3 click
// @version      0.1
// @description  Chrome 3 连点击 inline-block 代码块时，如果代码块是唯一子节点，会出现无法选中整行的问题，导致 Airflow2 中无法全选渲染字段。此脚本在 inline-block 后增加 span 标签临时解决。预计在 Chrome 138 后修复, issue: https://issues.chromium.org/issues/418537016
// @author       HY
// @match        *://*/dags/*/grid*
// @iconURL      https://airflow.apache.org/favicons/favicon-32x32.png
// ==/UserScript==

(() => {
  const log = (...args) => {
      console.log('[Tempermonkey > Fix 3 click]', ...args);
  }

  const getChromeVersion = () => {
      const ua = navigator.userAgent;
      const match = ua.match(/Chrome\/(\d+)\./);
      return match ? parseInt(match[1], 10) : null;
  }

  const chromeVersion = getChromeVersion();
  if (chromeVersion === null || chromeVersion >= 138) {
      // Chrome 版本是 138 及以上，脚本不执行
      log(`Chrome version ${chromeVersion} detected, skipping script.`);
      return;
  }

  log(`Chrome version ${chromeVersion}, run append <spen>`);
  const appendSpan = () => {
    Array.from(document.querySelectorAll('*'))
         .map(element => element.shadowRoot)
         .filter(Boolean)
         .forEach(shadowRoot => {
             shadowRoot.querySelectorAll('td > code').forEach(code => {
                 const td = code.parentElement;
                 const onlyChild = td.childNodes.length === 1 && td.firstChild === code;
                 if (onlyChild) {
                     log('append <span> for td > code', code);
                     const span = document.createElement('span');
                     code.after(span);
                 }
             });
         })
  };

  appendSpan();
  new MutationObserver(appendSpan).observe(document.body, { childList: true, subtree: true });
})();
