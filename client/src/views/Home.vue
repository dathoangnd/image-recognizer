<template>
  <div class="home">
    <div class="post">
      <h2 class="pageTitle">Image recognizer</h2>
      <p class="intro">Sử dụng webcam để đào tạo mô hình Neural Network nhận diện hình ảnh của riêng bạn!</p>
    </div>

    <div id="app-container">
      <div id="image-recognizer-container">
          <div class="image-recognizer-wrapper">
              <div class="data-box">
                  <template v-for="(trainingClass, index) in data">
                      <training-class :key="index" :index="index" :name="trainingClass.name" :samplesadding="webcamPosition == index" :samples="trainingClass.samples" @name-changed="nameChanged" @remove-class="removeClass" @capture-image="captureImage" @changewebcam="changeWebcam" @removesample="removeSample" />
                  </template>
                  
              </div>

              <div class="training-box">
                  <div class="training-box-nav">
                      <span class="material-icons">
                          arrow_right_alt
                      </span>
                  </div>
                  <training-box :training="isTraining" @start-train="startTraining"></training-box>

                  <div class="training-box-nav">
                      <span class="material-icons">
                          arrow_right_alt
                      </span>
                  </div>
                  
              </div>

              <div class="model-box">
                  <model-box :prediction="model != null && !isTraining" :openwebcam="webcamPosition == -1" :output="testOutput" :name="modelName"  @capture-image="predict" @publish="publish" @name-changed="modelNameChanged" />
              </div> 
          </div>
      </div>

      <div id="image-recognizer-container">
          <div class="image-recognizer-wrapper">
              <div class="data-box">
                  <div class="add-training-class" @click="addClass">
                      <i class="material-icons">
                          add_circle_outline
                      </i> Thêm lớp
                  </div>
                  
              </div>

              <div class="training-box"> 
              </div>

              <div class="model-box">
              </div> 
          </div>
      </div>
    </div>
  </div>
</template>

<script>
// @ is an alias to /src
import ModelBox from '@/components/ModelBox'
import TrainingBox from '@/components/TrainingBox'
import TrainingClass from '@/components/TrainingClass'
let serialize = require('serialize-javascript')

