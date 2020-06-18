<template>
  <div class="training-class-wrapper">
    <div class="training-class-header">
      <div class="training-class-name">
        <span>Đào tạo</span>
      </div>
    </div>

    <div class="training-class-samples" style="text-align: center;">
      <div class="training-class-sample-add-button noselect" @click="$emit('start-train')">
        <template v-if="training">
          <i class="material-icons spinner">
            autorenew
          </i> Đang học
        </template>
        <template v-else>
          <i class="material-icons">
            directions_run
          </i> Bắt đầu
        </template>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    training: Boolean
  }
}
</script>