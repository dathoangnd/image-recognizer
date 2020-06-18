<template>
  <div class="account">
    <template v-if="!$store.state.username">
      <div class="ir-auth-form">
        <div class="ir-auth-form-selector">
          <a :class="authMode=='login' ? 'active' : ''" @click="authMode='login'">Đăng nhập</a>
          <a :class="authMode=='login' ? '' : 'active'" @click="authMode='register'">Đăng ký</a>
        </div>
        <form class="ir-auth-form-body" @submit="auth">
          <label>Tên đăng nhập</label>
          <input type="text" ref="username" minlength="4" required />
          <label>Mật khẩu</label>
          <input type="password" ref="password" minlength="6" required />
          <input type="submit" :value="authMode == 'login' ? 'Đăng nhập' : 'Đăng ký'" />
        </form>
      </div>
    </template>
    <template v-else>
      <div class="ir-welcome">
        Bạn đang đăng nhập với tên <b>{{$store.state.username}}</b>. <span @click="logOut">Đăng xuất</span>
      </div>

      <div class="ir-models">
        <div class="ir-models-header">
          <h3>Danh sách mô hình</h3>
          <router-link to="/"><button>Thêm mô hình</button></router-link>
        </div>
        <div class="ir-models-body">
          <template v-if="models.length == 0">
            Chưa có mô hình nào.
          </template>
          <template v-else>
            <div class="ir-model" v-for="(model, index) in models" :key="index">
              <div class="ir-model-name"><router-link :to="'/?id=' + model.id">{{model.name}}</router-link></div>
              <div class="ir-model-tools">
                <router-link :to="'/?id=' + model.id"><i class="material-icons">edit</i></router-link>
                <i class="material-icons" @click="removeModel(index)">delete_outline</i>
              </div>
            </div>
          </template>
        </div>
      </div>
    </template>
  </div>
</template>

<script>
import tokenMixin from '@/mixins/token.js'
export default {
  mixins: [tokenMixin],
  created() {
    if (this.$store.state.username) {
      let endpoint = `http://localhost:3000/model`

      fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          token: localStorage.irToken
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status == 'success') {
          this.models = data.data.models
        }
      })
    }
  },
  data() {
    return {
      authMode: 'login',
      models: []
    }
  },
  methods: {
    auth(e) {
      e.preventDefault()
      let username = this.$refs.username.value
      let password = this.$refs.password.value
      let endpoint = `http://localhost:3000/${this.authMode}`

      fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          username,
          password
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status == 'success') {
          this.$snack.success({
            text: data.message
          })
          this.storeToken(data.data.token)
          this.models = data.data.models
        } else {
          this.$snack.danger({
            text: data.message
          })
        }
      })
    },
    removeModel(index) {
      let id = this.models[index].id
      let endpoint = `http://localhost:3000/model/${id}`

      fetch(endpoint, {
        method: "DELETE",
        body: JSON.stringify({
          token: localStorage.irToken
        }),
        headers: {
          "Content-Type": "application/json"
        }
      })
      .then(response => response.json())
      .then(data => {
        if (data.status == 'success') {
          this.$snack.success({
            text: data.message
          })
          this.models = this.models.filter((v, i) => i != index)
        } else {
          this.$snack.danger({
            text: data.message
          })
        }
      })
    },
    logOut() {
      this.removeToken()
      this.models = []
    }
  }
}
</script>

<style lang="scss" scoped>
.account {
  text-align: left;
}
.ir-auth-form {
  margin-top: 96px;
  .ir-auth-form-selector {
    text-align: center;
    a {
      margin: 16px;
      cursor: pointer;
      &.active {
        color: #42b983;
      }
    }
  }

  .ir-auth-form-body {
    width: 400px;
    margin: auto;
    margin-top: 32px;
    label {
      display: block;
      margin-top: 16px;
    }

    input {
      display: block;
      padding: 8px;
      &:not([type="submit"]) {
        width: 100%;
      }

      &[type="submit"] {
        margin-top: 16px;
        padding: 8px 16px;
        cursor: pointer;
      }
    }
  }
}

.ir-welcome {
  margin-top: 32px;
  span {
    cursor: pointer;
    text-decoration: underline;;
  }
}

.ir-models {
  margin-top: 32px;
  .ir-models-header {
    display: flex;
    justify-content: space-between;
    h3 {
      font-size: 24px;
      margin: 0;
    }
    button {
      padding: 8px 16px;
      cursor: pointer;
      border-radius: 5px;
      border: 1px solid #2196F3;
      background: #fff;
      &:hover {
        opacity: 0.6;
      }
    }
  }

  .ir-models-body {
    margin: 32px 0;

    .ir-model {
      margin: 16px 0;
      border: 2px solid #EEEEEE;
      border-radius: 15px;
      padding: 16px;
      display: flex;
      justify-content: space-between;

      .ir-model-name {
        /deep/ a {
          color: #2196F3;
          text-decoration: none;
          font-weight: bold;
          font-size: 18px;
          line-height: 32px;
          &:hover {
            opacity: 0.6;
          }
        }
      }

      .ir-model-tools {
        i {
          margin-left: 16px;
          color: #2196F3;
          line-height: 32px;
          cursor: pointer;
          &:hover {
            opacity: 0.6;
          }
        }
        > i:last-child {
          color: #F44336;
        }
      }
    }
  }
}
</style>
