DouYin = {
  initPrompt: () => {
    return DouYin.success('DouYin execute初始化成功!')
  },
  //视频class
  videoClass: 'div[style="display:block"]>ul>li>div>div',
  //评论按钮class
  commentBtnClass: 'svg[viewBox="0 0 99 99"]',
  //评论div的class
  commentId: '#videoSideBar',
  //继续评论class
  continueClass: '.B10aL8VQ.s6mStVxD.vMQD6aai.scan__button.scan__button-continue',
  //延迟抓取
  delayGrab: 0,
  //获取视频列表
  getVideoList: (videoCount) => {
    try {
      const videoList = document.querySelectorAll(DouYin.videoClass)
      if (!document.querySelector(DouYin.videoClass)) return DouYin.success([])
      const nextDiv = document.querySelector(DouYin.videoClass).closest('ul').nextElementSibling
      if (videoList.length < videoCount && nextDiv.textContent === '') {
        console.log('数量未满足且已登录')
        if (nextDiv) {
          nextDiv.scrollIntoView()
          return DouYin.success([])
        } else {
          return DouYin.fail('无法继续加载后面的视频')
        }
      }
      const list = []
      for (let i = 0; i < videoList.length; i++) {
        const video = videoList[i]
        let title = video.children[1].textContent
        title = title.replace('...展开\n', '')
        const avatar = video.children[0].querySelector('a>div>img') ? video.children[0].querySelector('a>div>img').src : ''
        const coverObj = video.querySelector('div[data-rank] .imgBackground>div>img') || video.querySelector('.swiper-container-horizontal div>img')
        const cover = coverObj.src
        let comment = video.querySelector(DouYin.commentBtnClass).closest('div[class]').nextElementSibling ? video.querySelector(DouYin.commentBtnClass).closest('div[class]').nextElementSibling.textContent : ''
        if (comment.indexOf('w') !== -1) comment = parseFloat(comment.replace('w', '')) * 10000
        const user_center = video.querySelector('div:nth-child(1) a>p').parentNode.href
        if (user_center.indexOf('xigua.com') !== -1) continue
        list[i] = {
          id: i,
          user_name: video.children[0].querySelector('a>p').textContent,
          avatar: avatar,
          user_center: user_center,
          title: title,
          cover: cover,
          comment: comment
        }
        if (avatar === '' || cover === '' || comment === '' || cover.indexOf('base64') !== -1) {
          console.log('图片未加载。。。', list[i])
          return DouYin.success([])
        }
      }
      return DouYin.success(list)
    } catch (e) {
      console.log(e)
      return DouYin.fail('抓取视频异常：' + e.message)
    }
  },
  //加载评论
  loadComment: (videoId) => {
    try {
      const videObj = document.querySelectorAll(DouYin.videoClass)[videoId]
      const commentInputDiv = videObj.querySelector(DouYin.commentId + ' div[style="height: 100%;"]')
      if (!commentInputDiv) {
        videObj.scrollIntoView()
        videObj.querySelector(DouYin.commentBtnClass).parentElement.click()
      } else {
        const commentDiv = commentInputDiv.parentElement.previousElementSibling
        if (commentDiv.lastChild.textContent !== '加载中' || commentDiv.childElementCount - 1 > 2000) {
          DouYin.delayGrab++
          if (DouYin.delayGrab > 2) return DouYin.success(true)
        } else {
          DouYin.delayGrab = 0
          commentDiv.scrollTop = commentDiv.scrollHeight
        }
      }
      return DouYin.success(false)
    } catch (e) {
      console.log(e)
      return DouYin.fail('加载评论异常：' + e.message)
    }
  },
  //获取视频详情链接
  getVideoDetail: (videoIndex) => {
    const videoList = document.querySelectorAll(DouYin.videoClass)
    const video = videoList[videoIndex]
    if (video.querySelector('.xgplayer-icon.content-wrapper')) {
      return DouYin.success(video.querySelector('.xgplayer-icon.content-wrapper').href)
    }
    video.scrollIntoView()
    return DouYin.success(false)
  },
  loadVideoDetail: (video_detail) => {
    const commentDiv = document.querySelector('.comment-mainContent')
    if (!commentDiv || video_detail.indexOf(window.location.href) === -1) {
      return DouYin.success('changeUrl')
    }
    if (commentDiv.lastChild.textContent !== '加载中' || commentDiv.children.length - 1 > 2000) {
      DouYin.delayGrab++
      if (DouYin.delayGrab > 2) return DouYin.success(true)
    } else {
      DouYin.delayGrab = 0
      commentDiv.lastChild.scrollIntoView()
    }
    return DouYin.success(false)
  },
  //获取评论列表
  getCommentList: (videoId) => {
    try {
      // const commentInputDiv = document.querySelectorAll(DouYin.videoClass)[videoId].querySelector(DouYin.commentId + ' div[style="height: 100%;"][class]')
      const commentList = document.querySelectorAll('.comment-mainContent>div')
      const list = []
      for (let i = 0; i < commentList.length - 1; i++) {
        const comment = commentList[i]
        let name = comment.querySelector('div div>a>span') ? comment.querySelector('div div>a>span').textContent : ''
        name = DouYin.filterInnerText(name)
        let content = comment.querySelector('div div>p>span') ? comment.querySelector('div div>p>span').textContent : ''
        content = DouYin.filterInnerText(content)
        list[i] = {
          avatar: comment.querySelector('div>div>a>div>img') ? comment.querySelector('div>div>a>div>img').src : '',
          name: name,
          content: content,
          user_center: comment.querySelector('div div>a>span').parentElement.href,
          comment_date: comment.querySelector('div div>p') ? comment.querySelector('div div>p').textContent : ''
        }
      }
      console.log('数据条数：', list.length)
      return DouYin.success(list)
    } catch (e) {
      console.log(e)
      return DouYin.fail('抓取评论异常：' + e.message)
    }
  },
  followLetter: (allowPlace) => {
    try {
      if (!document.querySelector('#tooltip')) return DouYin.fail('请重新打开窗口')
      const letterBtnParent = document.querySelector('#tooltip').parentElement.parentElement.parentElement
      const userInfoP = letterBtnParent.previousElementSibling.previousElementSibling
      const code = userInfoP.children[0].textContent.replace('抖音号： ', '')
      const place = userInfoP.children[1] ? userInfoP.children[1].textContent.replace('IP属地：', '') : ''
      if (allowPlace !== '不限制' && place !== allowPlace) {
        return DouYin.success({
          letter_res: '',
          state: '属地限制为：' + allowPlace,
          desc: '',
          code,
          place
        })
      }

      const videoLike = document.querySelector('ul>li>a .author-card-user-video-like')
      if (!videoLike) {
        return DouYin.success({
          letter_res: '',
          state: '没有视频',
          desc: '',
          code,
          place
        })
      }
      return DouYin.success({
        letter_res: '',
        state: '',
        desc: videoLike.closest('a').href,
        code,
        place
      })
    } catch (e) {
      return DouYin.fail('查看用户主页错误：' + e.message)
    }
  },
  commentVideo (commentContent, isCheck) {
    try {
      if (document.querySelector('#captcha_container')) {
        return DouYin.fail('出现验证码请及时处理')
      }
      const firstComment = document.querySelector('.comment-mainContent div:nth-child(1) div>p>span')
      if (isCheck > 0 && firstComment) {
        return DouYin.success({ firstComment: firstComment.textContent })
      }
      const praise = ' [赞] '
      const commentBtn = document.querySelector('.commentInput-right-ct span:nth-child(3)')
      if (!commentBtn) return DouYin.fail(false)
      const comment = document.querySelector('.public-DraftEditor-content')
      if (commentBtn.classList.length > 1 && comment.textContent.indexOf(commentContent) !== -1) {
        commentBtn.click()
        return DouYin.success(true)
      } else {
        if (document.querySelector('.leftContainer>div:nth-child(4) ul').lastElementChild) document.querySelector('.leftContainer>div:nth-child(4) ul').lastElementChild.scrollIntoView()
        if (comment.textContent.indexOf(praise) === -1) {
          document.querySelector('.emoji-card-outer-container>div>div>span:nth-child(17)').click()
          return DouYin.success(false)
        }
        return DouYin.success(false)
      }
    } catch (e) {
      return DouYin.fail('评论用户视频错误：' + e.message)
    }
  },
  filterInnerText (innerText) {
    innerText = innerText.replaceAll('"', '')
    innerText = innerText.replaceAll(',', '')
    innerText = innerText.replaceAll('(', '')
    innerText = innerText.replaceAll(')', '')
    innerText = innerText.replaceAll('\'', '')
    return innerText
  },
  success (data, msg = '', code = 0) {
    return Promise.resolve({
      code: code,
      data: data,
      msg: msg
    })
  },
  fail (msg, data = '', code = 1) {
    return Promise.resolve({
      code: code,
      data: data,
      msg: msg
    })
  }
}

DouYin.initPrompt().then()
