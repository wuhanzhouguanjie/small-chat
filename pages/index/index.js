//index.js
//获取应用实例
let app = getApp()

Page({
  data: {
    timeline: [],
    page: 1
  },
  onLoad() {
    this.retrieve()
  },
  onPullDownRefresh() {
    this.data.page = 1
    this.data.timeline.length = 0
    this.retrieve().finally(_ => wx.stopPullDownRefresh())
  },
  scrollToLower() {
    this.data.page++
    this.retrieve()
  },
  retrieve() {
    return app.request(`http://1482862701.debug.open.weixin.qq.com/server/timeline.json?page=${this.data.page}`).then(res => {
      let timeline = this.formatTimeline(res.data)
      this.setData({
        timeline: [...this.data.timeline, ...timeline]
      })
    })
  },
  formatTimeline(items) {
    let now = new Date().getTime()
    var i = 0
    items.forEach(item => {
      item.avatar = `/static/image/${item.avatar % 4}.jpeg`
      item.created_at = now - (i++) * 6 * 60 * 60 * 1000
      item.time = app.humanFormatTime(item.created_at)
    })
    return items
  },
  previewImage(event) {
    wx.previewImage({
      urls: [event.target.dataset.originalPic]
    })
  }
})

