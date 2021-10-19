<template>
  <div class="users" ref="usersRef">
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card class="box-card">
      <!-- layout 通过基础的 24 分栏，迅速简便地创建布局。 -->
      <el-row :gutter="20">
        <el-col :span="8">
          <!-- 搜索框 -->
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
            <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <!-- 添加用户按钮 -->
          <el-button type="primary" @click="dialogVisible = true">添加用户</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域 -->
      <users-table :usersList="usersList" @refreshUsersList="refreshUsersList"></users-table>
    </el-card>
    <!-- 分页区域 -->
    <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 2, 3, 4]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
    </el-pagination>
    <!-- 添加用户弹出对话框 -->
    <el-dialog
    title="提示"
    :visible.sync="dialogVisible"
    width="50%"
    @close="addDialogClosed"
    >
    <!-- 内容主题区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px" label="添加用户">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
  </el-dialog>
  </div>
</template>

<script>
import UsersTable from './usersComps/UsersTable'
export default {
  components: { UsersTable},
  name: 'Users',
  data() {
    var checkEmail = (rule, value, cb) => {
      // 验证邮箱的正则表达式
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/

      if (regEmail.test(value)) {
        // 合法的邮箱
        return cb()
      }

      cb(new Error('请输入合法的邮箱'))
    }
    // 验证手机号的规则
    var checkMobile = (rule, value, cb) => {
      // 验证手机号的正则表达式
      const regMobile = /^(0|86|17951)?(13[0-9]|15[012356789]|17[678]|18[0-9]|14[57])[0-9]{8}$/

      if (regMobile.test(value)) {
        return cb()
      }

      cb(new Error('请输入合法的手机号'))
    }
    return {
      queryInfo: {
        query: '',
        // 当前页码
        pagenum: 1,
        // 当前每页显示的条数
        pagesize: 2
      },
      usersList: [],
      total: 0,
      // 判断添加用户弹窗是否显示
      dialogVisible: false,
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 验证规则
      addFormRules: {
        username: [
          { required: true, message: '姓名不能为空', trigger: 'blur' },
          { min: 3, max: 10, message: '长度在 3 到 10 个字符', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '密码不能为空', trigger: 'blur' },
          { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '邮箱不能为空', trigger: 'blur' },
          {validator: checkEmail, message:'邮箱格式不正确，请重新输入', trigger: 'blur'}
        ],
        mobile: [
          { required: true, message: '手机不能为空', trigger: 'blur' },
          {validator: checkMobile, message:'手机号码格式不正确，请重新输入', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getUsersList()
  },
  methods: {
    // 获取数据并保存
    async getUsersList() {
      const {data: res} = await this.$http.get('/users', {
        params: this.queryInfo
      })
      if(res.meta.status !== 200) {return this.$message.error('获取用户数据失败')}
      this.usersList = res.data.users
      this.total = res.data.total
    },
    // 监听pageSize改变的时间
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUsersList()
    },
    // 监听页码值改变的事件
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUsersList()
    },
    // 点击取消重置dialog对话框
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新的用户
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return 
        // 可以添加用户信息
        const {data: res} = await this.$http.post('/users', this.addForm)
        if(res.meta.status !== 201) {
          return this.$message.error('添加用户不成功')
        }
        this.$message.success('添加用户成功')
        this.dialogVisible = false
        this.getUsersList()
      })
    },
    refreshUsersList() {
      this.getUsersList()
    }
  }
}
</script>

<style scoped>

</style>