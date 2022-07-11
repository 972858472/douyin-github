import {defineStore} from 'pinia';

export const DouYinStore = defineStore('DouYin', {
  state: () => ({
    search: false,
    videoInterval: <NodeJS.Timeout>{},
    commentInterval: <NodeJS.Timeout>{},
    followLetterInterval: <NodeJS.Timeout>{},
    videoDetailInterval: <NodeJS.Timeout>{},
    letterInterval: <NodeJS.Timeout>{},
    commentVideoInterval: <NodeJS.Timeout>{},
    grabDataResponseMsg: '数据加载中，请耐心等待，不要做多余的操作',
    grabDataResponseMsgClass: 'text-teal',
  }),
  getters: {},
  actions: {},
  persist: true
});
