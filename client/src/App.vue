<template>
  <div id="app">
    <div id="nav">
      <router-link :data-active="$route.path=='/' ? 'active' : ''" to="/">Mô hình</router-link> |
      <router-link :data-active="$route.path=='/account' ? 'active' : ''" to="/account">Tài khoản</router-link>
    </div>
    <router-view/>
  </div>
</template>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  max-width: 960px;
  margin: auto;
}

#nav {
  padding: 30px;

  a {
    font-weight: bold;
    color: #2c3e50;
    text-decoration: none;

    &.router-link-exact-active {
      color: #42b983;
    }
  }
}
</style>
