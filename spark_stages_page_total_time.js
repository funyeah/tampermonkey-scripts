// ==UserScript==
// @name         Spark Stages Page Total Time
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在 Spark History 和 UI stages 页面中计算任务总时长，可换算为核时数
// @author       HY
// @match        *://*/history/*/*/stages*
// @match        *://*/history/*/stages*
// @match        *://*/proxy/*/stages*
// @match        *://*/history/*/*/jobs/job*
// @match        *://*/history/*/*/jobs/
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log('running tampermonkey script')

    Array
        .from($('span + div.collapsible-table table > thead > tr > th:nth-child(4)'))
        .filter(th => $(th).text().includes('Duration'))
        .forEach(th => {
            const $th = $(th)
            const stagePromises = Array
                .from($th.parents('table').find('> tbody > tr > td a.name-link'))
                .map(dom => [$(dom).parents('tr'), dom.getAttribute('href')])
                .map(([$tr, href]) => {
                    console.log(`get '${href}'`)
                    return [$tr, $.get(href).promise()]
                })
                .map(([$tr, p]) => p
                    .then(html => {
                        const $stagePage = $(html)

                        const getFromUL = title => $stagePage
                            .clone()
                            .find(`ul.list-unstyled > li > strong:contains("${title}")`)
                            .parents('li')
                            .text()
                            .replace(title, '')
                            .split('\n')
                            .map(s => s.trim())
                            .filter(s => s != '')
                            .at(0)

                        const timeStr = getFromUL("Total Time Across All Tasks:")

                        const shuffleWritten = Number($stagePage.clone().find('h4:contains("Accumulators") + table > tbody > tr:has(td:contains("dce.shuffle.write.bytesWritten")) > td:nth-child(2)').text())
                        const shuffleRead = Number($stagePage.clone().find('h4:contains("Accumulators") + table > tbody > tr:has(td:contains("dce.shuffle.read.bytesRead")) > td:nth-child(2)').text())

                        if (typeof timeStr !== 'string')
                            return [$tr, 0]

                        const [num, unit] = timeStr.split(' ')
                        switch (unit) {
                            case 'h':
                                return [$tr, Number(num) * 3600e3, shuffleWritten, shuffleRead]
                            case 'min':
                                return [$tr, Number(num) * 60e3, shuffleWritten, shuffleRead]
                            case 's':
                                return [$tr, Number(num) * 1e3, shuffleWritten, shuffleRead]
                            case 'ms':
                                return [$tr, Number(num), shuffleWritten, shuffleRead]
                            default:
                                return [$tr, 0, shuffleWritten, shuffleRead]
                        }
                    })
                    .then(([$tr, ms, written, read]) => {
                        if (ms > 0)
                            $tr.children('td:nth-child(4)').append($('<span>').text(`(${(ms / 3600e3).toFixed(2)} h)`))
                        // if (read > 0)
                        //     $tr.children('td:nth-child(9)').text(`${(read / 1024 ** 3).toFixed(2)} GB`)
                        // if (written > 0)
                        //     $tr.children('td:nth-child(10)').text(`${(written / 1024 ** 3).toFixed(2)} GB`)
                        return ms
                    }))

            Promise
                .all(stagePromises)
                .then(mss => {
                    // report
                    const total = mss.reduce((acc, x) => acc + x, 0)

                    console.log(`
                        ${$th.parents('div.collapsible-table').prev().attr('id').toUpperCase()} stages Total Time:
                        ${total} ms
                        ${total / 1e3} s
                        ${total / 60e3} min
                        ${total / 3600e3} h`)

                    $th.append(
                        $('<strong>').text(`(Total ${(total / 3600e3).toFixed(2)} h)`)
                    )
                })
        })

})();
