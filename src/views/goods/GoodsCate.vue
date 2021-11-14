<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片区域 -->
    <el-card>
      <!-- 添加分类按钮 -->
      <el-row>
        <el-col :span="4">
          <el-button type="primary" @click="addCateItem">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- 表格区域，用tree table -->
      <tree-table :data="cateList" :columns="columns" show-index index-text="#" :selection-type="false" :expand-type="false" border :show-row-hover="false" class="treeTable">
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i class="el-icon-circle-check" style="color: lightgreen" v-if="scope.row.cat_deleted === false"></i>
          <i class="el-icon-circle-close" style="color: red" v-else></i>
        </template>
        <!-- 显示等级 -->
        <template slot="sort" slot-scope="scope">
          <el-button type="primary" plain size="mini" v-if="scope.row.cat_level === 0">一级</el-button>
          <el-button type="success" plain size="mini" v-else-if="scope.row.cat_level === 1">二级</el-button>
          <el-button type="warning" plain size="mini" v-else>三级</el-button>
        </template>
        <!-- 显示操作 -->
        <template slot="opertion" slot-scope="scope">
          <el-button type="primary" icon="el-icon-edit" size="mini" @click="editCateInfo(scope.row)">编辑</el-button>
          <el-button type="danger" icon="el-icon-delete" size="mini" @click="deleteCateInfo(scope.row)">删除</el-button>
        </template>
      </tree-table>
      <!-- 分页导航 -->
      <el-pagination
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      :current-page="queryInfo.pagenum"
      :page-sizes="[1, 3, 5, 7]"
      :page-size="queryInfo.pagesize"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total">
      </el-pagination>
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog
    title="添加分类"
    :visible.sync="addCateDialogVisible"
    width="50%"
    @closed="addCateDialogClosed"
    >
      <el-form :model="addCate" :rules="addCateRules" ref="addCateRef" label-width="100px">
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCate.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- 级联选择器 -->
          <!-- options数据源 -->
          <!-- props 配置选项 -->
          <!-- @change当级联选择器选择变化时 -->
          <el-cascader 
          :options="parentCateList" 
          :props="cascaderProps" 
          v-model="cascaderKeys" 
          @change="parentCateChanged" 
          clearable>
          </el-cascader>
        </el-form-item>
      </el-form>  
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCateConfirm">确 定</el-button>
      </span>
    </el-dialog>

    <!-- 编辑修改分类名称对话框 -->
    <el-dialog
      title="修改分类名称"
      :visible.sync="editCateDialogVisible"
      width="50%"
      >
      <!-- 内容区域 -->
      <el-form :model="cateInfo" :rules="cateFormRules" ref="cateFormRef" label-width="100px">
        <el-form-item label="分类名称" prop="currentName">
          <el-input v-model="cateInfo.currentName"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部按钮区域 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editConfirm">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: 'GoodsCate',
  data() {
    return {
      // 分类列表
      cateList: [],
      // 当前分页的信息
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总共的数据条数
      total: 0,
      // 每列的配置信息
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          template: 'sort',
        },
        {
          label: '操作',
          type: 'template',
          template: 'opertion',
        }
      ],
      // 控制添加分类对话框是否选中
      addCateDialogVisible: false,
      // 添加商品分类的初始信息
      addCate: {
        // 父级分类的ID
        cat_pid: 0,
        // 将要添加的分类名称
        cat_name: '',
        // 分类的等级，默认要添加的是1级分类
        cat_level: 0
      },
      // 添加分类表单的校验规则
      addCateRules: {
        cat_name: [
         { required: true, message: '添加的分类名称不能为空', trigger: 'blur' }
        ]
      },
      // 保存父级分类列表
      parentCateList: [],
      // 级联选择器配置选项
      cascaderProps: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover'
      },
      cascaderKeys: [],
      // 添加分类名称对话框是否隐藏
      addCateDialogVisible: false,
      cateInfo: {
        currentCateID: '',
        currentName: '',
      },
      // 修改分类名称对话框是否隐藏
      editCateDialogVisible: false,
      cateFormRules: {
        // 校验规则中的名称要和表单一致
        currentName: [
          { required: true, message: '分类名称不能为空', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList(),
    this.getParentCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const {data: res} = await this.$http.get('categories', {
        params: this.queryInfo
      })
      if(res.meta.status !== 200) {
        return this.$message.error('获取商品分类列表数据失败！')
      }
      this.cateList = res.data.result
      this.total = res.data.total
      // console.log(res);
    },
    // 当分页的每页显示条数改变时
    handleSizeChange(pageSize) {
      this.queryInfo.pagesize = pageSize
      this.getCateList()
    },
    // 当分页的页码改变时
    handleCurrentChange(pageNum) {
      this.queryInfo.pagenum = pageNum
      this.getCateList()
    },
    // 添加分类
    addCateItem() {
      this.addCateDialogVisible = true
    },
    // 保存添加分类的父级列表
    async getParentCateList() {
      const {data: res} = await this.$http.get('categories', {
        params: {type: 2}
      })
      if(res.meta.status !== 200) {
        return this.$message.error('获取父级列表失败！')
      }
      // console.log(res.data);
      this.parentCateList = res.data
    },
    parentCateChanged() {
      console.log(this.cascaderKeys);
      if(this.cascaderKeys.length > 0) {
        this.addCate.cat_pid = this.cascaderKeys[this.cascaderKeys.length - 1]
        this.addCate.cat_level = this.cascaderKeys.length
      } else {
        this.addCate.cat_pid = 0
        this.addCate.cat_level = 0
      }
    },
    addCateConfirm() {
      this.$refs.addCateRef.validate(async valid => {
        if(!valid) return
        const {data: res} = await this.$http.post('categories', this.addCate)
        console.log(res.meta.status);
        if(res.meta.status !== 201) {
          return this.$message.error('添加分类信息失败')
        }
        // console.log(res.data);
        // 添加分类成功
        this.$message.success('添加分类成功！')
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 当添加分类关闭时，重置表单
    addCateDialogClosed() {
      this.$refs.addCateRef.resetFields()
      this.cascaderKeys = []
      this.addCate.cat_pid = 0
      this.addCate.cat_level = 0
    },
    // 点击编辑分类名称
    async editCateInfo(info) {
      this.editCateDialogVisible = true
      this.cateInfo.currentCateID = info.cat_id
      const {data: res} = await this.$http.get('categories/' + this.cateInfo.currentCateID) 
      if(res.meta.status !== 200 ) {
        return this.$message.error('查询分类失败')
      } 
      this.cateInfo.currentName = res.data.cat_name
    },
    // 点击确定分类名称的修改
    editConfirm() {
      this.$refs.cateFormRef.validate(async valid => {
        if(!valid) return this.$message.error('表单信息校验失败')
        const {data: res} = await this.$http.put('categories/' + this.cateInfo.currentCateID, {
          cat_name: this.cateInfo.currentName
        })
        if(res.meta.status !== 200) {
          return this.$message.error('更新分类信息失败')
        }
        // 更新分类信息成功
        this.$message.success('更新分类信息成功')
        this.getCateList()
        this.editCateDialogVisible = false
      })
    },
    // 点击删除分类名称
    async deleteCateInfo(scope) {
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
      const {data: res} = await this.$http.delete('categories/' + scope.cat_id)
      if(res.meta.status !== 200) {
        this.$message.error('删除分类信息失败！')
      }
      // 删除用户信息成功
      // 1.提示信息
      this.$message.success('删除分类信息成功！')
      // 2.刷新用户列表 调用getUsersList
      this.getCateList()
    }
  }
}
</script>

<style scoped>
.treeTable {
  margin-top: 15px;
} 
.el-cascader{
  width: 100%;
}

</style>