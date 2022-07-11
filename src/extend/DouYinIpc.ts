import {
  CommentComponent,
  FollowComponent,
  IpcRes,
  LetterParams,
  PageData,
  VideoComponent
} from 'app/src-electron/help/type';
import {Notify} from 'quasar';
import {DouYinStore} from 'stores/DouYin';

const electron = require('electron')
const ipcRenderer = electron.ipcRenderer

//Ipc接口通信
function IpcMiddleware(res: IpcRes) {
  console.log(res)
  if (res.code != 0) {
    Notify.create({
      message: res.msg,
      position: 'top',
      timeout: 1500,
      closeBtn: true,
    })
    const store = DouYinStore()
    clearInterval(store.videoInterval)
    clearInterval(store.commentInterval)
    clearInterval(store.followLetterInterval)
    clearInterval(store.commentVideoInterval)
    clearInterval(store.letterInterval)
    clearInterval(store.videoDetailInterval)
    throw res.msg
  } else {
    return res.data
  }
}

export default {
  GetVideoList: (requestParams: VideoComponent['requestParams']): PageData => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'GetVideoList', requestParams)),
  GetCommentList: (requestParams: CommentComponent['requestParams']): PageData => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'GetCommentList', requestParams)),
  GetFollowList: (requestParams: FollowComponent['requestParams']): PageData => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'GetFollowList', requestParams)),
  AddFollow: (list: []): boolean => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'AddFollow', list)),
  FollowLetter: (letterParams: LetterParams): boolean | any => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'FollowLetter', letterParams)),
  GetVideoDetail: (videoIndex: number): boolean => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'GetVideoDetail', videoIndex)),
  CloseChildWindow: () => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'CloseChildWindow')),
  CommentVideo: (params: { url: string, commentContent: string, isCheck: number }) => IpcMiddleware(ipcRenderer.sendSync('DouYin', 'CommentVideo', params))
}
