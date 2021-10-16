<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头部区域 -->
      <div class="avatar_box">
        <img src="~assets/img/logo.png" alt="">
      </div>
      <!-- 登陆表单区域 -->
      <el-form 
      label-width="0px" 
      class="login_form" 
      :model="loginForm" 
      :rules="loginFormRules"
      ref="loginFormRef"
      >
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input prefix-icon="el-icon-user-solid" v-model="loginForm.username"></el-input>
        </el-form-item>
        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input prefix-icon="el-icon-lock" v-model="loginForm.password" type="password"></el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="login_btn">
          <el-button type="primary" @click="login">登陆</el-button>
          <el-button type="info" @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
      
    </div>
  </div>
</template>

<script>
export default {
  name: 'Login',
  data() {
    return {
      // 这是登陆表单绑定的数据对象
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      loginFormRules: {
        username: [
          { required: true, message: '请输入登录名称', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetForm() {
      this.$refs.loginFormRef.resetFields()
    },
    login() {
      this.$refs.loginFormRef.validate(async (valid) => {
        console.log(valid);
        if (!valid) return
        const { data: res } = await this.$http.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败')
        this.$message.success('登录成功')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
      })
    },
  }
}
</script>

<style scoped>
  .login_container {
    background-color: #2b4b6b;
    position: relative;
    height: 100%;
  }

  .login_box {
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