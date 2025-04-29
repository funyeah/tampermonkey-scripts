// ==UserScript==
// @name         Airflow2 Grid CSS
// @namespace    http://tampermonkey.net/
// @version      0.2
// @description  修改 Airflow2 Grid 样式，确保实例列表默认是显示状态
// @author       HY
// @match        *://*/dags/*/grid*
// @iconURL      https://airflow.apache.org/favicons/favicon-32x32.png
// ==/UserScript==

(function() {
    'use strict';
    console.log('Tampermonkey Script running: Airflow 2 Grid CSS');

    const css = `
      table.chakra-table tr > td:nth-child(1) {
        max-width: 20em;
      }
      table.chakra-table tr > td:nth-child(1) * {
        text-overflow: ellipsis;
      }

      table.chakra-table tr > td:nth-child(2) > div {
        justify-content: flex-start;
      }
    `

    // 查找所有 Shadow DOM 并处理
    // Shadow DOM 是 Web Components 的一部分，用于封装样式和 DOM 结构，它会防止外部 CSS 和 JS 影响到内部组件。
    // Airflow 2 的 Grid 被包含在一个 Shadow DOM 内，需要将 css 写入其中，而不能写入 document.head
    const shadowRoots = Array
        .from(document.querySelectorAll('*'))
        .map(element => element.shadowRoot)
        .filter(Boolean)
        .forEach(shadowRoot => {
            const style = document.createElement('style');
            style.textContent = css;
            shadowRoot.appendChild(style);
        })
})();
