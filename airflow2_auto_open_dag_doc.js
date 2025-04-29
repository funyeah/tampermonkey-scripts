// ==UserScript==
// @name         Airflow2 auto open dag doc
// @namespace    http://tampermonkey.net/
// @version      2025-01-07
// @description  Airflow2 自动打开 Doc
// @author       HY
// @match        *://*/dags/*/grid*
// @grant        none
// @iconURL      https://airflow.apache.org/favicons/favicon-32x32.png
// ==/UserScript==

(function() {
    'use strict';
    console.log('running tampermonkey script: Airflow2 auto open dag doc');
    console.log($('#collapseOne'));
    if($('#collapseOne')) {
      $('#collapseOne').addClass('in');
      $('#collapseOne').css('height', '');
    }
})();
