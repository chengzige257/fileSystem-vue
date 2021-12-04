<template>
  <div>
    <el-container>
      <el-header class="homeHead">
        <div class="title">文件管理系统</div>
        <div>
          <el-dropdown class="userInfo" @command="commandHandler">
            <span class="el-dropdown-link">
              {{ user.name }}<i><img src="http://www.static.chengzige.top/photos/9813278287fa463c7653120d79dfe932.jpg" alt=""></i>
            </span>
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="userInfo">个人中心</el-dropdown-item>
              <el-dropdown-item command="setting">设置</el-dropdown-item>
              <el-dropdown-item command="logout" divided>注销登录</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
        </div>
      </el-header>
      <el-container>
        <el-aside class="aside" width="750px">
            <el-tree
                :data="menus"
                node-key="id"
                :props="defaultData"
                default-expand-all
                :expand-on-click-node="false">
              <div class="custom-tree-node" slot-scope="{node,data}">
                <div class="folders" style="font-size: small">
                  <div v-if="data.foldername">
                    <i class="el-icon-folder" style="font-size: medium"></i>
                    <el-popover
                        placement="right-start"
                        width="200"
                        trigger="hover">
                      <el-button type="primary" size="mini" icon="el-icon-folder-add" @click="addFolder(data)" circle></el-button>
                      <el-button type="danger" size="mini" icon="el-icon-folder-delete" @click="deleteFolder(data)" circle></el-button>
                      <el-button type="primary" size="mini" icon="el-icon-document-add" @click="addFile(data)" circle></el-button>
                      <i slot="reference" style="font-style: normal">{{data.foldername}}</i>
                    </el-popover>
                  </div>
                  <div v-else>
                    <i class="el-icon-document" style="font-size: medium"></i>
                    <el-popover
                        placement="right-start"
                        width="200"
                        trigger="hover">
                      <el-button type="danger" size="mini" icon="el-icon-document-remove" @click="deleteFile(data)" circle></el-button>
                      <i slot="reference" style="font-style: normal" @click="showDetail(data)">{{data.filename}}</i>
                    </el-popover>
                  </div>
                </div>
              </div>
            </el-tree>
        </el-aside>
        <el-main>
          <div class="fileDetail">
            <span style="margin-right: 20px">{{editFile.filename}}</span>

            <span>上次修改时间：{{editFile.lasetModifiedTime}}</span>

            <el-switch
                @change="changeStatus(editFile.writeenable)"
                v-show="showButton"
                style="display: block"
                v-model="editFile.writeenable"
                active-color="#13ce66"
                inactive-color="#ff4949"
                inactive-text="开启文件保护">
            </el-switch>

          </div>
          <div class="text-area"
               v-loading="loading"
               element-loading-text="拼命加载中"
               element-loading-spinner="el-icon-loading"
               element-loading-background="rgba(0, 0, 0, 0.8)">
            <textarea placeholder="请输入..." v-model="editFile.content"></textarea>
          </div>

          <el-button type="primary" v-show="PutButtonShow" style="margin-top: 5px" @click="putContent">修改</el-button>
          <el-button type="primary" v-show="editFile.content!==''" style="margin-top: 5px;float: right" @click="download">下载</el-button>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>

