<template>
<div>
  

  <div style="padding-bottom: 10px">
<router-link style="color: black ; text-decoration: none;" to="/">
  <el-button >Back to Home</el-button>
</router-link>
  </div>
  <el-tabs type="border-card" tab-position="top" >
    <el-tab-pane  label="Change password">
    <el-form  label-width="110px" @keyup.enter.native = "handleChangePassword">
      <el-form-item class="noselect" label="Old Password">
        <el-input v-model = "oldPassword" type="password" style="max-width: 500px; margin-right: 20px" 
          placeholder="old password"></el-input>
      </el-form-item>
      <el-form-item class="noselect" label="New Password">
        <el-input v-model = "newPassword" type="password" style="max-width: 500px; margin-right: 20px" 
          placeholder="new password"></el-input>
      </el-form-item>
      <el-form-item>
          <el-button type="primary" @click="handleChangePassword()">submit</el-button>
      </el-form-item>
    </el-form>

    </el-tab-pane>

<!--   Remote repository section START--->
    <el-tab-pane label="Remote backup repository">
        <!-- <el-alert
        style="margin-bottom: 20px"
    title="Steps"
    description="Step1: generate ssh key; Step2: copy the generted ssh key and set; Step3: set the remote repository url"
    type="info">
    <div slot="description"></div>
  </el-alert> -->
    <el-form  label-width="100px">
                  <el-form-item class="noselect"  label="Instruction">
                                <div >Complete the following 3 steps, and click the buttons to start or stop backuping your notes to reomte</div>

                  </el-form-item>

            <el-form-item class="noselect"  label="Step 1">
              Click the button, and ssh key will be generated
                    <el-button style="margin-left: 3px" class="noselect" type="primary" @click="handleGenSshKey()">generate</el-button>
                    <div v-if="genSshKey">
                    <p style="margin-top: 0px; margin-bottom: 0px" >generated key</p>
<el-input type="textarea"
:readonly="true"
  autosize
  v-model = "sshkey" style="max-width: 500px; margin-right: 20px ; padding-top: 0; color: grey" 
          ></el-input>
          </div>
            </el-form-item>
                        <el-form-item class="noselect"  label="Step 2">
                          Copy the above generated ssh key, and paste in the remote
                        </el-form-item>

             
      <el-form-item class="noselect" label="Step 3">
        Input the remote git repoitory url, and click the submit button
        <br/>
        <el-input v-model = "remoteRepoUrl" style="max-width: 500px; margin-right: 20px" 
          placeholder="remote repoitory url"></el-input>
                    <el-button type="primary" @click="handleSetRemoteRepo()">submit</el-button>
      </el-form-item>

     <el-form-item>
        <el-button type="primary" @click="handleStartPush()">start</el-button>
            <el-button @click="handleStopPush()">stop</el-button>
     </el-form-item>
    </el-form>
    </el-tab-pane>
    <!--   Remote repository section END--->

  </el-tabs>
</div>
</template>
<script>
import axios from 'axios'
import global from '../global'


export default {
    name: "admin",
    data() {
      return {
        genSshKey: false,
        sshkey: "",
        remoteRepoUrl: null,
        oldPassword : null,
        newPassword : null,
        config : {
          headers: {
            token : this.$store.getters.getToken,
            username : this.$store.getters.getUsername
          }
        }
      };
    },
    methods: {
      handleStartPush(){
        let url = global.HOST_URL + "/admin/push";
            axios.post(url, null, this.config).then(res => {
              res = res.data;
              if(res.code === 0){
              this.$message({
              type: 'success',
              message: 'Start push to remote successfully',
              duration: 1000
            });
              }
            }
          )
      },
      handleStopPush(){
          let url = global.HOST_URL + "/admin/push";
            axios.delete(url, this.config).then(res => {
              res = res.data;
              if(res.code === 0){
              this.$message({
              type: 'success',
              message: 'Stop push to remote successfully',
              duration: 1000
            });
              }
            }
          )
      },
      handleSetRemoteRepo(){
        let param = {
          remoteRepoUrl : this.remoteRepoUrl
        }
        let url = global.HOST_URL + "/admin/remote";
        axios.put(url, param, this.config).then(res => {
          res = res.data;
          if(res.code === 0){
            this.$message({
                    type: 'success',
                    message: 'Set remote repo url successfully'
                  });
          }
        })
      },
      handleGenSshKey(){
        this.genSshKey = false;
        let url = global.HOST_URL + "/admin/sshkey";
        axios.post(url, null, this.config).then(res => {
            res = res.data;
            if(res.code !== 0){
              return ;
            }
            this.sshkey = res.data;
            this.genSshKey = true;
        })
      },
      handleChangePassword(){
          let url = global.HOST_URL + "/user/changePass";
          let request = {
            password : this.oldPassword,
            newPassword : this.newPassword
          };
          axios.post(url, request, this.config).then(
            res => {
              res = res.data;
              if(res.code === 0){
                  this.$message({
                    type: 'success',
                    message: 'Change password successfully'
                  });
                  this.newPassword = null,
                  this.oldPassword = null
              }else{
                this.$message({
                    type: 'warning',
                    message: res.msg
                  });
              }
            }
          )
      }
    },
    mounted () {
      if(!this.config.headers.token){
      this.$message({
                    type: 'warning',
                    message: 'Need login'
                  });
      setTimeout(()=>{this.$router.push('/login');},700);
      return ;
    }
    let url = global.HOST_URL + "/user/validate";
    axios.post(url, null, this.config).then(
      res => {
        res = res.data;
        if(res.code === 0){
          return ;
        }
        this.$store.commit('setLocalInfo', {});
        this.$message({
                  type: 'warning',
                  message: 'Need login',
                  duration: 1500
            });
        setTimeout(()=>{this.$router.push('/login');},700);
        
      }
    )
    // TODO user info
    let getRemoteRepoUrl = global.HOST_URL + "/admin/remote";
    axios.get(getRemoteRepoUrl, this.config).then(
      res => {
        res = res.data;
        if(res.code === 0){
          this.remoteRepoUrl = res.data;
        }
      }
    )
    }
  };
</script>
<style>
.el-tabs__item{

    -webkit-touch-callout: none; /* iOS Safari */
    -webkit-user-select: none; /* Chrome/Safari/Opera */
    -khtml-user-select: none; /* Konqueror */
    -moz-user-select: none; /* Firefox */
    -ms-user-select: none; /* Internet Explorer/Edge */
    user-select: none; /* Non-prefixed version, currentlynot supported by any browser */
}
</style>

