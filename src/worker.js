/* global tf */
//importScripts("https://unpkg.com/@tensorflow/tfjs@3.20.0/dist/tf.min.js");
//importScripts('https://unpkg.com/@tensorflow/tfjs');
//importScripts("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@latest")
// importScripts('https://cdn.jsdelivr.net/npm/setimmediate@1.0.5/setImmediate.min.js')
// importScripts('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@0.10.3')
// const tf = require('@tensorflow/tfjs')
import tf from '@tensorflow/tfjs'
tf.setBackend('cpu')
// tf.setBackend('cpu')

let model
let processing = false

// https://github.com/thekevinscott/tensor-as-base64/edit/master/src/index.ts
const tensorAsBuffer = async (tensor) => {
  const [height, width] = tensor.shape;
  const buffer = new Uint8ClampedArray(width * height * 4);
  const data = await tensor.data();
  let i = 0;
  for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const pos = (y * width + x) * 4;
        buffer[pos] = data[i]; // R
        buffer[pos + 1] = data[i + 1]; // G
        buffer[pos + 2] = data[i + 2]; // B
        buffer[pos + 3] = 255; // Alpha
        i += 3;
      }
  }
  return buffer;
}
  
const tensorAsBase64 = async (tensor) => {
    const [height, width] = tensor.shape;
    const buffer = await tensorAsBuffer(tensor);
    const imageData = new ImageData(width, height);
    imageData.data.set(buffer);
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.putImageData(imageData, 0, 0);
    return canvas.toDataURL();
}

const process = async ({ tf, model, img }) => {
    console.log('PROCESSING')
    processing = true

    const prediction = tf.tidy(() => {
        const tensor = tf.browser.fromPixels(img).expandDims(0)
        return model.predict(tensor).squeeze()
    })
    
    try {
        const img = await tensorAsBase64(prediction)
        prediction.dispose()
        postMessage(img)
    } catch (e) {
        console.error(e)
    } finally {
        processing = false
    }
}

onmessage = e => {
    console.log('PROCESS?')
  const { data } = e
  if (!processing) {
      process(data)
  }
}

const load = async () => {
  try {
      model = await tf.loadLayersModel('./rdn-tfjs/model.json')
      model.predict(tf.zeros([1, 320, 240, 3]))
  } catch (e) {
      console.error(e)
  }
}

load()
console.log('PROC LOADED?')

addEventListener('message', e => {
    console.log('HELLO')
  });