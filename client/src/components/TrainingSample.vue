<template>
  <div class="training-sample">
    <canvas ref="canvas" width="48" height="48" />
    <div class="remove-training-sample noselect" @click="$emit('removesample', index)">
      <span class="material-icons">clear</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    data: Array,
    index: Number
  },
  mounted() {
    let canvas = this.$refs.canvas;
    let context = canvas.getContext("2d");
    let imgData = context.createImageData(48, 48);

    for (let i = 0; i < imgData.data.length; i += 4) {
      let col = Math.floor((i / 4) / 48);
      let row = (i / 4) % 48;
      let value = this.data[row][col];
      imgData.data[i+0] = value.r;
      imgData.data[i+1] = value.g;
      imgData.data[i+2] = value.b;
      imgData.data[i+3] = 255;
    }

    context.putImageData(imgData, 0, 0);
  }
}
</script>