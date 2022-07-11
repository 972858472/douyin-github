import {api} from 'boot/axios';

export function login(params: { name: string, pwd: string }) {
  return api.post('/account/login', params)
}

export function check() {
  return api.post('/auth/check')
}

export function addLetter(data: []) {
  return api.post('/letter/add', data)
}

export function letterList(data: { per_page: number, current_page: number, is_send: 0 | 1 | 2 }) {
  return api.post('/letter/index', data)
}

export function letterEdit(data: any[]) {
  return api.post('/letter/edit', data)
}

export function letterDel(data: any[]) {
  return api.post('/letter/del', data)
}
