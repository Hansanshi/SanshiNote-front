<template>
<div class="home">
 <!-- HEADER START-->

 <div class="notebookList" >
   <span style="float:left">
  <el-button   @click="showNotebookList = !showNotebookList">Notebook List</el-button>
  
 <el-popover
  id = "test"
    style="margin-left: 10px; padding: 0px"
    placement="top-end"
    :visible-arrow="true"
    width="200"
    v-model="visible"
    trigger="click"
  >
<el-input v-model="newNotebookName" @keyup.enter.native="handleCreateNotebook" placeholder="new notebook name" />    
<div style="text-align: right; margin-top: 10px">
    <el-button size="mini" type="text" @click="visible = false">cancel</el-button>
    <el-button type="primary" size="mini"  @click="handleCreateNotebook">confirm</el-button>
  </div>
    <el-button slot="reference">New Notebook</el-button>
  </el-popover>
   </span>

<span class="noselect" style="padding-right: 0px; text-align: right; display: block;margin-right: 0px;">
<span id="hanshi-note"><strong style="margin-right: 10px">SanshiNote</strong>

<el-dropdown >
<i style="color: black; font-size: 30px; margin-top: 5px" class="fa fa-bars"></i>
<el-dropdown-menu slot="dropdown">
  
          <router-link style="color: black ; text-decoration: none" to="/admin">

    <el-dropdown-item >
            Settings
      </el-dropdown-item>
              </router-link>

    <el-dropdown-item divided @click.native="handleLogout()">Log out</el-dropdown-item>
  </el-dropdown-menu>
</el-dropdown>

</span>

</span>



</div>
  <!-- HEADER END-->

<el-container style="border: 0px solid #eee; overflow: visible">
  <el-aside v-if="showNotebookList" width="300px" style="background-color: rgb(255, 255, 255)">
    <el-menu  :collapse="collapse" style="border: 0px" >
      <el-submenu  v-for="notebook of notebookList" :key="notebook.notebookName" 
      
              :index="notebook.notebookName" >
        <template slot="title">
          <div class="noselect" 
          style="font-size: 18px"
          v-contextmenu:notebookmenu
          :notebookName = "notebook.notebookName"
             >
            <i style="color: black" class="el-icon-notebook-1" ></i>{{notebook.notebookName}}
          </div>
        </template>
   
        <el-menu-item class="noselect" 
          style="color: black" v-contextmenu:notemenu 
          @click="chooseNote(notebook.notebookName, note.title)" 
          v-for="note of notebook.noteList" 
          :notebookName = "notebook.notebookName"
          :title="note.title"
          :key="note.title">
          <i style="font-size: 14px" class="el-icon-document"></i><span>{{note.title}}</span>                
          </el-menu-item>
      </el-submenu>
      <!-- DELETED NOTES START-->   
      <el-submenu v-if="delNoteList.length !== 0" index ="deleted">
        <template slot="title">
          <div class="noselect" 
            style="color: grey; font-size: 16px"
            v-contextmenu:delNotebookMenu 
            >
            <i  class="el-icon-delete" ></i>deleted
          </div>
        </template>
        <el-menu-item class="noselect" 
          style="color: grey" 
          v-contextmenu:delNoteMenu
          :delNoteId = "note.id"
          v-for="note of delNoteList" 
          :key="note.id">
          <i style="font-size: 14px" class="el-icon-document"></i>{{note.title}} 
          </el-menu-item>
      </el-submenu>
        <!-- DELETED NOTES END-->   

    </el-menu>
  </el-aside>
 
    
  <el-main style="padding-top: 0px" >
    <!-- NOTE HEADER START-->
    <div v-if="isCreateMode" >
    <el-input style="padding-bottom: 20px" 
    v-model="newNote.title" 
    
    placeholder="New title" >
        <template slot="prepend" >
          <div style="font-size: 16px">
          <i class="el-icon-notebook-1" ></i>
          {{this.newNote.notebookName}}
          </div>
          </template>
        </el-input>   

    </div>
    <div  v-if="!isCreateMode">
    <el-input style="padding-bottom: 20px" 
    v-model="chosenNote.title" 
    :readonly="titleReadOnly"
    placeholder="Change title" >

        <template slot="prepend" >
          <div style="font-size: 16px">
          <i class="el-icon-notebook-1" ></i>
          {{chosenNote.notebookName}}
          </div>
          </template>

  <i style="margin-top: 0px; font-size: 16px" 
    slot="suffix" 
    class="my-el-input__icon el-icon-edit" 
    @click="setTitleEditable()"
    ></i>

        </el-input>  


    </div> 
    
  <!-- NOTE HEADER END -->

    <!-- EDITOR START -->
    <mavon-editor :boxShadow="false" language="en" 
      ref="editor"
      codeStyle="androidstudio" 
      v-model="chosenNote.content" 
      @imgAdd="uploadImg"
      @save="handleSave()"  >
          <template slot="left-toolbar-after">
            <el-popover
            placement="right-start"
            :visible-arrow="true"
            width="200"
            trigger="click"
            >
              <div v-for="version of noteVersion" :key="version.ref">
                {{version.date}}
                    <el-button size="mini" type="text" 
                      @click="handleRecover(version.ref)">recover</el-button>
              </div>
            <button slot="reference" type="button" aria-hidden="true" 
              class="op-icon fa fa-history" @click="handleGetHistory()" :title="`History`">
            </button>
            </el-popover>
          </template>
      </mavon-editor>
          <!-- EDITOR END -->
  </el-main>
