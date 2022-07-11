import {Notify} from 'quasar';

export function notify(message: string) {
  Notify.create({
    message,
    position: 'top',
    timeout: 1000,
    closeBtn: true,
    color: 'deep-orange'
  })
}
