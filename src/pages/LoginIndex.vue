<template>
  <video autoplay loop muted>
    <source src="../../public/static/【抖音】记录美好生活.mp4" type="video/mp4"/>
  </video>
  <div style="width: 500px;margin: auto;height: 100%" class="flex items-center ">
    <q-form @keyup.enter="Login"
            style="opacity: 0.8; background-color: #faf9f7;border-radius: 8px;width: 100%;padding: 10px"
    >
      <q-item class="q-pt-sm">
        <span class="window-width text-center">抖音Script</span>
      </q-item>
      <q-item class="q-pt-sm">
        <q-input label-color="orange" class="window-width" standout v-model="loginInfo.username" type="text"
                 label="用户名:">
          <template v-slot:prepend>
            <q-icon name="account_circle"/>
          </template>
        </q-input>
      </q-item>
      <q-item class="q-mt-sm">
        <q-input label-color="orange" class="window-width" standout v-model="loginInfo.password" type="password"
                 label="密码:">
          <template v-slot:prepend>
            <q-icon name="vpn_key"/>
          </template>
        </q-input>
      </q-item>
      <q-item class="q-pt-sm">
        <q-btn color="primary" @click="Login" label="登录" style="width: 150px;margin: auto"/>
      </q-item>

    </q-form>

  </div>

</template>

<script lang="ts">
import {defineComponent, ref} from 'vue';
import {Loading} from 'quasar';
import {login} from 'src/api/user';
import {userStore} from 'stores/user';
import Router from 'src/router';
import {notify} from 'src/extend/common';

export default defineComponent({
  name: 'LoginIndex',
  setup: function () {
    const {userInfo} = userStore()

    const loginInfo = ref({
      username: '',
      password: ''
    })

    function Login() {
      Loading.show()
      if (loginInfo.value.username === '' || loginInfo.value.password === '') {
        notify('账号密码不能为空')
        Loading.hide()
        return
      }
      login({
        name: loginInfo.value.username,
        pwd: loginInfo.value.password
      }).then((res: any) => {
        Loading.hide()
        userInfo.token = res.x_key
        userInfo.account = res.account_name
        userInfo.account_id = res.account_id
        userInfo.state = res.state
        Router.push('/')
      }).catch(() => {
        Loading.hide()
      })
    }

    return {
      loginInfo, Login
    }
  }
})
</script>

<style>
html, body, #q-app {
  height: 100% !important;
}

video {
  position: fixed;
  right: 0;
  bottom: 0;
  min-width: 100%;
  min-height: 100%;
  height: auto;
  width: auto;
  /*背景灰度设置*/
  /*-webkit-filter: grayscale(100%);*/
  z-index: -1000
}
</style>
