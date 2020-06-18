const utils = {
  random(a, b) {
      return (b-a) * Math.random() + a
  },

  matrix(I, J) {
      let m = []
      for (let i = 0; i < I; i++) {
          m.push([])
          for (let j = 0; j < J; j++) {
              m[i].push(0)
          }
      }
      return m
  },

  vector(I, fill) {
      let v = []
      for (let i = 0; i < I; i++) {
          v.push(fill)
      }
      return v
  },

  linear(x) {
      return x
  },

  dlinear(y) {
      return 1
  },

  sigmoid(x) {
      return 1 / (1 + Math.exp(-x))
  },

  dsigmoid(y) {
      return y * (1 - y)
  },

  relu(x) {
      if (x < 0) {
          return 0
      }
      return x
  },

  drelu(y) {
      if (y > 0) {
          return 1
      }
      return 0
  }
}

// New creates a new neural network
//
// 'nInputs' is number of nodes in input layer
//
// 'nHiddens' is array of numbers of nodes in hidden layers
//
// 'nOutputs' is number of nodes in output layer
//
// 'isRegression' is whether the problem is regression or classification
//
// return the neural network
function NewNN(nInputs, nHiddens, nOutputs, isRegression) {
let nn = {
      // Whether the problem is regression or classification
      Regression: isRegression,
      // Number of nodes in each layer
      NNodes: [],
      // Activations for each layer
      Activations: [],
      // Weights
      Weights: [],
      // Last change in weights for momentum
      Changes: []
  }
  nn.NNodes.push(nInputs + 1)
  for (let i = 0; i < nHiddens.length; i++) {
  nn.NNodes.push(nHiddens[i]+1)
  }
  nn.NNodes.push(nOutputs)
  let NLayers = nn.NNodes.length

  for (let i = 0; i < NLayers; i++) {
      nn.Activations.push(utils.vector(nn.NNodes[i], 1))
  }

  for (let i = 0; i < NLayers - 1; i++) {
      nn.Weights.push(utils.matrix(nn.NNodes[i], nn.NNodes[i+1]))
      nn.Changes.push(utils.matrix(nn.NNodes[i], nn.NNodes[i+1]))
  }

  let rng = new Math.seedrandom(0);
  
  for (let i = 0; i < nn.Weights.length; i++) {
  for (let j = 0; j < nn.Weights[i].length; j++) {
    for (let k = 0; k < nn.Weights[i][j].length; k++) {
      nn.Weights[i][j][k] = rng() * 2 - 1
    }
  }
  }
  
  nn.feedForward = function(inputs) {
      let NLayers = nn.NNodes.length
      for (let i = 0; i < nn.NNodes[0]-1; i++) {
          nn.Activations[0][i] = inputs[i]
      }

      for (let k = 1; k < NLayers-1; k++) {
          for (let i = 0; i < nn.NNodes[k]-1; i++) {
              let sum = 0
  
              for (let j = 0; j < nn.NNodes[k-1]; j++) {
                  sum += nn.Activations[k-1][j] * nn.Weights[k-1][j][i]
              }
  
              if (nn.Regression) {
                  // Use sigmoid to avoid explosion
                  nn.Activations[k][i] = utils.sigmoid(sum)
              } else {
                  nn.Activations[k][i] = utils.relu(sum)
              }
          }
      }


      for (let i = 0; i < nn.NNodes[NLayers-1]; i++) {
          let sum = 0
  
          for (let j = 0; j < nn.NNodes[NLayers-2]; j++) {
              sum += nn.Activations[NLayers-2][j] * nn.Weights[NLayers-2][j][i]
          }
  
          if (nn.Regression) {
              nn.Activations[NLayers-1][i] = utils.linear(sum)
          } else {
              nn.Activations[NLayers-1][i] = utils.sigmoid(sum)
          }
      }
  
      return nn.Activations[NLayers-1]
  }

  nn.backPropagate = function(targets, lRate, mFactor) {
      let NLayers = nn.NNodes.length
  
      let deltas = []
      for (let i = 0; i < NLayers-1; i++) {
          deltas.push([])
      }
      deltas[NLayers-2] = utils.vector(nn.NNodes[NLayers-1], 0.0)
      for (let i = 0; i < nn.NNodes[NLayers-1]; i++) {
          if (nn.Regression) {
              deltas[NLayers-2][i] = utils.dlinear(nn.Activations[NLayers-1][i]) * (nn.Activations[NLayers-1][i] - targets[i])
          } else {
              deltas[NLayers-2][i] = utils.dsigmoid(nn.Activations[NLayers-1][i]) * (nn.Activations[NLayers-1][i] - targets[i])
          }
      }
  
      for (let k = deltas.length - 2; k >= 0; k--) {
          deltas[k] = utils.vector(nn.NNodes[k+1], 0.0)
          for (let i = 0; i < nn.NNodes[k+1]; i++) {
              let e = 0
  
              for (let j = 0; j < nn.NNodes[k+2]-1; j++) {
                  e += deltas[k+1][j] * nn.Weights[k+1][i][j]
              }
  
              if (nn.Regression) {
                  deltas[k][i] = utils.dsigmoid(nn.Activations[k+1][i]) * e
              } else {
                  deltas[k][i] = utils.drelu(nn.Activations[k+1][i]) * e
              }
          }
      }
  
      for (let k = NLayers - 2; k >= 0; k--) {
          for (let i = 0; i < nn.NNodes[k]; i++) {
              for (let j = 0; j < nn.NNodes[k+1]; j++) {
                  let change = deltas[k][j] * nn.Activations[k][i]
                  nn.Weights[k][i][j] = nn.Weights[k][i][j] - (lRate*change*(1-mFactor) + lRate*mFactor*nn.Changes[k][i][j])
                  nn.Changes[k][i][j] = change
              }
          }
      }
      let err = 0
      for (let i = 0; i < targets.length; i++) {
          err += 0.5 * Math.pow(targets[i]-nn.Activations[NLayers-1][i], 2)
      }
      return err
  }

  nn.Train = function(inputs, iterations, lRate, mFactor, debug) {
      let loss = [];
      for (let i = 1; i <= iterations; i++) {
          let e = 0
          for (let i = 0; i < inputs.length; i++) {
              let p = inputs[i]
              nn.feedForward(p[0])
  
              let tmp = nn.backPropagate(p[1], lRate, mFactor)
              e += tmp
          }
          if (i%1000 == 0) {
              loss.push(e);
              if (debug) {
                  console.log(`${i} iterations: ${e}\n`)
              }
          }
      }
      return loss;
  }

  nn.Predict = function(input) {
      return nn.feedForward(input)
  }

  nn.Get = function() {
      return nn
  }
  
  nn.Load = function(newNN) {
      nn.Regression = newNN.Regression
      nn.NNodes = newNN.NNodes
      nn.Activations = newNN.Activations
      nn.Weights = newNN.Weights
      nn.Changes = newNN.Changes
  }
  
return nn
}