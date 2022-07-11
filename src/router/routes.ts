import {RouteRecordRaw} from 'vue-router';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('pages/IndexMain.vue'),
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
  {
    path:'/login',
    component:()=>import('pages/LoginIndex.vue')
  }
];

export default routes;
