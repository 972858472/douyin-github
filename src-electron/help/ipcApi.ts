import {IpcMainEvent} from 'electron';
import sqlite from './sqlite';
import {Comment, CommentComponent, FollowComponent, LetterParams, PageData, VideoComponent} from './type';
import DouYin from '../execute/grab';
import {IpcFail, IpcSuccess} from './common';
import DouYinStore from '../store';


global.DB = sqlite

const IpcApi = {
  GetVideoList: (event: IpcMainEvent, args: VideoComponent['requestParams'][]) => {
    const requestParams = args[0]
    const tableName = 'video'
    global.DB.get(`select count(*) as count from ${tableName}`, function (err, {count}) {
      if (count == 0 || requestParams.filter.keywords != DouYinStore.get('video.dbKeywords') || !global.childWindow || global.childWindow.isDestroyed()) return DouYin.GetVideoList(event, requestParams.filter)
      const offset = (requestParams.pagination.page - 1) * requestParams.pagination.rowsPerPage
      global.DB.all(`select * from ${tableName} ORDER BY comment DESC limit ${requestParams.pagination.rowsPerPage} offset ${offset}`,
        function (err, rows) {
          return event.returnValue = IpcSuccess(<PageData>{
            list: rows,
            rowsNumber: count,
          })
        })
    })
  },
  GetCommentList: (event: IpcMainEvent, args: CommentComponent['requestParams'][]) => {
    const requestParams = args[0]
    const tableName = 'comment'
    let where = ''
    if (requestParams.filter.is_add.key > 0) {
      where += ' and is_add =' + requestParams.filter.is_add.key
    }
    global.DB.get(`select count(*) as count from ${tableName} where content like '%${requestParams.filter.keywords}%' ${where}`, function (err, {count}) {
        if ((count === 0 && !requestParams.filter.keywords) || requestParams.filter.video_detail != DouYinStore.get('comment.dbVideoDetail')) return DouYin.GetCommentList(event, requestParams.filter)
        const offset = (requestParams.pagination.page - 1) * requestParams.pagination.rowsPerPage
        global.DB.all(`select * from ${tableName} where content like '%${requestParams.filter.keywords}%'  ${where} limit ${requestParams.pagination.rowsPerPage} offset ${offset}`,
          function (err, rows) {
            return event.returnValue = IpcSuccess(<PageData>{
              list: rows,
              rowsNumber: count,
            })
          })
      }
    )
  },
  GetFollowList: (event: IpcMainEvent, args: FollowComponent['requestParams'][]) => {
    const requestParams = args[0]
    const tableName = 'follow'
    let where = ''
    if (requestParams.filter.is_send.key > 0) {
      where += ' where is_send =' + requestParams.filter.is_send.key
    }
    global.DB.get(`select count(*) as count from ${tableName} ${where}`, function (err, {count}) {
      const offset = (requestParams.pagination.page - 1) * requestParams.pagination.rowsPerPage
      global.DB.all(`select * from ${tableName} ${where} limit ${requestParams.pagination.rowsPerPage} offset ${offset}`,
        function (err, rows) {
          return event.returnValue = IpcSuccess(<PageData>{
            list: rows,
            rowsNumber: count,
          })
        })
    })
  },
  AddFollow: (event: IpcMainEvent, args: Comment[][]) => {
    const comments = args[0]
    let whereIn = '('
    for (const i in comments) {
      const comment = comments[i]
      if (parseInt(i) > 0) {
        whereIn += ','
      }
      whereIn += `'${comment.user_center}'`
    }
    whereIn += ')'
    global.DB.run(`update comment set is_add=2 where user_center in ${whereIn}`, (err) => {
      if (err != null) return event.returnValue = IpcFail('修改评论状态失败:' + err.message)
      return event.returnValue = IpcSuccess(true)
    })
  },
  FollowLetter: (event: IpcMainEvent, args: LetterParams[]) => {
    const letterParams = args[0]
    return DouYin.FollowLetter(event, letterParams)
  },
  GetVideoDetail: (event: IpcMainEvent, args: number[]) => {
    const videoIndex = args[0]
    return DouYin.GetVideoDetail(event, videoIndex)
  },
  CloseChildWindow: (event: IpcMainEvent) => {
    if (global.childWindow && !global.childWindow.isDestroyed()) global.childWindow.destroy()
    return event.returnValue = IpcSuccess(true)
  },
  CommentVideo: (event: IpcMainEvent, args: { url: string, commentContent: string, isCheck: number }[]) => {
    const params = args[0]
    return DouYin.CommentVideo(event, params)
  }
}

export default IpcApi
