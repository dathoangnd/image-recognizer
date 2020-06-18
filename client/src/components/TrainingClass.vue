<template>
  <div class="training-class-wrapper" @mouseup="cancelCaptureSample">
    <div class="training-class-header">
      <div class="training-class-name">
        <span :contenteditable="nameEditing" ref="name" @input="tempName = $refs.name.innerText">{{ name }}&nbsp;</span>
        <span @click="editName()">
          <template v-if="nameEditing">
            <i class="material-icons">done</i>
          </template>
          <template v-else>
            <i class="material-icons">edit</i>
          </template>
        </span>
      </div>
      <div class="training-class-remove-button" title="Xóa">
        <span @click="$emit('remove-class', index)"><i class="material-icons">delete_outline</i></span>
      </div>
    </div>

    <div class="training-class-samples">
      <div class="training-class-sample-add-button" @click="openWebcam" v-if="!samplesadding">
        <i class="material-icons">
          videocam
        </i> Thêm mẫu đào tạo
      </div>
      <div class="training-class-sample-webcam-wrapper" v-else>
        <video autoplay ref="webcam"></video>
        <div class="training-class-sample-add-button noselect" @mousedown="captureSample" @mouseup="cancelCaptureSample">
          Nhấn giữ để chụp mẫu
        </div>
        <div class="training-class-sample-webcam-close-button" @click="$emit('changewebcam', -1)">
          <i class="material-icons">
            close
          </i>
        </div>
      </div>
      <p class="training-class-size">{{ this.samples.length }} mẫu</p>
      <ul class="training-class-samples-list" ref="sampleList">
        <li v-for="(sample, index) in samples" :key="Math.random() + index">
          <training-sample :index="index" :data="sample" @removesample="removeSample" />
        </li>
      </ul>
    </div>
  </div>
</template>

<script>
import TrainingSample from './TrainingSample'
export default {
  components: {
    TrainingSample
  },
  props: {
    name: String,
    samples: Array,
    index: Number,
    samplesadding: Boolean
  },
  data() {
    return {
      nameEditing: false,
      tempName: ''
    }
  },
  methods: {
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
        this.$emit('name-changed', {index: this.index, name: this.tempName});
      }
    },
    openWebcam() {
      this.$emit('changewebcam', this.index);
      navigator.mediaDevices.getUserMedia({video: true})
        .then((stream) => {
          this.$refs.webcam.srcObject = stream;
        });
    },
    captureSample() {
      let canvas = document.createElement("canvas");
      let context = canvas.getContext('2d');
      context.drawImage(this.$refs.webcam, 0, 0, this.$refs.webcam.videoWidth, this.$refs.webcam.videoHeight, 0, 0, 48, 48);
      
      let capture = () => {
        let newImage = [];
        for (let i = 0; i < 48; i++) {
          newImage.push([]);
          for (let j = 0; j < 48; j++) {
            let image = context.getImageData(i, j, 1, 1).data;
            newImage[i].push({r: image[0], g: image[1], b: image[2]});
          }
        }
  
        this.$emit('capture-image', {index: this.index, image: newImage});
        this.$refs.sampleList.scrollTop = this.$refs.sampleList.scrollHeight;
      }
  
      capture();
      window.captureImageInterval = setInterval(capture, 50);
    },
    removeSample(index) {
      this.$emit('removesample', {classIndex: this.index, index: index});
    },
    cancelCaptureSample() {
      clearInterval(window.captureImageInterval);
    }
  }
}
</script>