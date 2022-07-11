import Datastore from 'nedb';
import {app} from 'electron';

export default new Datastore({
  autoload: true,
  filename: require('path').join(app.getPath('userData'), '/data.db')
})
