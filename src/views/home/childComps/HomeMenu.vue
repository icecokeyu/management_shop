<template>
  <div>
    <!-- 折叠按钮 -->
    <div class="toggle-botten" @click="toggleCollapse">|||</div>
    <el-menu
        background-color="#333744"
        text-color="#fff"
        active-text-color="#409eff"
        :unique-opened="true"
        :collapse="isCollapse"
        :collapse-transition="false"
        :router="true"
        :default-active="activePath"
        >
        <!-- 一级菜单 -->
        <el-submenu :index="item.path + ''" v-for="item in menuList" :key="item.id">
          <!-- 一级菜单模板 -->
          <template slot="title">
            <i :class="iconObj[item.id]"></i>
            <span>{{item.authName}}</span>
          </template>
          <!-- 二级菜单 -->
          <el-menu-item 
          :index="'/' + subItem.path" 
          v-for="subItem in item.children" 
          :key="subItem.id"
          @click="saveActiveStatus('/' + subItem.path)"
          >
          <!-- 二级菜单模板 -->
            <template slot="title">
              <i class="el-icon-menu"></i>
              <span>{{subItem.authName}}</span>
            </template>
          </el-menu-item> 
        </el-submenu>
    </el-menu>
  </div>
  
</template>

<script>

export default {
  name: 'HomeMenu',
  data() {
    return {
      menuList: [],
      iconObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    async getMenuList() {
      const {data: res} = await this.$http.get('menus')
      if(res.meta.status !== 200) return this.$message.console.error(res.meta.msg);
      this.menuList = res.data
    },
    toggleCollapse() {
      this.isCollapse = !this.isCollapse;
      // 子组件向父组件传递参数，发送事件方法
      this.$emit('changeCollapse', this.isCollapse)
    },
    saveActiveStatus(activePath) {
      // 把路径保存在window.sessimStorage中
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style scoped>
  .el-menu {
    border-right: 0;
  }
  .toggle-botten {
    background-color: #4a5064;
    font-size: 10px;
    color: #fff;
    height: 24px;
    text-align: center;
    letter-spacing: 0.2em;
    line-height: 24px;
    cursor: pointer;
  }
</style>