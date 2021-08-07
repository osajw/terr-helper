<template>
  <div id="app">
    <v-app>
      <router-view>loading...</router-view>
    </v-app>
  </div>
</template>

<style lang="scss">

* {margin: 0; padding: 0}

body {
  background-color: #f9f9f9;
}

#app {
  font-family: "Helvetica Neue",Helvetica,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",Arial,sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #3b3b3b;
}

::-webkit-scrollbar {
  width: 7px;
  height: 7px;
}
::-webkit-scrollbar-button {
  width: 0px;
  height: 0px;
}
::-webkit-scrollbar-thumb {
  background: #e1e1e1;
  border: 0px none #ffffff;
  border-radius: 2px;
  &:hover, &:active {
    background: #353535;
  }
}
::-webkit-scrollbar-track {
  background: transparent;
  border: 0px none #ffffff;
  border-radius: 0px;
  &:hover, &:active {
    background: rgba(185, 185, 185, 0.1);
  }
}
::-webkit-scrollbar-corner {
  background: transparent;
}
</style>
