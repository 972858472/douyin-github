import {defineStore} from 'pinia';

export const userStore = defineStore('user', {
  state: () => ({
    userInfo: {
      token: '',
      state: 1,
      account: '',
      account_id: 0
    }
  }),
  getters: {},
  actions: {},
  persist: true
});
