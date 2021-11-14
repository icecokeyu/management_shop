<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 提示信息区域 -->
      <el-alert
        title="注意：只允许为第三级分类设置相关参数！"
        :closable="false"
        show-icon
        type="warning">
      </el-alert>
      <!-- 选择商品分类区域 -->
      <el-row>
        <el-col>
          <span>选择商品分类：</span>
          <!-- cascader级联选择框 -->
          <el-cascader
            v-model="selectedKeys"
            :options="cateList"
            :props="cateProps"
            @change="cascaderChanged">
          </el-cascader>
        </el-col>
      </el-row>
      <!-- tab栏切换区域 -->
      <el-tabs v-model="activeName" @tab-click="handleCateClick">
        <!-- 动态参数 -->
        <el-tab-pane label="动态参数" name="many">
          <el-button type="primary" size="mini" :disabled="activeBtn" @click="addParams">添加参数</el-button>
          <!-- 渲染动态参数表格 -->
          <el-table :data="manyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="参数名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParams(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 静态属性 -->
        <el-tab-pane label="静态属性" name="only">
          <el-button type="primary" size="mini" :disabled="activeBtn" @click="addParams">添加参数</el-button>
          <!-- 渲染静态参数表格 -->
          <el-table :data="onlyTableData" border stripe>
            <!-- 展开列 -->
            <el-table-column type="expand"></el-table-column>
            <!-- 索引列 -->
            <el-table-column type="index"></el-table-column>
            <el-table-column prop="attr_name" label="属性名称"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button type="primary" icon="el-icon-edit" size="mini" @click="editParams(scope.row.attr_id)">编辑</el-button>
                <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteParams(scope.row.attr_id)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数、属性dialog弹框 -->
    <el-dialog
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
      >
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addForm.attr_name"></el-input>
        </el-form-item>
      </el-form>  
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmAdd">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑参数 dialog弹框 -->
    <el-dialog
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
      >
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editForm.attr_name"></el-input>
        </el-form-item>
      </el-form>  
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="confirmEdit">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsParams',
  data() {
    return {
      // 分类列表数据
      cateList: [],
      // props的配置信息
      cateProps: {
        label: 'cat_name',
        value: 'cat_id',
        children: 'children',
        expandTrigger: 'hover'
      },
      // 选中的父级ID
      selectedKeys: [],
      // tab选项卡活跃状态
      activeName: 'many',
      // 动态参数的数据
      manyTableData: [],
      // 静态属性的数据
      onlyTableData: [],
      // 控制添加参数、属性dialog弹框是否隐藏
      addDialogVisible: false,
      // 添加参数表单的数据
      addForm: {
        attr_name: ''
      },
      // 添加参数表单的数据的校验规则
      addRules: {
        attr_name: [
          { required: true, message: '添加的分类名称不能为空', trigger: 'blur' }
        ]
      },
      // 编辑参数 dialog弹框是否隐藏
      editDialogVisible: false,
      // 编辑数据
      editForm: {},
      // 校验规则
      editRules: {
        attr_name: [
          { required: true, message: '添加的分类名称不能为空', trigger: 'blur' }
        ]
      }
    }  
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories')
      if(res.meta.status !== 200) {
        return this.$message.error('获取分类列表数据失败')
      }
      this.cateList = res.data
    },
    // 当级联选择框，选中状态发生改变时
    async cascaderChanged() {
      // 当选中的不是三级分类时
      if(this.selectedKeys.length !== 3) {
        this.selectedKeys = []
        return
      }
      // 当选中的是三级分类时,发起网络请求，获取参数数据
      this.getCateParams()
      
    },
    // 当tab选项卡点击切换时
    handleCateClick() {
      this.getCateParams()
    },
    // 获取分类参数
    async getCateParams() {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {
        params: {sel: this.activeName}
      })
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      // 要先判断获取到的数据是静态参数，还是动态参数
      if (this.activeName === 'many') {
        this.manyTableData = res.data
      } else {
        this.onlyTableData = res.data
      }
    },
    // 点击添加分类
    addParams() {
      this.addDialogVisible = true
    },
    // 当添加参数、属性dialog弹框关闭时，重置表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 确定添加参数，点击了确定
    confirmAdd() {
      this.$refs.addFormRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
        attr_name: this.addForm.attr_name,
        attr_sel: this.activeName
        })
        if(res.meta.status !== 201) {
          return this.$message.error('添加失败！')
        }
        // 添加成功
        this.addDialogVisible = false
        this.$message.success('添加成功')
        this.getCateParams()
      })
    },
    // 点击编辑参数
    async editParams(attr_id) {
      this.editDialogVisible = true
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {
          attr_sel: this.activeName
        }
      })
      if(res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败')
      }
      this.editForm = res.data
      console.log(this.editForm);
    },
    // 关闭dialog时，重置编辑表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 确定修改参数名称
    confirmEdit() {
      this.$refs.editFormRef.validate(async valid => {
        if(!valid) return 
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, {
          attr_name: this.editForm.attr_name,
          attr_sel: this.activeName
        })
        if(res.meta.status !== 200) {
          return this.$message.error('更新失败！')
        }
        this.getCateParams()
        this.editDialogVisible = false
        this.$message.success('更新成功')
      })
    },
    // 删除参数
    async deleteParams(attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
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
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if(res.meta.status !== 200) {
        this.$message.error('删除分类参数失败！')
      }
      // 删除用户参数成功
      // 1.提示信息
      this.$message.success('删除分类参数成功！')
      // 2.刷新参数列表
      this.getCateParams()
    }
  },
  computed: {
    // 判断添加参数按钮是否被禁用
    activeBtn() {
      if(this.selectedKeys.length !== 3) {
        return true
      }
      return false
    },
    // 获取当前分类的ID
    cateId() {
      if(this.selectedKeys.length === 3) {
        return this.selectedKeys[2]
      }
      return null
    },
    // 判断是title中是动态参数，还是静态属性
    titleText() {
      if(this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
    }
  }
}
</script>

<style scoped>
.el-alert {
  margin-bottom: 15px;
}

</style>