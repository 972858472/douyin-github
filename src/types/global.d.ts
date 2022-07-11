import {BrowserWindow} from 'electron';
import {Database} from 'sqlite3';

declare global {
  interface Window {
    childWindow: BrowserWindow,
    DB: Database
  }
}

export type  video = {
  avatar: string,
  cover: string,
  id: bigint,
  title: string,
  userCenter: string,
  userName: string
}
