// ==UserScript==
// @name         Yarn Fix used-vcores
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  Fix used-vcores for Shopee Yarn
// @author       HY
// @match        *://*/cluster/apps/*
// @icon         https://www.google.com/s2/favicons?domain=tampermonkey.net
// @grant        none
// ==/UserScript==

(function () {
    'use strict';
    console.log('running Tampermonkey script Fix used-vcores')

    let i = 0
    const arr = Array
        .from($('#apps > tbody > tr > td:nth-child(4)'))
        .filter(td => $(td).text() == 'SPARK')
        .map(td => td.parentNode) // 得到 SPARK 任务行
        .forEach(async tr => {
            i += 1
            if (i > 1) return

            const $tr = $(tr)
            const $tdID = $tr.find('td:nth-child(1)')

            if ($tdID.length != 1) {
                console.error('$tdID.length != 1')
            }
            const applicationID = $tdID.text()

            const $tdTrakingUI = $tr.find('td:nth-last-child(2) > a') // SPARK 任务行的 Traking UI (倒数第二格)

            if ($tdTrakingUI.length != 1) {
                console.error('$tdTrakingUI.length != 1')
                return
            }

            const href = $tdTrakingUI[0].getAttribute('href')

            // TODO keyhole 会进行 302 跳转，目前得不到跳转后的 url 和 html，也无法通过 /api/v1/applications/xxx/allexecutors 接口获取 executors
            const executorsURL = href.replace(`/${applicationID}/`, `/${applicationID}/executors/`)
            const response = await fetch(executorsURL, { method: 'HEAD', redirect: 'follow' })
            const finalURL = new URL(response.url) // 302 跳转后的 url
            console.log(`finalURL = ${finalURL}`)
            const allexecutorsURL = `${finalURL.protocol}//${finalURL.hostname}/api/v1/applications/${applicationID}/allexecutors${finalURL.search}`
            console.log(`allexecutorsURL = ${allexecutorsURL}`)

            console.log(response)
            const allexecutors = await response.text()
            console.log(allexecutors)

            const html = await $.get(executorsURL).promise()
            const $html = $(html)
            const $activeCores = $html.find('#summary-execs-table > tbody > tr:nth-child(1) > td:nth-child(5)')
            const $totalCores = $html.find('#summary-execs-table > tbody > tr:nth-child(3) > td:nth-child(5)')
            console.log(`
                activeCores: ${$activeCores.text()}
                totalCores:  ${$totalCores.text()}
                `)
        })
    /*
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
        */

})();
