import sqlite3 from 'sqlite3'

const sqlite = sqlite3.verbose()
const dataPath = './data.db'
const db = new sqlite.Database(dataPath)

db.serialize(() => {
  db.run('create table  if not exists video(avatar text,cover text,id integer,title text,user_center text,user_name text,comment integer,video_detail text)', (err) => {
    if (err != null) throw err
  })
  db.run('create table  if not exists comment(avatar text,name text,content text,user_center text,is_add integer,comment_date text)', (err) => {
    if (err != null) throw err
  })

  db.run('create table if not exists follow(avatar text,name text,content text,user_center text,is_send integer,letter text,state text,desc text,code text,place text)', (err) => {
    if (err != null) throw err
  })
})

export default db
