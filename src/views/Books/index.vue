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
      label="书名"
      width="300">
      <template scope="scope">
        <span @click="copy(scope.row)">{{ scope.row.title }}</span>
      </template>
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
          :title="'共有' + scope.row.crawlers.errors.length + '个错误'"
          placement="right"
          trigger="click"
          >
          <div
          style="max-height: 50vh; overflow-y: auto;">
            <table>
              <tr v-for="error in scope.row.crawlers.errors">
                <td><el-link :href="error.uri" target="_blank">{{ error.title }}</el-link></td>
              </tr>
            </table>
          </div>
          <el-button slot="reference">
            下载失败
          </el-button>
        </el-popover>
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      width="400">
      <template scope="scope">
        <el-button-group v-if="scope.row.type === 1">
          <el-button type="primary" icon="el-icon-edit" @click="edit(scope.row)"></el-button>
          <el-button type="primary" icon="el-icon-delete" @click="destroy(scope.row)"></el-button>
          <el-button type="primary" icon="el-icon-download" @click="download(scope.row)"></el-button>
        </el-button-group>
        <template v-else-if="scope.row.type === 2">
        <el-button-group style="margin-right: 5px;">
          <el-button type="primary" icon="el-icon-edit" @click="edit(scope.row)" :disabled="scope.row.status===1"></el-button>
          <el-button type="primary" icon="el-icon-delete" @click="destroy(scope.row)" :disabled="scope.row.status===1"></el-button>
          <el-button type="primary" icon="el-icon-download" @click="download(scope.row)" :disabled="scope.row.status!==2"></el-button>
        </el-button-group>
        <el-button-group>
          <el-button type="primary" icon="el-icon-refresh" @click="refresh(scope.row)" :disabled="scope.row.status===1"></el-button>
          <el-button type="primary" icon="el-icon-refresh-right" @click="refresh(scope.row, true)" :disabled="scope.row.status!==3"></el-button>
          <el-button type="primary" icon="el-icon-s-release" @click="refresh(scope.row, true)" :disabled="scope.row.status!==1"></el-button>
        </el-button-group>
        </template>
      </template>
    </el-table-column>
  </el-table>
  <el-pagination
    background
    layout="prev, pager, next"
    :total="count"
    current-change="load">
  </el-pagination>
  <BookForm :open="manageOpen" v-model="book" @input="save" @cancel="manageOpen=false" />
</fragment>
</template>

<script>
import { mapGetters } from 'vuex'
import clipboardy from 'copy-text-to-clipboard'
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
        this.$store.dispatch('books/update', {
          ...this.book
        })
          .then(() => {
            this.$message.success('修改成功')
            this.manageOpen = false
            this.book = {}
          })
          .catch(err => {
            console.warn(err)
            this.$alert('修改失败')
          })
      } else {
        this.$store.dispatch('books/add', {
          ...this.book
        })
          .then(() => {
            this.$message.success('新增成功')
            this.manageOpen = false
            this.book = {}
          })
          .catch(err => {
            console.warn(err)
            this.$alert('新增失败')
          })
      }
    },
    edit(row) {
      this.book = {
        ...row
      }
      this.manageOpen = true
    },
    destroy(row) {
      this.$store.dispatch('books/destroy', row._id)
    },
    refresh(row, error=false) {
      this.$store.dispatch('books/refresh', {
        id: row._id,
        onlyerrors: error ? 1 : 0
      })
    },
    download(row) {
      this.$store.dispatch('books/download', row._id)
    },
    stopCrawler(row) {
      this.$store.dispatch('books/stop', row._id)
    },
    copy(row) {
      clipboardy(row.file)
    }
  }
}
</script>
