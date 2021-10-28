<template>
  <div>
    <!-- 表格区域 -->
    <el-table :data="usersList" style="width: 100%" :stripe="true" :border="true" >
      <el-table-column type="index"></el-table-column>
      <el-table-column label="姓名" prop="username" ></el-table-column>
      <el-table-column label="邮箱" prop="email" ></el-table-column>
      <el-table-column label="电话" prop="mobile" ></el-table-column>
      <el-table-column label="角色" prop="role_name" ></el-table-column>
      <el-table-column label="状态">
        <template slot-scope="scope">
          <el-switch v-model="scope.row.mg_state" @change="usersStateChange(scope.row)"></el-switch>
        </template>
      </el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(scope.row.id)"></el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteUserInfo(scope.row.id)"></el-button>
          <el-tooltip class="item" effect="dark" content="分配角色" placement="top" :enterable="false">
            <el-button type="warning" icon="el-icon-setting" size="mini" @click="setRolesInfo(scope.row)"></el-button>
          </el-tooltip>
        </template>
      </el-table-column>
    </el-table>
  <!-- 修改用户信息dialog -->
    <el-dialog
    title="修改用户信息"
    :visible.sync="editDialogVisible"
    width="50%"
    >
    <!-- 内容部分 -->
    <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
      <el-form-item label="用户名">
        <el-input v-model="editForm.username" disabled></el-input>
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="editForm.username"></el-input>
      </el-form-item>
      <el-form-item label="手机" prop="mobile">
        <el-input v-model="editForm.mobile"></el-input>
      </el-form-item>
    </el-form>
    <!-- 底部取消和确定按钮 -->
    <span slot="footer" class="dialog-footer">
      <el-button @click="editDialogVisible = false" @close="editFormClosed">取 消</el-button>
      <el-button type="primary" @click="addUserInfo">确 定</el-button>
    </span>
    </el-dialog>
    <!-- 分配用户角色对话框 -->
    <el-dialog
      title="分配角色"
      :visible.sync="setRolesDialogVisible"
      width="50%"
      @close="setRolesDialogClosed"
      >
      <p>当前的用户：{{userInfo.username}}</p>
      <p>当前的角色：{{userInfo.role_name}}</p>
      <p>
        分配新角色：
        <el-select v-model="selectedRoleId" placeholder="请选择">
          <el-option
            v-for="item in rolesList"
            :key="item.id"
            :label="item.roleName"
            :value="item.id">
          </el-option>
        </el-select>
      </p>
      <span slot="footer" class="dialog-footer">
        <el-button @click="setRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="comfirmSetRole">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'UsersTable',
  props: {
    usersList: {
      type: Array,
      default() {
        return []
      }
    }
  },
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
      editDialogVisible: false,
      setRolesDialogVisible: false,
      editForm: {},
      editFormRules: {
        email: [
          {required: true, message: '邮箱不能为空', trigger: 'blur' },
          {validator: checkEmail, message:'邮箱格式不正确，请重新输入', trigger: 'blur'}
        ],
        mobile: [
          {required: true, message: '手机不能为空', trigger: 'blur' },
          {validator: checkMobile, message:'手机号码格式不正确，请重新输入', trigger: 'blur'}
        ]
      },
      // 用户信息
      userInfo: {},
      // 分配角色弹框的角色信息
      rolesList: [],
      selectedRoleId: ''
    }
  },
  methods: {
    // 修改用户状态
    async usersStateChange(userinfo) {
      const {data: res} =  await this.$http.put(`users/${userinfo.id}/state/${userinfo.mg_state}`)
      if(res.meta.status !== 200) {
        userinfo.mg_state = !userinfo.mg_state
        return this.$message.error('修改用户状态失败！')
      }
      this.$message.success('修改用户数据成功')
    },
    // 点击修改按钮，根据用户id查询相关信息并保存
    async showEditDialog(id) {
      const {data: res} = await this.$http.get('/users/' + id)
      console.log(res.meta.status);
      if(res.meta.status !== 200) {
        return this.$message.error('查询用户信息失败')
      }
      this.editDialogVisible = true
      this.editForm = res.data
    },
    // 点击取消按钮时，重置修改用户表单
    editFormClosed() {
      this.$refs.editFormRef.resetFileds()
    },
    // 对修改表单进行预验证，并发起修改用户信息的请求
    addUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.put('users/' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if(res.meta.status !== 200) return this.$message.error('更新用户信息失败！')
        //更新用户数据成功
        // 1.关闭dialog
        this.editDialogVisible = false
        // 2.重新调用getUsersList函数，刷新列表
        this.$emit('refreshUsersList')
        // 3.提示信息
        this.$message.success('修改用户信息成功！')
      })
    },
    // 根据id删除用户信息
    async deleteUserInfo(id) {
      const confirmResult = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)
      // 点击取消 confirmResult值为cancel
      // 点击确定 confirmResult值为confirm
      // console.log(confirmResult);
      if(confirmResult !== 'confirm') {
        return this.$message.info('已取消了删除')
      }
      const {data: res} = await this.$http.delete('users/' + id)
      if(res.meta.status !== 200) {
        this.$message.error('删除用户信息失败！')
      }
      // 删除用户信息成功
      // 1.提示信息
      this.$message.success('删除用户信息成功！')
      // 2.刷新用户列表 调用getUsersList
      this.$emit('refreshUsersList')
    },
    // 分配用户角色
    async setRolesInfo(role) {
      this.userInfo.username = role.username
      this.userInfo.role_name = role.role_name
      this.userInfo.id = role.id
      console.log(this.userInfo);
      // 发起网络请求获取所有角色列表
      const {data: res} = await this.$http.get('roles')
      if(res.meta.status !== 200) {
        return this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
      this.setRolesDialogVisible = true
    },
    // 确定分配用户角色
    async comfirmSetRole() {
      if(!this.selectedRoleId) {
        this.$message.error('未分配新的用户角色！')
      }
      const {data: res} = await this.$http.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectedRoleId
      })
      if(res.meta.status !== 200) {
        this.$message.error('分配用户角色失败')
      }
      this.$message.success('分配用户角色成功！')
      this.$emit('refreshUsersList')
      this.setRolesDialogVisible = false
    },
    // 对话框关闭后，重置拉选框
    setRolesDialogClosed() {
      this.selectedRoleId = '',
      this.userInfo = ''
    }
  }
}
</script>

<style scoped>

</style>