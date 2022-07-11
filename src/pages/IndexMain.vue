<template>
  <div>
    <q-card class="my-card">
      <q-item class="flex justify-between">
        <q-input
          @keydown.enter="video.requestParams.filter.isGetVideoDetail=true;video.onRequest(video.requestParams)"
          label-color="orange"
          standout
          class="input"
          v-model="video.requestParams.filter.keywords"
          label="关键字"
          style="margin-right: 20px;width: 60%"
          clearable
          :rules="[val=>!!val||'关键字不嫩为空']"
          ref="videoKeywordsRef">
          <template v-slot:prepend>
            <q-icon name="search"/>
          </template>
        </q-input>
        <q-btn-dropdown
          class="glossy"
          color="grey-6"
          :label="userInfo.account"
          no-caps
          style="height: 50px"
        >
          <div class="row no-wrap q-pa-md">
            <div class="column">
              <div class="text-h6 q-mb-md">设置</div>
            </div>

            <q-separator vertical inset class="q-mx-lg"/>

            <div class="column items-center">
              <q-avatar size="72px">
                <img src="../../public/static/boy-avatar.png">
              </q-avatar>

              <div class="text-subtitle1 q-mt-md q-mb-xs">版本号：{{ version }}</div>

              <q-btn
                color="primary"
                label="退出登录"
                @click="Logout"
                size="sm"
                v-close-popup
              />
            </div>
          </div>
        </q-btn-dropdown>
      </q-item>
      <q-item class="flex">
        <q-input
          label-color="orange"
          v-model="IpcRate"
          type="number"
          standout
          :debounce="10"
          label="抓取的频率"
          style="max-width: 160px;margin-right: 10px"
          dense
          suffix="秒"
          :rules="[val=>val >= 0.5||'抓取频率不能小于0.5秒']"
          ref="IpcRateRef"/>
        <q-input
          label-color="orange"
          v-model="video.requestParams.filter.videoCount"
          type="number"
          standout
          :debounce="10"
          label="获取视频个数"
          style="max-width: 160px;margin-right: 10px"
          :dense="true"
          suffix="个"
          :rules="[val=> (val <= 200 && val > 0)||'视频个数范围：1-200']"
          ref="videoCountRef"/>
        <q-btn v-if="!video.loading" color="primary" icon="search" label="抓取视频"
               @click="video.requestParams.filter.isGetVideoDetail=true;video.onRequest(video.requestParams)"/>
        <q-btn v-if="video.loading" color="primary" icon="search" label="取消" @click="stopGrabVideo"/>
        <q-btn class="q-ml-sm" color="secondary" icon="list" label="关注列表"
               @click="follow.onRequest(follow.requestParams)"/>
        <q-btn class="q-ml-sm" label="登录抖音" @click="windowOpen('https://www.douyin.com')"/>
      </q-item>

    </q-card>

    <q-table
      grid
      title="视频"
      :rows="video.list"
      :columns="video.columns"
      row-key="name"
      v-model:pagination="video.requestParams.pagination"
      :loading="video.loading"
      @request="video.onRequest"
      hide-header
      class="q-pa-sm"
      :rows-per-page-options="[10, 20, 50, 100]"
    >
      <template v-slot:loading>
        <q-inner-loading showing color="primary"/>
      </template>
      <template v-slot:item="props">
        <q-card class="video-card">
          <q-img :src="props.row.cover" height="100%">
            <div class="absolute-top text-left text-white" @click="windowOpen(props.row.userCenter)"
                 style="cursor: pointer">
              <q-item class="no-padding">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="props.row.avatar">
                  </q-avatar>
                </q-item-section>

                <q-item-section>
                  <q-item-label>{{ props.row.user_name }}</q-item-label>
                </q-item-section>
              </q-item>
            </div>
            <div class="absolute-bottom text-right text-white">
              <q-btn flat round color="white" icon="comment"
                     @click="comment.requestParams.filter.videoId=props.row.id;comment.requestParams.filter.video_detail=props.row.video_detail;comment.onRequest(comment.requestParams)">
                {{ props.row.comment }}
              </q-btn>
            </div>
          </q-img>
        </q-card>
      </template>
    </q-table>

    <q-dialog title="评论" v-model="comment.dialogModel" @hide="hideComment" transition-show="rotate"
              transition-hide="rotate">
      <q-card style="min-width: 90%;height: 90%">
        <q-table
          title="评论"
          :rows="comment.list"
          :columns="comment.columns"
          row-key="name"
          selection="multiple"
          v-model:selected="comment.selected"
          v-model:pagination="comment.requestParams.pagination"
          @request="comment.onRequest"
          :filter="comment.requestParams.filter"
          :loading="comment.loading"
          :rows-per-page-options="[10, 20, 50, 100]"
        >
          <template v-slot:top-left>
            <q-btn color="primary" :disable="comment.loading || comment.selected.length===0" label="清空选择"
                   @click="comment.clearSelect"/>
            <q-btn class="q-ml-sm" color="secondary" :disable="comment.loading || comment.selected.length===0"
                   label="添加到关注列表"
                   @click="commentToFollow"/>
          </template>
          <template v-slot:top-right>
            <q-select color="secondary" style="width: 150px" outlined :dense="true"
                      v-model="comment.requestParams.filter.is_add"
                      option-value="key"
                      option-label="val"
                      :options="[{key:0,val:'全部'},
                        {key:1,val:'未添加'},
                        {key:2,val:'已添加'}]" label="是否添加"/>
            <q-input class="q-ml-sm" dense outlined v-model="comment.requestParams.filter.keywords"
                     placeholder="关键词搜索">
              <template v-slot:append>
                <q-icon name="search"/>
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-avatar="props">
            <q-td key="avatar" :props="props">
              <q-item-section avatar>
                <q-avatar>
                  <img :src="props.value">
                </q-avatar>
              </q-item-section>
            </q-td>
          </template>
          <template v-slot:body-cell-is_add="props">
            <q-td key="is_add" :props="props">
              <q-badge :color="props.value === 2 ? 'green' : 'red'">
                {{ props.value === 2 ? '已添加' : '未添加' }}
              </q-badge>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </q-dialog>
    <q-dialog v-model="follow.dialogModel" transition-show="rotate"
              transition-hide="rotate">
      <q-card style="min-width: 90%;height: 90%">
        <q-card-section class="q-pt-none" style="padding-top: 20px">
          <q-table
            title="关注"
            :rows="follow.list"
            :columns="follow.columns"
            row-key="name"
            selection="multiple"
            v-model:selected="follow.selected"
            v-model:pagination="follow.requestParams.pagination"
            @request="follow.onRequest"
            :loading="follow.loading"
            :filter="follow.requestParams.filter"
            :rows-per-page-options="[10, 20, 50, 100]"
          >
            <template v-slot:loading>
              <q-inner-loading showing color="primary"/>
            </template>
            <template v-slot:top>
              <div class="flex justify-between window-width items-center">
                <div class="flex">
                  <q-select color="secondary" style="width: 108px" outlined :dense="true"
                            v-model="letter.allowPlace"
                            :options="['不限制','四川']"
                            label="IP属地限制"
                  />
                  <q-select color="secondary"
                            class="q-ml-sm q-mr-sm"
                            style="width: 200px"
                            outlined :dense="true"
                            v-model="follow.requestParams.filter.is_send"
                            option-value="key"
                            option-label="val"
                            :options="[{key:0,val:'全部'},
                        {key:1,val:'未处理'},
                        {key:2,val:'已处理'}]" label="是否处理"/>
                </div>
                <div class="flex items-center q-mt-sm">
                  今日成功处理总数：<span class="text-red">{{ letter.today }}</span>
                  <q-btn class="q-ml-sm" color="negative" label="批量删除" @click="letter.delFollow"/>
                </div>
              </div>

              <div class="flex q-mt-sm">
                <q-input input-style="width:250px;height:50px"
                         type="textarea"
                         class="q-mr-sm" dense outlined
                         :rules="[ val => val.length <= 100 || '最多不能超过100个字']"
                         v-model="letter.content" label="处理内容"/>
                <q-btn color="positive" v-if="!letter.loading" label="开启批量处理" @click="letter.startLetter"/>
                <div v-else>
                  <q-btn color="negative" label="取消批量处理" @click="letter.cancelLetter"/>
                  距离下一条处理时间（{{ countdown }}）秒
                </div>
              </div>
            </template>
            <template v-slot:body-cell-avatar="props">
              <q-td key="avatar" :props="props">
                <q-item-section avatar>
                  <q-avatar>
                    <img :src="props.value">
                  </q-avatar>
                </q-item-section>
              </q-td>
            </template>
            <template v-slot:body-cell-is_send="props">
              <q-td key="isFollowed" :props="props">
                <q-btn size="sm" padding="sm" v-if="props.value === 1" color="negative"
                       @click="letter.updateLetter(props.row)">未处理
                </q-btn>
                <q-btn size="sm" padding="sm" v-if="props.value === 2" color="positive"
                       @click="letter.updateLetter(props.row)">已处理
                </q-btn>
              </q-td>
            </template>
            <template v-slot:body-cell-desc="props">
              <q-td key="desc" :props="props">
                <q-badge style="cursor: pointer" v-if="props.value" color="purple" @click="copy(props.value)">链接
                </q-badge>
              </q-td>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>

