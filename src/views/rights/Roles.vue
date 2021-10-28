<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加角色按钮 单独占一行 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addRoleDialog = true">添加角色</el-button>
        </el-col>
      </el-row>
      <el-table :data="rolesList" style="width: 100%" :border="true" :stripe="true">
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <!-- 渲染一级列表 -->
            <el-row 
            v-for="(item1, i1) in scope.row.children" 
            :key="item1.id"
            :class="['bdbottom', i1 === 0 ? 'bdtop': '', 'vcenter']"
            >
              <el-col :span="5">
                <el-tag closable type="" @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-arrow-right"></i>
              </el-col>
              <el-col :span="19">
                <!-- 渲染二级列表和三级列表 -->
                <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']">
                  <el-col :span="6">
                    <el-tag closable type="success" @close="removeRightById(scope.row, item2.id)">{{item2.authName}}</el-tag>
                    <i class="el-icon-arrow-right"></i>
                  </el-col>
                  <el-col :span="18">
                    <el-tag closable type="warning" v-for="item3 in item2.children" :key="item3.id" @close="removeRightById(scope.row, item3.id)">{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button type="primary" icon="el-icon-edit" @click="editRoleInfo(scope.row.id)"></el-button>
            <el-button type="danger" icon="el-icon-delete" @click="deleteRoleInfo(scope.row.id)"></el-button>
            <el-button type="warning" icon="el-icon-setting" @click="ModifyRolesRight(scope.row)"></el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 添加用户dialog弹框 -->
    <el-dialog
      title="添加角色"
      :visible.sync="addRoleDialog"
      width="50%"
      @close="addDialogclosed"
      >
      <!-- 内容区域 -->
      <el-form :model="addForm" :rules="formRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addRoleDialog = false">取 消</el-button>
        <el-button type="primary" @click="addRole">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 修改用户dialog弹框 -->
    <el-dialog
      title="修改用户角色"
      :visible.sync="editDialogVisible"
      width="50%"
      >
      <!-- 内容区域 -->
      <el-form :model="roleInfo" :rules="formRules" ref="editFormRef" label-width="100px">
        <el-form-item label="角色名称" prop="roleName">
          <el-input v-model="roleInfo.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色描述" prop="roleDesc">
          <el-input v-model="roleInfo.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="commitEdit">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 分配权限dialog弹框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="modifyRolesDialogVisible"
      width="50%"
      @close="resetDefKeys"
      >
      <!-- 树形控件 -->
      <el-tree :data="rolesRight" :props="treeProps" show-checkbox default-expand-all node-key="id" :default-checked-keys="defKeys" ref="treeRef"></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="modifyRolesDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmModifyRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'Roles',
  data() {
    return {
      rolesList: [],
      addRoleDialog: false,
      editDialogVisible: false,
      // 添加角色的信息
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 添加角色dialog规则
      formRules: {
        roleName: [
          { required: true, message: '角色名称不能为空', trigger: 'blur' }
        ]
      },
      // 角色信息
      roleInfo: {},
      // 分配权限对话框是否隐藏
      modifyRolesDialogVisible: false,
      rolesRight: [],
      treeProps: {
          children: 'children',
          label: 'authName'
      },
      defKeys: [],
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    async getRolesList() {
      const {data: res} = await this.$http.get('/roles')
      // console.log(res);
      if(res.meta.status !== 200) {
        this.$message.error('获取角色列表失败！')
      }
      this.rolesList = res.data
    },
    // 当对话框关闭时重置表单
    addDialogclosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加角色
    addRole() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        // 可以添加用户信息
        const {data: res} = await this.$http.post('/roles', this.addForm)
        console.log(res);
        if(res.meta.status !== 201) {
          return this.$message.error('添加角色不成功')
        }
        this.$message.success('添加角色成功')
        this.addRoleDialog = false
        this.getRolesList()
      })
    },
    // 点击修改，发起网络请求获取相关数据并保存
    async editRoleInfo(id) {
      // console.log(id);
      const {data: res} = await this.$http.get('/roles/' + id)
      if(res.meta.status !== 200) return this.$message.error('角色信息查询失败！')
      // 查询成功，要保存角色信息
      this.roleInfo = res.data
      this.editDialogVisible = true
    },
    // 点击确定修改按钮，发送修改请求
    async commitEdit() {
      const {data: res} = await this.$http.put('/roles/' + this.roleInfo.roleId, {
        roleName: this.roleInfo.roleName,
        roleDesc: this.roleInfo.roleDesc
      })
      if(res.meta.status !== 200) return this.$message.error('修改角色信息不成功！')
      // 修改成功
      // 1.提示修改成功
      this.$message.success('修改角色信息成功！')
      // 2.关闭弹框
      this.editDialogVisible = false
      // 3.刷新角色列表
      this.getRolesList()
    },
    // 点击删除按钮，删除用户信息
    async deleteRoleInfo(id) {
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
      const {data: res} = await this.$http.delete('roles/' + id)
      if(res.meta.status !== 200) {
        this.$message.error('删除角色信息失败！')
      }
      // 删除用户信息成功
      // 1.提示信息
      this.$message.success('删除角色信息成功！')
      // 2.刷新用户列表 调用getUsersList
      this.getRolesList()
    },
    // 删除用户的权限
    async removeRightById(role, rightId) {
      const confirmResult =  await this.$confirm('此操作将永久删除该权限, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }).catch(err => err)
      // 如果点击确定 返回值是confirm
      if(confirmResult !== 'confirm') return this.$message.info('已经取消了删除权限！')
      const {data: res} = await this.$http.delete(`roles/${role.id}/rights/${rightId}}`)
      if(res.meta.status !== 200) {
        this.$message.error('删除权限失败！')
      }
      // 删除权限成功  不要重新调用getRolesList()，这样会造成整个表单重新渲染
      role.children = res.data
    },
    // 分配用户权限
    async ModifyRolesRight(role) {
      const {data: res} = await this.$http.get('rights/tree')
      console.log(res);
      this.rolesRight = res.data
      // 调用addDefKefs函数，获取默认勾选的子节点id数组
      this.addDefKefs(role, this.defKeys)
      // 保存当前角色的id
      this.roleId = role.id
      this.modifyRolesDialogVisible = true
    },
    addDefKefs(node, arr) {
      // 如果当前节点没有children属性，说明是三级节点
      if(!node.children) {
        return arr.push(node.id)
      }
      // 不是三级节点的时候 用递归的方法遍历节点
      node.children.forEach(item => this.addDefKefs(item, arr))
    },
    // 每次关闭分配权限dialog弹框，应该清空保存id的数组，不然会越来越多
    resetDefKeys() {
      this.defKeys = []
    },
    // 当分配权限完成，点击了确定 
    async confirmModifyRights() {
      // 首先要把半选和全选状态下的按钮id加入到一个数组中
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      let keysStr = keys.join(',')
      // 发起网络请求
      const {data: res} = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: keysStr 
      })
      if(res.meta.status !== 200) {
        return this.$message.error('更新权限不成功！')
      }

      // 更新权限成功
      this.$message.success('更新权限成功！')
      this.getRolesList()
      this.modifyRolesDialogVisible = false
    }
  }
}
</script>

<style scoped>

.el-tag {
  margin: 7px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>

