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
      prop="from"
      label="目标文字"
      width="300">
    </el-table-column>
    <el-table-column
      prop="to"
      label="替换文字"
      width="180">
    </el-table-column>
    <el-table-column
      prop="file"
      label="处理文件"
      width="180">
    </el-table-column>
    <el-table-column
      label="状态">
      <template scope="scope">
        <span v-if="scope.row.status === 0">待处理</span>
        <span v-else-if="scope.row.status === 1">处理中</span>
        <span v-else-if="scope.row.status === 2">已完成</span>
        <span v-else-if="scope.row.status === 3">已替换</span>
      </template>
    </el-table-column>
    <el-table-column
      label="操作"
      width="400">
      <template scope="scope">
      <el-button-group>
        <el-button type="primary" icon="el-icon-edit" @click="edit(scope.row)"></el-button>
        <el-button type="primary" icon="el-icon-delete" @click="destroy(scope.row)"></el-button>
        <el-button type="primary" icon="el-icon-caret-right" @click="exec(scope.row)"></el-button>
        <el-button type="primary" icon="el-icon-search" @click="show(scope.row)" v-show="scope.row.status === 2"></el-button>
        <el-button type="primary" icon="el-icon-s-check" @click="replace(scope.row)" v-show="scope.row.status === 2"></el-button>
        <el-button type="primary" icon="el-icon-document-copy" @click="add(scope.row)"></el-button>
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
  <WordForm :open="manageOpen" v-model="word" @input="save" @cancel="manageOpen=false" />
</fragment>
</template>

<script>
import { mapGetters } from 'vuex'
import WordForm from './WordForm'

export default {
  name: 'Words',
  data() {
    return {
      manageOpen: false,
      word: {}
    }
  },
  components: {
    WordForm
  },
  computed: {
    ...mapGetters({
      tableData: 'words/all',
      count: 'words/count',
      change: 'words/changing'
    })
  },
  created() {
    this.load(1)
  },
  methods: {
    load(page) {
      this.$store.dispatch('words/load', page)
    },
    save() {
      if (this.word.id) {
        this.$store.dispatch('words/update', {
          ...this.word
        })
          .then(() => {
            this.$message.success('修改成功')
            this.manageOpen = false
            this.word = {}
          })
          .catch(err => {
            console.warn(err)
            this.$alert('修改失败')
          })
      } else {
        this.$store.dispatch('words/add', {
          ...this.word
        })
          .then(() => {
            this.$message.success('新增成功')
            this.manageOpen = false
            this.word = {}
          })
          .catch(err => {
            console.warn(err)
            this.$alert('新增失败')
          })
      }
    },
    edit(row) {
      this.word = {
        ...row
      }
      this.manageOpen = true
    },
    add(row) {
      this.word = {
        from: row.from,
        to: row.to,
        file: row.file
      }
      this.manageOpen = true
    },
    destroy(row) {
      this.$store.dispatch('words/destroy', row._id)
    },
    exec(row) {
      this.$store.dispatch('words/exec', row)
    },
    show(row) {
      this.$store.dispatch('words/show', row._id)
    },
    replace(row) {
      this.$store.dispatch('words/replace', row)
        .then(() => {
          this.$message.success('替换成功')
        })
        .catch(err => {
          console.warn(err)
          this.$alert('替换失败')
        })
    }
  }
}
</script>
