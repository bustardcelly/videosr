// https://github.com/thekevinscott/tensor-as-base64/edit/master/src/index.ts
export const tensorAsBuffer = async (tensor) => {
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
};

export const tensorAsBase64 = async (tensor) => {
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
};

export default tensorAsBase64
