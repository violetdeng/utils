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
    style="width: 100%; margin-bottom: 15px;">
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
        <span v-if="scope.row.status === 0">待下载</span>
        <span v-else-if="scope.row.status === 1">下载中</span>
        <span v-else-if="scope.row.status === 2">已完成</span>
        <el-popover
          v-else
          placement="right"
          trigger="click"
          >
          <table>
            <tr v-for="error in scope.row.crawlers.errors">
              <td><el-link :href="error.uri" target="_blank">{{ error.title }}</el-link></td>
            </tr>
          </table>
          <el-button slot="reference">
            下载失败
          </el-button>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column
      label="操作">
      <template scope="scope">
        <el-button-group>
          <el-button type="primary" icon="el-icon-edit" @click="rename(scope.row)"></el-button>
          <el-button type="primary" icon="el-icon-delete" @click="destroy(scope.row)"></el-button>
          <el-button type="primary" icon="el-icon-download" @click="download(scope.row)"></el-button>
        </el-button-group>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    background
    layout="prev, pager, next"
    :total="count"
    current-change="load">
  </el-pagination>
  <el-dialog
    title="书籍管理"
    :visible.sync="manageOpen"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <BookForm v-model="book" @input="save" @cancel="manageOpen=false" />
  </el-dialog>
  <el-dialog
    title="重命名"
    :visible.sync="renameOpen"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <Rename v-model="book" @input="saveRename" @cancel="renameOpen=false"/>
  </el-dialog>
</fragment>
</template>

<script>
import { mapGetters } from 'vuex'
import BookForm from './BookForm'
import Rename from './Rename'

export default {
  name: 'Books',
  data() {
    return {
      manageOpen: false,
      book: {},
      renameOpen: false
    }
  },
  components: {
    BookForm,
    Rename
  },
  computed: {
    ...mapGetters({
      tableData: 'books/all',
      count: 'books/count',
      change: 'books/changing'
    })
  },
  created() {
    this.load(1)
  },
  methods: {
    load(page) {
      this.$store.dispatch('books/load', page)
    },
    save() {
      if (this.book.id) {
      } else {
        this.$store.dispatch('books/add', this.book)
          .then(() => {
            this.$message.success('新增成功')
            this.manageOpen = false
          })
          .catch(err => {
            console.warn(err)
            this.$alert('新增失败')
          })
      }
    },
    rename(row) {
      this.book = row
      this.renameOpen = true
    },
    saveRename() {
      this.$store.dispatch('books/rename', this.book)
          .then(() => {
            this.$message.success('重命名成功')
            this.renameOpen = false
          })
          .catch(err => {
            console.warn(err)
            this.$alert('重命名失败')
          })
    },
    destroy(row) {
      this.$store.dispatch('books/destroy', row._id)
    },
    download(row) {
      this.$store.dispatch('books/download', row._id)
    }
  }
}
</script>