export default {
  name: "Home",
  mounted() {
    this.initMenus();
  },
  data() {
    return {
      PutButtonShow: false,
      loading:false,
      showButton: false,
      editFile:{
        id:-1,
        filename:"",
        content:"",
        writeenable:false,
        lasetModifiedTime:""
      },
      newFolder:{
        pid:-1,
        folderName:""
      },
      newFile:{
        pid:-1,
        fileName:""
      },
      menus:[],
      defaultData:{
        label:'foldername',
        children:'folders'
      },
      user: JSON.parse(window.sessionStorage.getItem("user"))
    }
  },
  methods: {
    download(){
      var pom = document.createElement("a");
      pom.setAttribute(
          "href",
          "data:text/plain;charset=utf-8," + encodeURIComponent(this.editFile.content)
      );
      pom.setAttribute("download", this.editFile.filename);
      if (document.createEvent) {
        var event = document.createEvent("MouseEvents");
        event.initEvent("click", true, true);
        pom.dispatchEvent(event);
      } else {
        pom.click();
      }
    },
    putContent(){
      let params={
        id:this.editFile.id,
        content:this.editFile.content
      }
      this.postKeyValueRequest("/file/content",params).then(resp=>{
        if(resp){
          this.showDetail(params)
        }
      })
    },
    formatDateTime(dateString) {
      var date = new Date(dateString);
      // let s = date.toString();
      var y = date.getFullYear();
      var m = date.getMonth()+1;
      var d = date.getDate();
      var h = date.getHours();
      var minute = date.getMinutes();
      var second=date.getSeconds();
      return y + '-' + m + '-' + d+' '+h+':'+minute+':'+second;
  },
    changeStatus(writeenable){
    let requestParams={
      status:writeenable===false?1:0,
      id:this.editFile.id
    }
    this.postKeyValueRequest("/file/protect",requestParams).then(resp=>{
      if(resp){
        return 0;
      }
    })

  },
    showDetail(data){
      this.loading=true;
      this.getRequest("/file/detail/"+data.id).then(resp=>{
        if(resp){
          this.editFile.id=data.id;
          this.editFile.writeenable=!resp.obj.writeenable
          this.editFile.content=resp.obj.content
          this.editFile.filename=resp.obj.filename
          this.editFile.lasetModifiedTime=this.formatDateTime(resp.obj.createtime)
          this.showButton=resp.obj.isparent;
          if(resp.obj.isparent===1){
            this.PutButtonShow=true
          }else if(resp.obj.writeenable===true){
            this.PutButtonShow=true
          }else{
            this.PutButtonShow=false
          }
          this.loading=false;
        }
      })

    },
    addFile(data){
      this.$prompt('请输入文件名', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
      }).then(({ value }) => {
        this.newFile.pid=data.id;
        this.newFile.fileName=value;
        this.postKeyValueRequest("/file/add",this.newFile).then(resp=>{
          if(resp){
            this.initMenus();
            this.newFile={
              pid:-1,
              fileName:""
            }
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消新建文件'
        });
      });
    },
    addFolder(data){
        this.$prompt('请输入文件夹名', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
        }).then(({ value }) => {
          this.newFolder.pid=data.id;
          this.newFolder.folderName=value;
          this.postKeyValueRequest("/folder/add",this.newFolder).then(resp=>{
            if(resp){
              this.initMenus();
              this.newFolder={
                pid:-1,
                folderName:""
              }
            }
          })
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消新建文件夹'
          });
        });
    },
    deleteFile(data){
      this.$confirm('确定删除该文件？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteRequest("/file/delete/"+data.id).then(resp=>{
          if(resp){
            this.initMenus();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });
    },
    deleteFolder(data){
      this.$confirm('此操作将删除整个文件夹（包括其内所有文件），是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteRequest("/folder/delete/"+data.id).then(resp=>{
          if(resp){
            this.initMenus();
          }
        })
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        });
      });

    },
    commandHandler(cmd) {
      if (cmd === 'logout') {
        this.$confirm('此操作将注销登录, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).then(() => {
          this.getRequest('/logout');
          window.sessionStorage.removeItem("user");
          this.$store.commit('initRoutes',[]);
          this.$router.replace('/');
        }).catch(() => {
          this.$message({
            type: 'info',
            message: '已取消操作'
          });
        });
      }
    },
    initMenus(){
      this.getRequest("/getAllMenu").then(resp=>{
        if(resp){
          this.menus=resp
          console.log(this.menus)
        }
      })
    }
  }
}
</script>

<style>
.fileDetail{
  margin-bottom: 10px;
  display: flex;
  justify-content: space-between;
}


.homeHead {
  background-color: #409eff;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 15px;
  box-sizing: border-box;
}

.homeHead .title {
  font-size: 30px;
  font-family: 华文行楷;
  color: #ffffff;
}

.homeHead .userInfo {
  cursor: pointer;
}

.el-dropdown-link img {
  width: 48px;
  height: 48px;
  border-radius: 24px;
  margin-left: 8px;
}

.el-dropdown-link {
  display: flex;
  align-items: center;
}
.aside{
  display: flex;
}
.text-area{
  width: 100%;
  border-top:1px solid gainsboro;
  border-bottom:1px solid gainsboro;

}
.text-area textarea {
  width: 100%;
  margin: 0.75rem  0;
  border: none;
  outline: none;
  padding-left: 1.125rem;
  height: 30rem;
}

.text-area textarea::-webkit-input-placeholder {
  color: #9E9E9E;

}

</style>