</template>

<script lang="ts">
import {computed, defineComponent, ref} from 'vue'
import {copyToClipboard, Dialog, openURL} from 'quasar'
import {DouYinStore} from 'stores/DouYin'
import DouYinIpc from 'src/extend/DouYinIpc'
import {Comment, CommentComponent, FollowComponent, Video, VideoComponent} from 'app/src-electron/help/type'
import Router from 'src/router'
import {userStore} from 'stores/user';
import {notify} from 'src/extend/common';
import {addLetter, letterDel, letterEdit, letterList} from 'src/api/user';

export default defineComponent({
  name: 'IndexMain',
  setup: function () {
    const version = require('./package.json').version
    const {userInfo} = userStore()
    const store = DouYinStore()
    const IpcRate = ref(0.5) //抓取频率（单位：秒）
    const operateRate = ref(60) //操作频率（单位：秒）
    const videoKeywordsRef = ref()
    const videoCountRef = ref()
    const IpcRateRef = ref()
    const letter = ref({
      content: '',
      allowPlace: '四川',
      intervalCount: 0,
      loading: false,
      today: 0,
      cancelLetter: () => {
        letter.value.loading = false
        follow.value.letterIndex = 0
        letter.value.intervalCount = 0
        follow.value.selected = []
        clearInterval(store.letterInterval)
      },
      startLetter: () => {
        letter.value.content = letter.value.content.replace('\n', ',')
        if (!follow.value.selected || follow.value.selected.length === 0) {
          return notify('没有选择任何行')
        }
        if (letter.value.content === '') {
          return notify('评论内容不能为空')
        }

        letter.value.loading = true
        follow.value.letterIndex = 0
        store.letterInterval = setInterval(() => {
          if (countdown.value === operateRate.value) followLetter()
          letter.value.intervalCount++
        }, 1000)
      },
      delFollow: () => {
        if (follow.value.selected.length === 0) return notify('没有选择任何行')
        Dialog.create({
          title: '提示',
          message: '确定要删除这些关注记录吗？',
          cancel: true,
          persistent: true
        }).onOk(() => {
          letterDel(follow.value.selected).then(() => {
            notify('删除成功')
            follow.value.onRequest(follow.value.requestParams)
            follow.value.selected = []
          })
        })
      },
      updateLetter: (row: Comment) => {
        row.is_send = row.is_send === 1 ? 2 : 1
        letterEdit([row]).then(() => {
          follow.value.onRequest(follow.value.requestParams)
        })
      }
    })
    const countdown = computed(() => {
      return operateRate.value - (letter.value.intervalCount % operateRate.value)
    })
    const video = ref(<VideoComponent>{
      list: [],
      loading: false,
      requestParams: {
        filter: {
          keywords: '',
          videoCount: 10,
          isGetVideoDetail: false,
          videoIndex: 0
        },
        pagination: {
          page: 1,
          rowsPerPage: 100,
          rowsNumber: 1
        }
      },
      onRequest: (requestParams: VideoComponent['requestParams']) => {
        if (requestParams.pagination.page === video.value.requestParams.pagination.page && requestParams.pagination.rowsPerPage === video.value.requestParams.pagination.rowsPerPage) {
          requestParams.pagination.page = 1
        }
        video.value.requestParams.pagination = requestParams.pagination
        videoKeywordsRef.value.validate()
        videoCountRef.value.validate()
        IpcRateRef.value.validate()
        if (!(videoKeywordsRef.value.hasError || videoCountRef.value.hasError || IpcRateRef.value.hasError)) {
          video.value.loading = true
          clearInterval(store.videoInterval)
          store.videoInterval = setInterval(() => {
            const newParams = JSON.parse(JSON.stringify(video.value.requestParams))
            const data = DouYinIpc.GetVideoList(newParams)
            video.value.list = data.list
            video.value.requestParams.pagination.rowsNumber = data.rowsNumber
            if (data.list.length > 0 || data.rowsNumber == 0) {
              clearInterval(store.videoInterval)
              if (video.value.requestParams.filter.isGetVideoDetail) return getVideoDetail(newParams)
              video.value.list = data.list
              video.value.requestParams.pagination.rowsNumber = data.rowsNumber
              video.value.loading = false
            }
          }, IpcRate.value * 1000)
        }
      },
      columns: [
        {name: 'cover', label: '封面', field: 'cover'},
        {name: 'avatar', label: '头像', field: 'avatar'},
        {name: 'comment', label: '评论数', field: 'comment'},
        {name: 'video_detail', label: '详情链接', field: 'video_detail'},
      ]
    })

    function getVideoDetail(newParams: any) {
      store.videoDetailInterval = setInterval(() => {
        const videoInfo: Video = video.value.list[video.value.requestParams.filter.videoIndex]
        if (DouYinIpc.GetVideoDetail(videoInfo.id)) {
          video.value.requestParams.filter.videoIndex++
          if (video.value.requestParams.filter.videoIndex >= video.value.requestParams.pagination.rowsNumber) {
            clearInterval(store.videoDetailInterval)
            video.value.requestParams.filter.isGetVideoDetail = false
            video.value.requestParams.filter.videoIndex = 0
            const data = DouYinIpc.GetVideoList(newParams)
            video.value.list = data.list
            video.value.requestParams.pagination.rowsNumber = data.rowsNumber
            video.value.loading = false
          }
        }
      }, IpcRate.value * 1000)
    }

    const comment = ref(<CommentComponent>{
      list: [],
      loading: false,
      dialogModel: false,
      requestParams: {
        filter: {
          keywords: '',
          videoId: 0,
          is_add: {
            key: 0,
            val: '全部'
          }
        },
        pagination: {
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 1
        }
      },
      onRequest: (requestParams) => {
        if (!requestParams.filter.video_detail) return notify('视频详情链接不存在！')
        if (requestParams.pagination.page === comment.value.requestParams.pagination.page && requestParams.pagination.rowsPerPage === comment.value.requestParams.pagination.rowsPerPage) {
          requestParams.pagination.page = 1
        }
        comment.value.dialogModel = true
        comment.value.loading = true
        comment.value.requestParams = requestParams
        clearInterval(store.commentInterval)
        store.commentInterval = setInterval(() => {
          const newParams = JSON.parse(JSON.stringify(comment.value.requestParams))
          const data = DouYinIpc.GetCommentList(newParams)
          comment.value.list = data.list
          comment.value.requestParams.pagination.rowsNumber = data.rowsNumber
          if (data.list.length > 0 || data.rowsNumber == 0) {
            clearInterval(store.commentInterval)
            comment.value.loading = false
            DouYinIpc.CloseChildWindow()
          }
        }, IpcRate.value * 1000)
      },
      columns: [
        {name: 'avatar', label: '头像', align: 'left', field: 'avatar'},
        {name: 'name', label: '昵称', align: 'left', field: 'name'},
        {name: 'content', label: '内容', align: 'left', field: 'content'},
        {name: 'is_add', label: '是否添加', field: 'is_add'},
        {name: 'comment_date', label: '评论时间', field: 'comment_date'},
      ],
      clearSelect: () => {
        comment.value.selected = []
      },
      selected: []
    })

    const follow = ref(<FollowComponent>{
      list: [],
      loading: true,
      dialogModel: false,
      requestParams: {
        filter: {
          is_send: {
            key: 0,
            val: '全部'
          }
        },
        pagination: {
          page: 1,
          rowsPerPage: 10,
          rowsNumber: 1
        }
      },
      onRequest: (requestParams: FollowComponent['requestParams']) => {
        if (requestParams.pagination.page === follow.value.requestParams.pagination.page && requestParams.pagination.rowsPerPage === follow.value.requestParams.pagination.rowsPerPage) {
          requestParams.pagination.page = 1
        }
        follow.value.requestParams = requestParams
        follow.value.loading = true
        follow.value.dialogModel = true
        letterList({
          per_page: requestParams.pagination.rowsPerPage,
          current_page: requestParams.pagination.page,
          is_send: requestParams.filter.is_send.key
        }).then((res: any) => {
          letter.value.today = res.today
          follow.value.list = res.data
          follow.value.requestParams.pagination.rowsNumber = res.total
          follow.value.loading = false
        })
      },
      columns: [
        {name: 'name', label: '昵称', align: 'left', field: 'name'},
        {name: 'code', label: '抖音号', align: 'left', field: 'code'},
        {name: 'place', label: 'ip所属地', align: 'left', field: 'place'},
        {name: 'content', label: '用户评论内容', align: 'left', field: 'content'},
        {name: 'is_send', label: '是否处理', align: 'left', field: 'is_send'},
        {name: 'letter_res', label: '我的评论结果', align: 'left', field: 'letter_res'},
        {name: 'state', label: '用户状态', align: 'left', field: 'state'},
        {name: 'desc', label: '视频', align: 'left', field: 'desc'},
        {name: 'comment_date', label: '评论时间', align: 'left', field: 'comment_date'},
      ],
      selected: []
    })

    //把评论添加到关注
    function commentToFollow() {
      comment.value.loading = true
      const newData = JSON.parse(JSON.stringify(comment.value.selected))
      addLetter(newData).then(() => {
        if (DouYinIpc.AddFollow(newData)) {
          notify('添加成功')
          comment.value.onRequest(comment.value.requestParams)
          comment.value.selected = []
          comment.value.loading = false
        }
      })
    }

    //关注并私信
    function followLetter() {
      store.followLetterInterval = setInterval(() => {
        const data = DouYinIpc.FollowLetter({
          userCenter: follow.value.selected[follow.value.letterIndex].user_center,
          message: letter.value.content,
          allowPlace: letter.value.allowPlace
        })
        if (data.desc) follow.value.selected[follow.value.letterIndex].is_send = 2
        if (data) {
          follow.value.selected[follow.value.letterIndex].letter = letter.value.content
          follow.value.selected[follow.value.letterIndex].letter_res = data.letter_res
          follow.value.selected[follow.value.letterIndex].state = data.state
          follow.value.selected[follow.value.letterIndex].desc = data.desc
          follow.value.selected[follow.value.letterIndex].code = data.code
          follow.value.selected[follow.value.letterIndex].place = data.place
          const postData = [
            JSON.parse(JSON.stringify(follow.value.selected[follow.value.letterIndex]))
          ]
          letterEdit(postData).then(() => {
            follow.value.onRequest(follow.value.requestParams)
          })
          clearInterval(store.followLetterInterval)
          DouYinIpc.CloseChildWindow()
          if (data.desc) commentVideo(postData, {
            url: data.desc,
            commentContent: letter.value.content,
            isCheck: 0
          })
          follow.value.letterIndex++
          if (follow.value.letterIndex >= follow.value.selected.length) {
            letter.value.cancelLetter()
          }
        }
      }, IpcRate.value * 1000)
    }

    function commentVideo(postData: Comment[], params: { url: string, commentContent: string, isCheck: number }) {
      store.commentVideoInterval = setInterval(() => {
        const res = DouYinIpc.CommentVideo(params)
        if (res === true || params.isCheck > 0) {
          params.isCheck++
        }
        if (!res.firstComment) return
        if (res.firstComment.indexOf(params.commentContent) !== -1 || params.isCheck > 10) {
          clearInterval(store.commentVideoInterval)
          DouYinIpc.CloseChildWindow()
          if (res.firstComment) {
            postData[0].letter_res = res.firstComment
            letterEdit(postData).then(() => {
              follow.value.onRequest(follow.value.requestParams)
            })
          }
        }
      }, IpcRate.value * 1000)
    }

    //停止抓取视频
    function stopGrabVideo() {
      clearInterval(store.videoInterval)
      clearInterval(store.videoDetailInterval)
      video.value.loading = false
    }

    //隐藏评论
    function hideComment() {
      clearInterval(store.commentInterval)
    }

    //打开URL
    function windowOpen(url: string) {
      openURL(url)
    }

    function Logout() {
      userInfo.token = ''
      Router.push('/login')
    }

    function copy(text: string) {
      copyToClipboard(text).then(() => {
        notify('复制成功')
      })
    }

    //监听主进程消息
    require('electron').ipcRenderer.on('DouYin', function (event, ...args) {
      console.log('主进程消息', args)
      const method = args[0]
      switch (method) {
        case 'childClose':
          break
        default:
          console.log('不存在的消息:', method)
      }
    })

    return {
      store, video, comment, follow, IpcRate,
      videoKeywordsRef, videoCountRef, IpcRateRef, letter, countdown,
      hideComment, commentToFollow, followLetter, copy, version,
      windowOpen, stopGrabVideo, Logout, userInfo
    }
  },
  mounted: () => {
    const {userInfo} = userStore()
    if (userInfo.token === '' || userInfo.state !== 1) {
      Router.push('/login')
    }
  }
})
</script>

<style lang="scss">
.my-card {
  .q-field--with-bottom {
    padding: 0;
  }
}

.video-card {
  width: 150px;
  height: 260px;
  margin: 10px 10px 0 0;
}

.q-img__content > div {
  padding: 0 10px;
}

.flex-inline {
  flex-wrap: wrap;
}

.q-table--no-wrap td {
  white-space: pre-wrap;
}
</style>