</el-container>

<!-- Right Menu of Notebook  -->
<v-contextmenu ref="notebookmenu" @contextmenu="handleNotebookMenu">
  <v-contextmenu-item @click="handleCreateNote">new note</v-contextmenu-item>
  <v-contextmenu-item @click="handleDelNotebook">delete</v-contextmenu-item>
</v-contextmenu>

<!-- Right Menu of Note -->
<v-contextmenu ref="notemenu" @contextmenu="handleNoteMenu"  >
  <v-contextmenu-item @click="handleDelNote">delete</v-contextmenu-item>
  <v-contextmenu-submenu title="move to">
    <div v-for="otherNotebook of notebookList" :key="otherNotebook.notebookName">
    <v-contextmenu-item @click="handleChangeNotebook(otherNotebook.notebookName)" v-if="rightChosenNote.notebookName !== otherNotebook.notebookName">
        {{otherNotebook.notebookName}}
    </v-contextmenu-item>
    </div>
  </v-contextmenu-submenu>
  <v-contextmenu-submenu title="copy to">
    <div v-for="otherNotebook of notebookList" :key="otherNotebook.notebookName">
    <v-contextmenu-item @click="handleCopyNote(otherNotebook.notebookName)" v-if="rightChosenNote.notebookName !== otherNotebook.notebookName">
        {{otherNotebook.notebookName}}
    </v-contextmenu-item>
    </div>
  </v-contextmenu-submenu>
  <v-contextmenu-item v-if="false" >publish</v-contextmenu-item>
</v-contextmenu>

<!-- Right Menu of DelNote Notebook -->
<v-contextmenu ref="delNotebookMenu" >
  <v-contextmenu-item @click="handleClearDelNotes">clear all</v-contextmenu-item>
</v-contextmenu>

<!-- Right Menu of DelNote -->
<v-contextmenu ref="delNoteMenu" @contextmenu="handleDelNoteMenu">
  <v-contextmenu-item @click="handleRecoverDelNote">recover</v-contextmenu-item>
  <v-contextmenu-item @click="handleClearDelNote">clear</v-contextmenu-item>
</v-contextmenu>

</div>
</template>
<script>
import axios from 'axios'
import global from '../global'


