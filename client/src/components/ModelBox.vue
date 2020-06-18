<template>
  <div class="training-class-wrapper">
    <div class="training-class-header">
      <div class="training-class-name">
        <span :contenteditable="nameEditing" ref="name" @input="tempName = $refs.name.innerText">{{name}}&nbsp;</span>
        <span @click="editName()">
          <template v-if="nameEditing">
            <i class="material-icons">done</i>
          </template>
          <template v-else>
            <i class="material-icons">edit</i>
          </template>
        </span>
      </div>
      <div class="training-class-remove-button" title="Xuất bản" v-if="prediction && $store.state.username">
        <span @click="$emit('publish')"><i class="material-icons">save</i></span>
      </div>
    </div>

    <div class="training-class-samples">
      <div class="training-class-sample-webcam-wrapper">
        <div v-show="prediction">
          <video autoplay ref="webcam"></video>
          <ul class="prediction-output">
            <div class="class-names">
              <li v-for="(item, index) in output" :key="index">
                <span :class="'class-name' + (maxIndex == index ? ' max-index' : '')">{{ item.name }}</span>
              </li>
            </div>
            <div class="class-probs">
              <li v-for="(item, index) in output" :key="index">
                <span :class="'class-prob' + (maxIndex == index ? ' max-index' : '')">: {{ Math.round(item.prob * 100) }}%</span>
              </li>
            </div>
          </ul>
        </div>
        <p v-show="!prediction" style="font-size: 18px; color: #212121; font-weight: lighter;">Bạn cần đào tạo mô hình trước khi sử dụng để nhận diện hình ảnh.</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    name: String,
    prediction: Boolean,
    output: Array
  },
  data() {
    return {
      tempName: '',
      nameEditing: false
    }
  },
  computed: {
    maxIndex() {
      let maxIndex = 0;
      for (let i = 1; i < this.output.length; i++) {
        if (this.output[i].prob > this.output[maxIndex].prob) {
          maxIndex = i;
        }
      }
      return maxIndex;
    }
  },
  methods: {
    openWebcam() {
      navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
          this.$refs.webcam.srcObject = stream;
          this.captureSample();
        });
    },

    captureSample() {
      let canvas = document.createElement("canvas");
      let context = canvas.getContext('2d');
      
      let capture = () => {
        context.drawImage(this.$refs.webcam, 0, 0, this.$refs.webcam.videoWidth, this.$refs.webcam.videoHeight, 0, 0, 48, 48);
        let newImage = [];
        for (let i = 0; i < 48; i++) {
          newImage.push([]);
          for (let j = 0; j < 48; j++) {
            let image = context.getImageData(i, j, 1, 1).data;
            newImage[i].push({r: image[0], g: image[1], b: image[2]});
          }
        }
      
        this.$emit('capture-image', newImage);
      }

      window.captureImageInterval = setInterval(capture, 100);
    },
    cancelCaptureSample() {
      clearInterval(window.captureImageInterval);
    },
    editName() {
      this.nameEditing = !this.nameEditing;
      if (this.nameEditing) {
        setTimeout(() => {
          this.$refs.name.focus();
        }, 0);
      } else {
        this.tempName = this.tempName.replace(/\n/g, ' ').trim();
        if (this.tempName == '') {
          this.tempName = this.name;
        }
        
        this.$refs.name.innerText = this.tempName;
        this.$emit('name-changed', this.tempName);
      }
    }
  },
  watch: {
    prediction() {
      if (this.prediction) {
        setTimeout(() => {
          this.openWebcam();
        }, 100);
      } else {
        this.cancelCaptureSample();
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.training-class-remove-button {
  .material-icons {
    color: #2196F3 !important;
  }
}
</style>