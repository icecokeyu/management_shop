<template>
  <div class="login-containter">
    <div class="login-box">
      <!-- 头部区域 -->
      <div class="avatar_box">
        <img src="~assets/img/logo.png" alt="">
      </div>
      <!-- 登陆表单区域 -->
      <el-form label-width="0px" class="login_form">
        <!-- 用户名 -->
        <el-form-item>
          <el-input/>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item>
          <el-input/>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="login_btn">
          <el-button type="primary">登陆</el-button>
          <el-button type="info">重置</el-button>
        </el-form-item>
      </el-form>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login'
}
</script>

<style scoped>
  .login-containter {
    background-color: #2b4b6b;
    position: relative;
    height: 100%;
  }

  .login-box {
    position: absolute;
    width: 450px;
    height: 300px;
    top: 50%;
    left: 50%;
    margin-top: -150px;
    margin-left: -225px;
    background-color: #fff;
    border-radius: 5px;
  }

  .avatar_box {
    position: absolute;
    height: 130px;
    width: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;
    
  }

  .avatar_box img {
    height: 100%;
    width: 100%;
    border-radius: 50%;
    background-color: #eee;
  }

  .login_form {
    position: absolute;
    bottom: 0;
    width: 100%;
    padding: 0 20px;
    box-sizing: border-box;
  }

  .login_btn {
    display: flex;
    justify-content: flex-end;
  }
  
</style>