import {getExecuteStr, getPublicPath} from '../help/common';

const ExecuteScriptPath = {
  DouYin: '/execute/DouYin.js',
}

export const getDouYin = () => getExecuteStr(getPublicPath() + ExecuteScriptPath.DouYin);

