
import Vue from 'vue'
import App from './App.vue'
import router from './router/index'
import ElementUI from 'element-ui';
import store from "@/store/index"
import 'element-ui/lib/theme-chalk/index.css';
import 'font-awesome/css/font-awesome.min.css'

import {deleteRequest, getRequest, postKeyValueRequest, postRequest, putRequest} from "@/utils/api";
// import {initMenus} from "@/utils/menu";


Vue.prototype.postRequest = postRequest;//这样在所有vue实例中都可以通过this.的方式用到这个函数
Vue.prototype.postKeyValueRequest = postKeyValueRequest;
Vue.prototype.getRequest = getRequest;
Vue.prototype.putRequest = putRequest;
Vue.prototype.deleteRequest = deleteRequest;

Vue.config.productionTip = false
Vue.use(ElementUI,{size:'small'})

//全局前置守卫
router.beforeEach((to, from, next) => {
  if (to.path === '/') {
    next();
  } else {
    if (window.sessionStorage.getItem("user")) {
      next();
    } else {
      
      next('/?redirect=' + to.path);
    }
  }
})

new Vue({
  store: store,
  router: router,
  render: h => h(App),
}).$mount('#app')
