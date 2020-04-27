<template>
<fragment v-loading="change">
  <div style="margin-bottom: 15px; text-align: right;">
    <el-button-group>
      <el-button @click="manageOpen = true" size="small" type="primary">新增</el-button>
    </el-button-group>
  </div>
  <el-table
    :data="tableData"
    stripe
    border
    style="width: 100%">
    <el-table-column
      prop="title"
      label="书名"
      width="300">
    </el-table-column>
    <el-table-column
      prop="author"
      label="作者"
      width="180">
    </el-table-column>
    <el-table-column
      label="状态">
      <template scope="scope">
        {{ scope.row.status === 0 ? '待下载' : scope.row.status === 1 ? '下载中' : scope.row.status === 2 ? '已完成' : '下载失败' }}
      </template>
    </el-table-column>
    <el-table-column
      label="操作">
      <template scope="scope">
        <el-button size="small" type="danger" @click="destroy(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
  <el-dialog
    title="书籍管理"
    :visible.sync="manageOpen"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <BookForm v-model="book" @input="save" />
  </el-dialog>
</fragment>
</template>

<script>
import { mapGetters } from 'vuex'
import BookForm from './BookForm'

export default {
  name: 'Books',
  data() {
    return {
      manageOpen: false,
      book: {}
    }
  },
  components: {
    BookForm
  },
  computed: {
    ...mapGetters({
      tableData: 'books/all',
      change: 'books/changing'
    })
  },
  created() {
    this.$store.dispatch('books/load', 1)
  },
  methods: {
    save() {
      if (this.book.id) {
      } else {
        this.$store.dispatch('books/add', this.book)
      }
    },
    destroy(row) {
      this.$store.dispatch('books/destroy', row._id)
    }
  }
}
</script>
