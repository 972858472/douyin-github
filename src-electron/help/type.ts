import {Database} from 'sqlite3';
import {BrowserWindow} from 'electron';
import {QTableProps} from 'quasar';

/**
 * 声明全局属性
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    interface Global {
      mainWindow: BrowserWindow
      childWindow: BrowserWindow
      letterWindow: BrowserWindow
      IPCNameList: object
      DB: Database
    }
  }
}

export type  Video = {
  avatar: string,
  cover: string,
  id: number,
  title: string,
  user_center: string,
  user_name: string,
  comment: string,
  video_detail: string
}

export type Comment = {
  avatar: string,
  name: string,
  content: string,
  user_center: string,
  is_send: number,
  comment_date: string,
  letter: string,
  letter_res: string,
  state: string,
  desc: string,
  code: string,
  place: string
}

export type PageData = {
  list: [],
  rowsNumber: number
}

export type IpcRes = {
  code: number,
  data: any,
  msg: string
}

//公共数据表格接口
interface DataTable {
  list: [],
  columns: Pick<QTableProps, 'columns'>['columns'],
  selectedString: () => string,
  clearSelect: () => string,
  loading: boolean,
  dialogModel: boolean
}

//视频组件接口
interface VideoComponentInterface extends DataTable {
  requestParams: {
    pagination: NonNullable<Required<QTableProps['pagination']>>,
    filter: {
      keywords: string,
      videoCount: number,
      isGetVideoDetail: boolean,
      videoIndex: number
    }
  },
  onRequest: (requestParams: VideoComponent['requestParams']) => void
}

export type  VideoComponent = Required<VideoComponentInterface>

//评论组件接口
interface CommentComponentInterface extends DataTable {
  requestParams: {
    pagination: NonNullable<Required<QTableProps['pagination']>>,
    filter: {
      keywords: string,
      videoId: number,
      video_detail: string,
      is_add: {
        key: 0 | 1 | 2,
        val: string
      }
    }
  },
  onRequest: (requestParams: CommentComponent['requestParams']) => void,
  selected: Comment[] | [],
}

export type  CommentComponent = Required<CommentComponentInterface>

//关注组件接口
interface FollowComponentInterface extends DataTable {
  requestParams: {
    pagination: NonNullable<Required<QTableProps['pagination']>>,
    filter: {
      name: string,
      is_send: {
        key: 0 | 1 | 2,
        val: string
      }
    }
  },
  onRequest: (requestParams: FollowComponent['requestParams']) => void,
  selected: Comment[] | [],
  letterIndex: number
}

export type  FollowComponent = Required<FollowComponentInterface>

export  type LetterParams = {
  userCenter: string,
  message: string,
  allowPlace: string
}
