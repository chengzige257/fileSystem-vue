<template>
  <div>
    <el-form
        v-loading="loading"
        element-loading-text="正在登录"
        element-loading-spinner="el-icon-loading"
        element-loading-background="rgba(0, 0, 0, 0.8)"
        :rules="rules" ref="loginForm" :model="loginForm" id="loginContainer">
      <h3 id="loginTitle">文件管理系统登陆</h3>
      <el-form-item prop="username">
        <el-input size="normal" type="text" v-model="loginForm.username" auto-complete="off" placeholder="请输入用户名" @keydown.enter.native="submitLogin"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input size="normal" type="password" v-model="loginForm.password" auto-complete="off" placeholder="请输入密码" @keydown.enter.native="submitLogin"></el-input>
      </el-form-item>
      <el-button size="normal" type="primary" style="width: 100%" @click="submitLogin">登陆</el-button>
    </el-form>
  </div>
</template>

<script>

export default {
  name: "Login",
  data(){
    return {
      loading: false,
      loginForm:{
        username: 'licheng',
        password: '123'
      },
      checked: true,
      rules:{
        username:[{required: true,message: '请输入用户名',trigger: 'blur'}],
        password:[{required: true,message: '请输入密码',trigger: 'blur'}]
      }
    }
  },
  methods:{
    submitLogin() {

      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading=true;
          this.postKeyValueRequest('/doLogin',this.loginForm).then(resp=>{
            this.loading=false;
            if(resp){
              window.sessionStorage.setItem("user",JSON.stringify(resp.obj));//把对象转换为字符串存储起来
              //获取重定向要去的页面
              let path=this.$route.query.redirect;
              this.$router.replace((path=='/'||path==undefined)?'/home':path);
            }
          })
        } else {
          this.$message.error('请输入所有字段');
          return false;
        }
      });
    }
  }
}
</script>

<style scoped>
#loginTitle{
  margin: 20px auto 20px auto;
  text-align: center;
  color: #505458;
}

#loginContainer{
  border-radius: 15px;
  background-clip: padding-box;
  margin: 180px auto;
  width: 350px;
  padding: 5px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  box-shadow: 0 0 25px #cac6c6;
}
</style>
