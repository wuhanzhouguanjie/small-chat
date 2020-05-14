/**
 * Created by sban on 2017/5/29.
 */

'use strict'

let service = require('./lib/service')
var Promise = require('./lib/bluebird-3.5.0.min')
let page = require('./lib/page')
var promise = {
    all: Promise.all,
}

var app = {
    data:{
        loading:false,
    },
    version: "1.0",
    service: service,
    promise: promise,
    page: page,
    config:{
      showLoadingOnRequest:false //发起http请求时是否自动显示”加载中“提示
    }
}

// 向服务器发起http请求
function request(url,data,options) {
    return new Promise(function (resolve, reject) {
        wx.showNavigationBarLoading()

        // 调用成功、失败都会执行
        let complete = function () {
            if (app.config.showLoadingOnRequest) wx.hideLoading()
            wx.hideNavigationBarLoading()
        }
        
        // 去掉微信的封装,直接返回服务器的结果
        let success = function (res) {
            if (res.statusCode == 200 && res.errMsg == "request:ok"){
                resolve(res.data)
            }else{
              reject(res.errMsg)
            }
        }
        var args = {
            url: url,
            header: { 'Content-Type': 'json' },
            success: success,
            fail: reject,
            complete:complete,
        }
        if (data) {
            args["method"] = "POST"
            args["data"] = data
        }
        if (options){
            Object.assign(args, options)
        }
        if (app.config.showLoadingOnRequest) {
          wx.showLoading({
            title: '加载中',
          })
        }
        wx.request(args)
    })
}

// 拉取当前微信用户信息
function getUserInfo() {
  return new Promise(function (resolve, reject) {
    if (app.data.userInfo) {
      resolve(app.data.userInfo)
      return 
    }

    wx.showNavigationBarLoading()
    let complete = function () {
      wx.hideNavigationBarLoading()
    }
    let fail = function(){
      reject()
    }

    wx.login({
      success: _ => {
        wx.getUserInfo({
          success: res => {
            app.data.userInfo = res.userInfo
            resolve(app.data.userInfo)
          },
          fail: reject,
          complete: complete
        })
      },
      fail: reject,
      complete:complete
    })
  })
}

// 人性化可读格式化时间
function humanFormatTime(ms) {
  const formatNumber = function(n) {
    n = n.toString()
    return n[1] ? n : `0${n}`
  }
  // ms = ms * 1000
  let d_second, d_minutes, d_hours, d_days
  let timeNow = new Date().getTime()
  let d = (timeNow - ms) / 1000
  d_days = Math.round(d / (24 * 60 * 60))
  d_hours = Math.round(d / (60 * 60))
  d_minutes = Math.round(d / 60)
  d_second = Math.round(d)
  if (d_days > 0 && d_days < 2) {
    return `${d_days}天前`
  } else if (d_days <= 0 && d_hours > 0) {
    return `${d_hours}小时前`
  } else if (d_hours <= 0 && d_minutes > 0) {
    return `${d_minutes}分钟前`
  } else if (d_minutes <= 0 && d_second >= 0) {
    return '刚刚'
  } else {
    let s = new Date()
    s.setTime(ms)
    return [s.getFullYear(), s.getMonth() + 1, s.getDate()].map(formatNumber).join('/') + ' ' + [s.getHours(), s.getMinutes()].map(formatNumber).join(':')
  }
}

app.request = request
app.getUserInfo = getUserInfo
app.humanFormatTime = humanFormatTime

module.exports = app