export default {
  name: 'home',
  components: {
  },
  data(){
    return {
      // 被删除笔记的列表
      delNoteList : [],
      // 定时器 获取推送远程仓库的状态
      timer : null,
      // 笔记的版本历史
      noteVersion: [],
      // 
      visible : false,
      // 新笔记本名称
      newNotebookName: "",
      isCreateMode : true,
      // 是否展示笔记本列表
      showNotebookList:true,
      // 是否展开菜单
      collapse:false,
      
      // 原始菜单内容
      originNote : {
        title : null,
        content : "",
        notebookName: null
      },
      titleReadOnly : true,
      // 选中的笔记的对应的值，可能随修改而发生变化
      chosenNote:{
        notebookName: null,
        title: null,
        content: ""
      },
      // 右键选中的笔记的信息
      rightChosenNote:{
        notebookName: null,
        title: null
      },

      // 新笔记
      newNote:{
        notebookName: null,
        title: null
      },
      notebookList: null,
      delNoteId : null,
      config : {
        headers: {
          token : this.$store.getters.getToken,
          username : this.$store.getters.getUsername
        }
      }
    }
  },
  methods: {
    setTitleEditable(){
      this.titleReadOnly = !this.titleReadOnly;
    },

  // 创建新笔记
    handleCreateNote(){
      // 如果没有内容需要保存
      if(this.isUnModified ){
        this.isCreateMode = true ;
        this.newNote.title = "" ;
        this.newNote.notebookName = this.rightChosenNote.notebookName ;

        this.resetChosenNoteAndOriginNote();
        return ;
      }

      // 有内容尚未保存
  this.$confirm('Unsaved change detected!', 'Confirm', {
          distinguishCancelAndClose: true,
          confirmButtonText: 'save',
          cancelButtonText: 'discard'
        })
          .then(() => {
            this.handleSave(this.handleCreateNote);
          })
          .catch(action => {
            this.$message({
              type: action === 'cancel'?'warning' :'info',
              message: action === 'cancel'
                ? 'Change discarded'
                : 'Stay',
                duration: 1500
            });
            if( action === 'cancel'){
              // TODO 强制清空
              this.resetChosenNoteAndOriginNote();
              this.handleCreateNote();
            }
          });

    },


    // 获取笔记  根据标题 和 笔记本名
    chooseNote(notebookName, note){

      // 如果是原来一样的笔记，不做改变
    if(this.originNote.notebookName === notebookName 
          && this.originNote.title === note ){
          return ;
      }

    // 如果没有任何修改，则直接切换
      if(this.isUnModified){

        this.refreshNote(notebookName, note);
        return ;
      }

      // 运行到，此处，表明有修改，需要用户决定是否保存
      this.$confirm('Unsaved change detected', 'Confirm', {
          distinguishCancelAndClose: true,
          confirmButtonText: 'save',
          cancelButtonText: 'discard'
        })
          .then(() => {
            this.handleSave(this.refreshNote, notebookName, note);
          })
          .catch(action => {
            this.$message({
              type: action === 'cancel' ? 'warning' : 'info',
              message: action === 'cancel'
                ? 'Change discarded'
                : 'Stay',
                duration: 1500
            });
            if( action === 'cancel'){
                this.refreshNote(notebookName, note)
            }
          });
    },
    
    // 从服务器获取笔记，根据notebook和title
    refreshNote(notebookName, note){

      let url = global.HOST_URL+"/note/"+notebookName+"/"+note;
      axios.get(url, this.config).then(res => {
        res = res.data;
        if(res.code === 0){
          this.chosenNote.content = res.data;
          this.originNote.content = res.data;
          this.chosenNote.title = note;
          this.originNote.title = note;
          this.chosenNote.notebookName = notebookName;
          this.originNote.notebookName = notebookName;
          this.isCreateMode = false;
          this.titleReadOnly = true;
        }
      })
    } ,

    // 保存笔记，有可能是新笔记
    handleSave(succCallback,arg1, arg2){
      // TODo 校验空值得情况

if(this.isCreateMode){
        if(!this.newNote.notebookName 
            || !this.newNote.title
            || this.newNote.notebookName === ""
            || this.newNote.title === ""){
            this.$message({
              type: 'warning',
              message: "Notebook or title can't be null"
            });
          return ;
        }
      }else{
        if(!this.chosenNote.notebookName 
            || !this.chosenNote.title
            || this.chosenNote.notebookName === ""
            || this.chosenNote.title === ""){
            this.$message({
              type: 'warning',
              message: "Notebook or title can't be null"
            });
          return ;
        }
      }
      // 如果是创建笔记模式，或者说标题没有改变，那么仅保存内容
      if(this.createMode || this.isTitleUnModified){
        this.handleSaveContent(succCallback, arg1, arg2);
        return ;
      }

      // 如果标题改变了，先要移动
      let url = global.HOST_URL + "/note/" + this.chosenNote.notebookName + "/" + this.chosenNote.title;
      let param = {
        srcNotebook : this.originNote.notebookName,
        srcTitle : this.originNote.title,
        move : true
      };
      axios.put(url, param, this.config).then(res => {
        res = res.data;
        if(res.code === 0){
          // 移动成功，在保存内容
          this.originNote.title  = this.chosenNote.title;
          this.handleSaveContent(succCallback, arg1, arg2);
        }else{
          this.$message({
              type: 'warning',
              message: res.msg
            });
        }
      })

    },

// selfFunc  成功后调用
    handleSaveContent(selfFunc, arg1, arg2){
      let request = {
        content: this.chosenNote.content,
        createMode: this.isCreateMode
      }
      let url ;
      if(this.isCreateMode){
          url = global.HOST_URL + "/note/" + this.newNote.notebookName + "/" + this.newNote.title;
      }else{
        url = global.HOST_URL + "/note/" + this.chosenNote.notebookName + "/" + this.chosenNote.title;
      }
      axios.post(url, request, this.config).then(res => {
        res = res.data;
        if(res.code == 0){
          this.refreshNotebookList();
          this.$message({
              type: 'success',
              message: 'Change saved',
              duration: 800
            });
          if(selfFunc){
            this.resetChosenNoteAndOriginNote();
            selfFunc(arg1, arg2);
            return ;
          }
          if(this.isCreateMode){
              this.refreshNote(this.newNote.notebookName, this.newNote.title);
          }else{
              this.refreshNote(this.chosenNote.notebookName, this.chosenNote.title);
          }
        }else{
          this.$message({
              type: 'warning',
              message: res.msg
            });
        }
      })
    },
//======================  分割线  比较稳定的方法 =================

    resetChosenNoteAndOriginNote(){
        this.chosenNote.content = "" ;
        this.chosenNote.title = null ;
        this.chosenNote.notebookName = null ;
        this.originNote.content = "" ;
        this.originNote.title = null ;
        this.originNote.notebookName = null ;
    },

    // 移动笔记至另外一个笔记本
    handleChangeNotebook(targetNotebook){
      let url = global.HOST_URL + "/note/" + targetNotebook + "/" + this.rightChosenNote.title;
      let param = {
        srcNotebook : this.rightChosenNote.notebookName,
        srcTitle : this.rightChosenNote.title,
        move : true
      }
      axios.put(url, param, this.config).then(res => {
        res = res.data;
        if(res.code === 0){
          this.refreshNotebookList();
          if(param.srcNotebook === this.chosenNote.notebookName && param.srcTitle === this.chosenNote.title){
            this.chosenNote.notebookName = targetNotebook;
              this.originNote.notebookName = targetNotebook;

          }
        }else{
          this.$message({
              type: 'warning',
              message: res.msg
            });
        }
      })
    },

// 恢复笔记至某一版本
  handleRecover(ref){
    let url = global.HOST_URL + "/note/" + this.chosenNote.notebookName + "/" + this.chosenNote.title;
    let request = {
      versionRef : ref
    };
    
    axios.post(url, request, this.config).then(res => {
      res = res.data;
      if(res.code === 0){
        this.chosenNote.content = res.data;
        this.originNote.content = res.data;
        this.handleGetHistory();
      }
    })
  },


// 拷贝笔记至另外一个笔记本
  handleCopyNote(targetNotebook){
    let url = global.HOST_URL + "/note/" + targetNotebook + "/" + this.rightChosenNote.title;
    let param = {
      srcNotebook : this.rightChosenNote.notebookName,
      srcTitle : this.rightChosenNote.title
    }
    axios.put(url, param, this.config).then(res => {
      res = res.data;
      if(res.code === 0){
        this.refreshNotebookList();
      }else{
        this.$message({
          type: 'warning',
          message: res.msg
          });
      }
    })
  },

// 恢复被删除的笔记
  handleRecoverDelNote(){
    let url = global.HOST_URL + "/delnote/" + this.delNoteId + "?recover=true";
    axios.delete(url, this.config).then(
      res => {
        res = res.data;
        if(res.code === 0){
          this.refreshNotebookList();
        }
      }
    )
  },


// 清除一个被删除笔记
    handleClearDelNote(){
      let url = global.HOST_URL + "/delnote/" + this.delNoteId;
      axios.delete(url, this.config).then(
        res => {
          res = res.data;
          if(res.code === 0){
            this.refreshNotebookList();
          }
        }
      )
    },

    // 被删除笔记的右键菜单
    handleDelNoteMenu(vnode){
      this.delNoteId = vnode.data.attrs.delNoteId;
    },

    // 检验同步备份状态
    checkPushStatus(){
      let url = global.HOST_URL + "/admin/push";
      axios.get(url, this.config).then(
        res => {
        res = res.data ;
        if(res.code === 1){
          this.$notify.error({
          title: 'ERROR',
          message: 'Push to remote repo failed'
        });
        }
        
    })
    },

    // 笔记的右键菜单
    handleNoteMenu(vnode){
      let attrs = vnode.data.attrs;
      this.rightChosenNote.notebookName = attrs.notebookName;
      this.rightChosenNote.title = attrs.title;
    },

  // 获取笔记历史
  handleGetHistory(){
    let url = global.HOST_URL+ "/note/" + this.chosenNote.notebookName + "/" + this.chosenNote.title + "/history";
    axios.get(url, this.config).then(res => {
      res = res.data;
      if(res.code === 0){
        this.noteVersion = res.data;
      }
    })
  },

  // 上传图片
  uploadImg(pos, $file){
  // 第一步.将图片上传到服务器.
        let param = new FormData();
        param.append('file', $file);
        let config = {
            headers: { 
              'Content-Type': 'multipart/form-data',
                token : this.config.headers.token,
                username : this.config.headers.username
            }
        };  
        //添加请求头
        let url = global.HOST_URL + "/file";
        axios.post(url, param, config).then(res => {
          res = res.data;
          if(res.code !== 0){
            return ;
          }
          this.$refs.editor.$img2Url(pos, res.data);
        });
    },
       //  清楚所有被删除笔记
    handleClearDelNotes(){
      let url = global.HOST_URL + "/delnote";
      axios.delete(url, this.config).then(
        res => {
          res = res.data;
          if(res.code === 0){
            this.delNoteList = [];
          }
        }
      )
    },



  // 删除笔记本
  handleDelNotebook(){
    let url = global.HOST_URL+"/note/"+this.rightChosenNote.notebookName;
    axios.delete(url, this.config).then(res => {
      res = res.data;
      if(res.code === 0){
        this.refreshNotebookList();
      }
    })
  },

    // 创建新笔记本
  handleCreateNotebook(){
    let url = global.HOST_URL+"/note/"+this.newNotebookName;
    axios.put(url, null, this.config).then(res => {
      res = res.data;
      if(res.code === 0){
        this.refreshNotebookList();
      }
    })
    this.visible = false;
    this.newNotebookName = '';
  },
  // 获取右键选中的笔记本
  handleNotebookMenu(vnode){
      let attrs = vnode.data.attrs;
      let notebookName = attrs.notebookName;
      this.rightChosenNote.notebookName = notebookName;

  },

  // 删除笔记
  handleDelNote(){
    let url = global.HOST_URL + "/note/" + this.rightChosenNote.notebookName + "/" + this.rightChosenNote.title;
    axios.delete(url, this.config).then( res => {
      res = res.data;
      if(res.code === 0){
        this.refreshNotebookList();
        if(this.rightChosenNote.notebookName == this.chosenNote.notebookName 
        && this.rightChosenNote.title == this.chosenNote.title){
          this.resetChosenNoteAndOriginNote();
        }
      }
    })
  },

// 刷新笔记列表
refreshNotebookList(){
    axios.get(global.HOST_URL+"/note", this.config).then(res => {
      res = res.data;
      if(res.code === 0){
        this.notebookList = res.data;
      }
    })
    axios.get(global.HOST_URL+"/delnote", this.config).then( res => {
      res = res.data;
      if(res.code === 0){
        this.delNoteList = res.data;
      }
    } )
  },
  // 删除本地存储信息  并切换至登录页面
  clearInfoAndPushToLogin(){
    this.$store.commit('setLocalInfo', {});
    this.$message({
              type: 'warning',
              message: 'Need login',
              duration: 1000
      });
    setTimeout(()=>{this.$router.push('/login');},700);
  },
  // 注销登录
  handleLogout(){
      let url = global.HOST_URL + "/user/logout";
      axios.post(url, null, this.config);
      this.$store.commit('setLocalInfo', {});
      setTimeout(()=>{this.$router.push('/login');},500);
    },
doInit(){
        this.refreshNotebookList();
        this.checkUnsavedNote();
        // todo 将时间改为5min，与后台保持一致
        this.timer = setInterval(() => {
          this.checkPushStatus();
          this.autoSaveDraftNote();
        }, 1 * 60 * 1000);
},
checkUnsavedNote(){
      let url = global.HOST_URL + "/draftNote" ;
      axios.get(url, this.config).then(
        res => {
            res = res.data;
            if(res.code === 0){
              let draftNoteList = res.data;
              if(draftNoteList.length > 0){
                this.alertUnsavedDraftNote(draftNoteList);
              }
            }
        }
      )

},
alertUnsavedDraftNote(draftNoteList){
        let draftNote = draftNoteList[0];
      
        this.$confirm("There is unsaved note: " + draftNote.notebookName + "/" + draftNote.title + ",  " + draftNote.updateTime,
         'Notice', {
          confirmButtonText: 'confirm',
          cancelButtonText: 'cancel',
          type: 'warning'
        }).then(() => {
          let request = {
            content: draftNote.content,
          }
          let url = global.HOST_URL + "/note/" + draftNote.notebookName + "/" + draftNote.title;
          axios.post(url, request, this.config).then(
            res => {
              res = res.data;
              if(res.code === 0){
                this.refreshNotebookList();
              }
            }
          )
      
        }).catch(() => {
          // this.deleteDraftNote(draftNote.notebookName, draftNote.title);
          this.deleteAllDraftNotes();
          }
        );
      }
,
deleteDraftNote(notebookName, title){
    let url = global.HOST_URL + "/draftNote/" + notebookName + "/" + title;
    axios.delete(url, this.config);
},
deleteAllDraftNotes(){
    let url = global.HOST_URL + "/draftNote";
    axios.delete(url, this.config);
},
autoSaveDraftNote(){
  if(this.isContentUnModified){
    return ;
  }
  let url ;
  if(this.isCreateMode){
      url = global.HOST_URL + "/draftNote/" + this.newNote.notebookName + "/" + this.newNote.title;
      if(!this.newNote.notebookName || !this.newNote.title){
        return ;
      }
  }else{
      url = global.HOST_URL + "/draftNote/" + this.chosenNote.notebookName + "/" + this.chosenNote.title;
      if(!this.chosenNote.notebookName || !this.chosenNote.title){
        return ;
      }
  }
  let param = {
    content : this.chosenNote.content
  }
  axios.post(url, param, this.config);
},
  validateUser(){
      let url = global.HOST_URL + "/user/validate";
    axios.post(url, null, this.config).then(
      res => {
        res = res.data;
        if(res.code !== 0){
            this.clearInfoAndPushToLogin();
        }else{
            this.doInit();
        }
      }
    )
    }

},
  mounted () {
    if(!this.config.headers.token){
      this.clearInfoAndPushToLogin();
      return ;
    }
    this.validateUser();
  },
  // TODO create validate before created
  beforeDestroy(){
      clearInterval(this.timer);
  },
  computed:{
    // 标题是否被修改
    isTitleUnModified: function () {
      return this.originNote.title === this.chosenNote.title;
    },
    // 内容是否被修改
    isContentUnModified : function() {
      return this.originNote.content === this.chosenNote.content;
    },
    // 是否无改动
    isUnModified: function(){
      return this.originNote.title === this.chosenNote.title &&
              this.originNote.content === this.chosenNote.content;
    }
  }
}
</script>
<style>
.title{
  margin: 0px 0px 10px 0px;
  padding: 10px 10px 10px 21px;
  font-size: 20px;
  background-color: rgb(249, 249, 249);
}
.notebookList{
  margin-left: 10px;
  padding-left: 5px;
  margin-bottom: 5px;
}
#hanshi-note{
  padding-right: 22px;
  font-size: 30px;
}
.my-el-input__icon {
  padding-top: 12px;
    height: 100%;
    width: 25px;
    text-align: center;
    -webkit-transition: all .3s;
    transition: all .3s;
    line-height: 40px;
}
</style>