export default {
  name: 'Home',
  components: {
    ModelBox,
    TrainingBox,
    TrainingClass
  },
  created() {
    if (this.$route.query.id) {
      let endpoint = `http://localhost:3000/model/${this.$route.query.id}`

      fetch(endpoint, {
        method: "GET"
      })
      .then(response => response.json())
      .then(data => {
        if (data.status == 'success') {
          try {
            let decodedData = JSON.parse(data.data.model.data)
            this.modelName = data.data.model.name
            this.data = decodedData.data
            let classNumber = this.data.length;
            let nn = NewNN(6*6*3, [classNumber*2], classNumber, false);
            nn.Load(decodedData.model)
            this.model = nn
          } catch (e) {
            console.log(e.message)
            this.$router.push({ path: ''})
          }
        } else {
          this.$router.push({ path: ''})
        }
      })
    }
  },
  data() {
    return {
      data: [
        {
          name: "Lớp 1",
          samples: []
        },
        {
          name: "Lớp 2",
          samples: []
        }
      ],
      epochs: 10000,
      learningRate: 0.03,
      momentumFactor: 0.2,
      isTraining: false,
      webcamPosition: null,
      model: null,
      modelName: 'Mô hình mới',
      testOutput: []
    }
  },
  methods: {
    nameChanged(values) {
      let index = values.index;
      if (this.data.length > index) {
        let name = values.name;
        this.data[index].name = name;
      }
    },
    modelNameChanged(value) {
      this.modelName = value
    },
    removeClass(index) {
      if (this.data.length > index) {
        this.data = this.data.filter(function(value, i) {
          if (i == index) {
            return false;
          }

          return true;
        })
      }
    },
    addClass() {
      this.data.push({
        name: `Lớp ${this.data.length+1}`,
        samples: []
      })
    },
    changeWebcam(index) {
      this.webcamPosition = index;
    },
    captureImage(values) {
      this.model = null;
      let index = values.index;
      if (this.data.length > index) {
        let image = values.image;
        this.data[index].samples.push(image);
      }
    },
    removeSample({classIndex, index}) {
      this.model = null;
      this.data[classIndex].samples.splice(index, 1);
    },
    startTraining() {
      if (this.isTraining) {
      return false; 
      }
      if (!this.trainable) {
        alert("Mỗi lớp đào tạo phải có ít nhất 5 mẫu.");
        return false;
      }

      this.webcamPosition = -1;
      this.isTraining = true;
      setTimeout(() => {
        let trainingData = [];
        let classNumber = this.data.length;
        for (let i = 0; i < classNumber; i++) {
          for (let j = 0; j < this.data[i].samples.length; j++) {
            let input = [];
            for (let i = 0; i < 6*6*3; i++) {
              input.push(0);
            }
            for (let k = 0; k < 6; k++) {
              for (let l = 0; l < 6; l++) {
                for (let m = 0; m < 8; m++) {
                  for (let n = 0; n < 8; n++) {
                    input[k*6+l] += this.data[i].samples[j][k*8+m][l*8+n].r;
                    input[k*6+l+36] += this.data[i].samples[j][k*8+m][l*8+n].g;
                    input[k*6+l+36*2] += this.data[i].samples[j][k*8+m][l*8+n].b;
                  }
                }
              }
            }
            for (let i = 0; i < 6*6*3; i++) {
              input[i] = input[i] / 64 / 256;
            }
            let output = [];
            for (let k = 0; k < i; k++) {
              output.push(0);
            }
            output.push(1);
            for (let k = i+1; k < classNumber; k++) {
              output.push(0);
            }

            trainingData.push([input, output]);
          }
        }

        let shuffle = function(deck, random = Math.random) {
            let length      = deck.length;
            let clone       = deck.slice(0);
            let shuffled    = [];

            while(length--) {
                shuffled.push(clone.splice(Math.floor(random() * length), 1).shift());
            }

            return shuffled;
        };

        trainingData = shuffle(trainingData);
        
        let nn = NewNN(6*6*3, [classNumber*2], classNumber, false);
        let loss = nn.Train(trainingData, this.epochs, this.learningRate, this.momentumFactor, false);
        if (loss[loss.length-1] / loss[0] > 0.8) {
          alert("Đào tạo thất bại. Vui lòng kiểm tra lại dữ liệu đào tạo.")
        }

        this.model = nn;
        this.isTraining = false;
      }, 100);
    },
    predict(image) {
      let input = [];
      for (let i = 0; i < 6*6*3; i++) {
        input.push(0);
      }

      for (let k = 0; k < 6; k++) {
        for (let l = 0; l < 6; l++) {
          for (let m = 0; m < 8; m++) {
            for (let n = 0; n < 8; n++) {
              input[k*6+l] += image[k*8+m][l*8+n].r;
              input[k*6+l+36] += image[k*8+m][l*8+n].g;
              input[k*6+l+36*2] += image[k*8+m][l*8+n].b;
            }
          }
        }
      }

      for (let i = 0; i < 6*6*3; i++) {
        input[i] = input[i] / 64 / 256;
      }
      
      if (this.model) {
        let output = this.model.Predict(input);
        let sum = output.reduce(function(a, b) {
          return a + b;
        });
        
        let testOutput = [];
        for (let i = 0; i < this.data.length; i++) {
          testOutput.push({
            name: this.data[i].name,
            prob: output[i] / sum
          });
        }

        this.testOutput = testOutput;
      }
    },
    publish() {
      let model = JSON.stringify({
        data: this.data,
        model: this.model.Get()
      })

      let endpoint = `http://localhost:3000/publish`

      fetch(endpoint, {
        method: "POST",
        body: JSON.stringify({
          data: this.data,
          model,
          name: this.modelName,
          id: this.$route.query.id || '',
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
          if (!this.$route.query.id) {
            this.$router.push({ path: '', query: { id: data.data.model }})
          }
        } else {
          this.$snack.danger({
            text: data.message
          })
        }
      })
    }
  },
  computed: {
    trainable() {
      if (this.data.length == 0) {
        return false;
      }
      for (let i = 0; i < this.data.length; i++) {
        if (this.data[i].samples.length < 5) {
          return false;
        }
      }
      return true;
    }
  }
}
</script>
