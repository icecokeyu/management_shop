<template>
  <el-container id="home">
    <!-- 头部区域 -->
    <el-header>
      <div>
        <img src="~assets/img/heima.png" alt="">
        <span>电商后台管理系统</span>
      </div>
      <el-button type="info" @click="logout">退出</el-button>
    </el-header>
    <!-- 页面主体区域 -->
    <el-container>
      <!-- 页面侧边栏 -->
      <el-aside width="isCollapse ? '64px' : 200px" @changeCollapse="changeCollapse(collapse)">
        
        <home-menu/>
      </el-aside>
      <!-- 右侧内容主体 -->
      <el-main>
        <!-- home的子路由welcome -->
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
  
    

</template>

<script>
import HomeMenu from './childComps/HomeMenu.vue'
export default {
  components: { HomeMenu },
  name: 'Home',
  data() {
    return {
      isCollapse: false
    }
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    changeCollapse(collapse) {
      this.isCollapse = collapse;
    }
  }
}
</script>

<style scoped>
  #home {
    height: 100%;
  }

  .el-header {
    background-color: #373d41;
    display: flex;
    justify-content: space-between;
    padding-left: 0;
    align-items: center;
    color: #fff;
    font-size: 20px;

  }
  .el-header div {
    display: flex;
    align-items: center;
  }

  .el-header div span {
    margin-left: 15px;
  }

  .el-aside {
    background-color: #333744;
  }

  .el-main {
    background-color: #eaedf1;
  }
</style>