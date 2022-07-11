import {Comment, CommentComponent, IpcRes, LetterParams, PageData, Video, VideoComponent} from '../help/type';
import {BrowserWindow, IpcMainEvent} from 'electron';
import {IpcFail, IpcSuccess} from '../help/common';
import {getDouYin} from './index';
import DouYinStore from '../store';

const DouYin = {
  OpenUrl: (windowInfo: { url: string, name: 'childWindow', isImage: boolean }) => {
    if (global[windowInfo.name] && !global[windowInfo.name].isDestroyed()) {
      global[windowInfo.name].destroy()
    }
    global[windowInfo.name] = new BrowserWindow({
      width: 580,
      height: 500,
      alwaysOnTop: true,
      webPreferences: {
        images: windowInfo.isImage
      }
    })
    global[windowInfo.name].on('closed', () => {
      if (global.mainWindow && !global.mainWindow.isDestroyed()) global.mainWindow.webContents.send('DouYin', 'childClose', windowInfo.name)
    })

    global[windowInfo.name].minimizable = false
    global[windowInfo.name].closable = false
    global[windowInfo.name].loadURL(windowInfo.url).then()
    global[windowInfo.name].webContents.executeJavaScript(getDouYin(), true).then()
    global[windowInfo.name].webContents.setAudioMuted(true)
  },
  //获取视频列表
  GetVideoList: (event: IpcMainEvent, filter: VideoComponent['requestParams']['filter']) => {
    const oldKeywords = DouYinStore.get('video.keywords')
    DouYinStore.set('video.keywords', filter.keywords)
    DouYinStore.set('video.dbKeywords', null)
    if (filter.keywords != oldKeywords || !global.childWindow || global.childWindow.isDestroyed()) {
      DouYin.OpenUrl({
        url: 'https://www.douyin.com/search/' + filter.keywords,
        name: 'childWindow',
        isImage: true
      })
      return event.returnValue = IpcSuccess(<PageData>{list: [], rowsNumber: 1})
    }
    global.childWindow.webContents.executeJavaScript(`DouYin.getVideoList(${filter.videoCount})`, true).then((res: IpcRes) => {
      if (res.code != 0) return event.returnValue = IpcFail(res.msg)
      const videos: Video[] = res.data
      if (videos.length == 0) return event.returnValue = IpcSuccess(<PageData>{list: [], rowsNumber: 1})
      let data = ''
      for (const i in videos) {
        const video = videos[i]
        if (!video) continue
        if (data !== '') data += ','
        data += `("${video.avatar}","${video.cover}","${video.id}","${video.title}","${video.user_center}","${video.user_name}","${video.comment}","")`
      }
      global.DB.run('delete from video', (err) => {
        if (err != null) return event.returnValue = IpcFail('视频表delete异常：' + err.message)
        global.DB.run('delete from comment')
        global.DB.run('insert into video values ' + data, (err) => {
          if (err != null) return event.returnValue = IpcFail('视频数据异常,无法入库:' + err.message)
          DouYinStore.set('video.dbKeywords', filter.keywords)
          return event.returnValue = IpcSuccess(<PageData>{list: [], rowsNumber: 1})
        })
      })
    })
  },
  //获取评论列表
  GetCommentList: (event: IpcMainEvent, filter: CommentComponent['requestParams']['filter']) => {
    if (!global.childWindow || global.childWindow.isDestroyed()) {
      DouYin.OpenUrl({
        url: filter.video_detail,
        name: 'childWindow',
        isImage: false
      })
      return event.returnValue = IpcSuccess(<PageData>{list: [], rowsNumber: 1})
    }
    global.childWindow.webContents.executeJavaScript(`DouYin.loadVideoDetail("${filter.video_detail}")`, true).then((res: IpcRes) => {
      if (res.code != 0) return event.returnValue = IpcFail(res.msg)
      if (res.data === 'changeUrl') {
        DouYin.OpenUrl({
          url: filter.video_detail,
          name: 'childWindow',
          isImage: false
        })
      }
      if (res.data !== true) return event.returnValue = IpcSuccess(<PageData>{list: [], rowsNumber: 1})
      global.childWindow.webContents.executeJavaScript(`DouYin.getCommentList(${filter.videoId})`, true).then((res: IpcRes) => {
        if (res.code != 0) return event.returnValue = IpcFail(res.msg)
        const comments: Comment[] = res.data
        let data = ''
        for (const i in comments) {
          const comment = comments[i]
          if (parseInt(i) > 0) data += ','
          data += `("${comment.avatar}","${comment.name}","${comment.content}","${comment.user_center}",1,"${comment.comment_date}")`
        }
        global.DB.run('delete from comment', (err) => {
          if (err != null) return event.returnValue = IpcFail('评论表delete异常：' + err.message)
          global.DB.run('insert into comment values ' + data, (err) => {
            if (err != null) return event.returnValue = IpcFail('评论数据异常,无法插入:' + err.message)
            DouYinStore.set('comment.dbVideoDetail', filter.video_detail)
            return event.returnValue = IpcSuccess(<PageData>{list: [], rowsNumber: 1})
          })
        })
      })
    }).catch(err => {
      console.log(err)
    })
  },
  //获取用户信息和第一个视频
  FollowLetter: (event: IpcMainEvent, letterParams: LetterParams) => {
    const oldUserCenter = DouYinStore.get('letter.userCenter')
    DouYinStore.set('letter.userCenter', letterParams.userCenter)
    if (!global.childWindow || global.childWindow.isDestroyed() || oldUserCenter != letterParams.userCenter) {
      DouYin.OpenUrl({
        url: letterParams.userCenter,
        name: 'childWindow',
        isImage: true
      })
      return event.returnValue = IpcSuccess(false)
    }
    global.childWindow.webContents.executeJavaScript(`DouYin.followLetter("${letterParams.allowPlace}")`, true).then((res: IpcRes) => {
      if (res.code != 0) return event.returnValue = IpcFail(res.msg)
      if (res.data === false) {
        console.log('输入')
        //模拟输入私信内容
        global.childWindow.webContents.insertText(letterParams.message).then(() => {
          return event.returnValue = IpcSuccess(false)
        })
      } else if (res.data === true) {
        return event.returnValue = IpcSuccess(true)
      } else {
        const letterRes: {
          letter_res: string,
          state: string,
          desc: string,
          code: string,
          place: string
        } = res.data
        return event.returnValue = IpcSuccess(letterRes)
      }
    })
  },
  //评论视频
  CommentVideo(event: IpcMainEvent, params: { url: string, commentContent: string, isCheck: number }) {
    if (!global.childWindow || global.childWindow.isDestroyed()) {
      DouYin.OpenUrl({
        url: params.url,
        name: 'childWindow',
        isImage: true
      })
      return event.returnValue = IpcSuccess(false)
    }
    global.childWindow.webContents.executeJavaScript(`DouYin.commentVideo("${params.commentContent}",${params.isCheck})`, true).then((res: IpcRes) => {
      if (res.code != 0) return event.returnValue = IpcFail(res.msg)
      if (res.data === false) {
        console.log('输入评论')
        //模拟输入私信内容
        global.childWindow.webContents.insertText(params.commentContent).then(() => {
          return event.returnValue = IpcSuccess(false)
        })
      } else if (res.data === true) {
        return event.returnValue = IpcSuccess(true)
      } else {
        return event.returnValue = IpcSuccess(res.data)
      }
    })
  },
  //获取视频详情链接
  GetVideoDetail: (event: IpcMainEvent, videoIndex: number) => {
    if (!global.childWindow || global.childWindow.isDestroyed()) return event.returnValue = IpcFail('抖音窗口不存在，请重新获取视频')
    global.childWindow.webContents.executeJavaScript(`DouYin.getVideoDetail(${videoIndex})`, true).then((res: IpcRes) => {
      if (res.code != 0) return event.returnValue = IpcFail(res.msg)
      if (!res.data) return event.returnValue = IpcSuccess(false)
      global.DB.run(`update video set video_detail="${res.data}" where id="${videoIndex}"`, (err) => {
        if (err != null) return event.returnValue = IpcFail('视频详情链接入库失败:' + err.message)
        return event.returnValue = IpcSuccess(true)
      })
    })
  }
}

export default DouYin
