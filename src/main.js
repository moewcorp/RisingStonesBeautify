// ==UserScript==
// @name         FF14石之家美化
// @description  美化，一键盖章
// @namespace    none
// @version      0.0.3
// @author       gogofishman
// @license      MIT
// @match        *://*.ff14risingstones.web.sdo.com/*
// @run-at       document-start
// @grant        GM_addStyle
// @grant        GM_xmlhttpRequest
// @grant        unsafeWindow
// ==/UserScript==

'use strict'

window.onload = () => {
    if (window.location.href !== 'https://ff14risingstones.web.sdo.com/pc/index.html#/post') return

    //检查是否需要盖章
    let needStamp = true
    GM_xmlhttpRequest({
        method: 'GET',
        url: 'https://apiff14risingstones.web.sdo.com/api/home/active/online2312/myTaskInfo',
        headers: {
            'Origin': 'https://ff14risingstones.web.sdo.com',
            'Referer': 'https://ff14risingstones.web.sdo.com/'
        },
        onload: function (response) {
            let re = JSON.parse(response.response)
            if (re.data.onceTask.seal_total === 3) {
                needStamp = false
            }

            // 一键盖章
            let div = document.createElement('div')
            if (needStamp) {
                div.innerHTML = '一键盖章'
                div.classList.add('_stamp_')
                div.onclick = async () => {
                    //点赞5次
                    GM_xmlhttpRequest({
                        method: 'GET',
                        url: 'https://apiff14risingstones.web.sdo.com/api/home/posts/postsCommentDetail?id=19038&order=latest&page=1&limit=10',
                        headers: {
                            'Origin': 'https://ff14risingstones.web.sdo.com',
                            'Referer': 'https://ff14risingstones.web.sdo.com/'
                        },
                        onload: function (response) {
                            let idList = []
                            let re = JSON.parse(response.response)
                            re.data.rows.forEach(e => {
                                idList.push(e.id)
                            })

                            for (let i = 0; i < 5; i++) {
                                let formData = new FormData()
                                formData.append('id', idList[i].toString())
                                formData.append('type', '2')

                                GM_xmlhttpRequest({
                                    method: 'POST',
                                    url: 'https://apiff14risingstones.web.sdo.com/api/home/posts/like',
                                    headers: {
                                        'Origin': 'https://ff14risingstones.web.sdo.com',
                                        'Referer': 'https://ff14risingstones.web.sdo.com/'
                                    },
                                    data: formData,
                                    onload: function (response) {
                                        console.log(response)
                                    },
                                })
                            }
                        },
                    })

                    await sleep(3000)

                    //评论一次
                    let formData = new FormData()
                    formData.append('content', '<p><span class="at-emo">[emo18]</span>&nbsp;</p>')
                    formData.append('posts_id', '9365')
                    formData.append('parent_id', '0')
                    formData.append('root_parent', '0')
                    formData.append('comment_pic', '')

                    GM_xmlhttpRequest({
                        method: 'POST',
                        url: 'https://apiff14risingstones.web.sdo.com/api/home/posts/comment',
                        headers: {
                            'Origin': 'https://ff14risingstones.web.sdo.com',
                            'Referer': 'https://ff14risingstones.web.sdo.com/'
                        },
                        data: formData,
                        onload: function (response) {
                            console.log(response)
                        },
                    })

                    await sleep(3000)

                    //盖章
                    for (let i = 1; i < 4; i++) {
                        formData = new FormData()
                        formData.append('type', i.toString())
                        GM_xmlhttpRequest({
                            method: 'POST',
                            url: 'https://apiff14risingstones.web.sdo.com/api/home/active/online2312/doSeal',
                            headers: {
                                'Origin': 'https://ff14risingstones.web.sdo.com',
                                'Referer': 'https://ff14risingstones.web.sdo.com/'
                            },
                            data: formData,
                            onload: function (response) {
                                console.log(response)
                            },
                        })
                    }

                    //
                    div.innerHTML = '今日已盖章'
                    div.classList.remove('_stamp_')
                    div.classList.add('_stamp_no')
                }
            } else {
                div.innerHTML = '今日已盖章'
                div.classList.add('_stamp_no')
            }
            document.body.append(div)
        },
    })

    // 自动签到
    WaitUntilAction(() => document.querySelector('button[class="el-button text-center signin"]')
        , (e) => {
            if (e.getAttribute('aria-disabled') === 'true') {
                GM_xmlhttpRequest({
                    method: 'POST',
                    url: 'https://apiff14risingstones.web.sdo.com/api/home/sign/signIn',
                    headers: {
                        'Origin': 'https://ff14risingstones.web.sdo.com',
                        'Referer': 'https://ff14risingstones.web.sdo.com/'
                    },
                    onload: function (response) {
                        let re = JSON.parse(response.response)
                        console.log(re.msg)
                    },
                })
            }
        })
}

function sleep (ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * 异步执行当某个元素出现时立马某个动作
 * @param {function} element 返回指定元素的函数
 * @param {function} action 执行动作,参数为element得到的元素,默认remove
 * @param {number} num action执行次数，默认1次，-1为不限定次数直到超时才停止
 * @param {number} step 每次检查间隔时间 ms
 * @param {number} timeOut 超时时间 ms
 * @returns {Promise<void>}
 * @constructor
 */
async function WaitUntilAction (element, action = () => {},
    num = 1, step = 50, timeOut = 1000 * 10) {
    let count = 0
    let _num = 0
    let outCount = timeOut / step

    try {
        while (count <= outCount) {
            count++
            await sleep(step)

            let _c = element()
            if (_c) {
                //执行动作
                action(_c)
                if (_num < num) {
                    break
                }
                _num++
            }

        }
    } catch (e) {
        console.log('WaitUntilAction错误：', e)
    }
}