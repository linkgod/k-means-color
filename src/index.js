// 分配簇后，返回新的 means
function assignment(data, means) {
  const clusters = Array(means.length).fill().map(() => [])

  // 对每个点进行分类
  data.forEach(point => {
    let minIndex = 0;

    means.reduce((prev, mean, index) => {
      const distance = euclideanDistance(point, mean);

      if (distance < prev) {
        minIndex = index;
        return distance
      }

      return prev;
    }, Number.MAX_VALUE)

    clusters[minIndex].push(point);
  });

  const newMeans = clusters.map(average)

  return newMeans;
}

// 判断前后2个 means 是否相同
function equal(means, newMeans) {
  return means.every((mean, index) =>
    mean[0] === newMeans[index][0]
    && mean[1] === newMeans[index][1]
    && mean[2] === newMeans[index][2]
  )
}

// 获取初始的点
function getMeans(k, originData) {
  const means = [];
  const data = [].concat(originData);

  // 从已有的样本中随机选择起始值，这样也可以减少循环次数
  while(k--) {
    const index = Math.floor(Math.random() * data.length);
    means.push(data[index]);
    data.splice(index, 1);
  }

  return means;
}

// 计算欧几里得距离
function euclideanDistance(point1, point2) {
  return Math.sqrt(
    Math.pow(point1[0] - point2[0], 2)
    + Math.pow(point1[1] - point2[1], 2)
    + Math.pow(point1[2] - point2[2], 2)
  );
}

// 计算平均点
function average(colors) {
  return colors
    .reduce(
      (sum, color) => [sum[0] + color[0], sum[1] + color[1], sum[2] + color[2]],
      [0, 0, 0]
    )
    .map(sum => sum / colors.length)
}

function kMeans(data, k) {
  console.time('kMeans')
  let means = getMeans(k, data);
  let newMeans = assignment(data, means);
  let count = 0;

  while(!equal(means, newMeans)) {
    means = newMeans;
    newMeans = assignment(data, means);
    count += 1;
  }

  // 取整
  newMeans = newMeans.map(mean => mean.map(Math.round));
  console.timeEnd('kMeans')
  console.log(`计算了${count}次，样本${data.length}`)

  return newMeans;
}

// 获取颜色样本
export function getColors(el, size = 4096) {
  const scale = 1 / Math.sqrt(el.width * el.height / size);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(el.width * scale);
  canvas.height = Math.round(el.height * scale);
  const ctx = canvas.getContext("2d");

  ctx.drawImage(el, 0, 0, canvas.width, canvas.height);
  const image = ctx.getImageData(0, 0, canvas.width, canvas.height);

  const colors = [];
  for (let i = 0; i < image.data.length; i += 4) {
    colors.push([image.data[i], image.data[i + 1], image.data[i + 2]])
  }

  return colors;
}

export default function findDominantColors(image, k = 3) {
  const colors = getColors(image);
  return kMeans(colors, k)
}

export function colorTransform(el, target, k) {
  let image = el;

  if (el instanceof HTMLImageElement) {
    image = new Image();
    image.setAttribute('crossOrigin', 'Anonymous');
    image.src = el.src;
    image.width = el.width;
    image.height = el.height;
    image.onload = function () {
      console.log(this)
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;

      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

      const cluster = findDominantColors(image, k);

      for (let i = 0; i < imageData.data.length; i += 4) {
        const color = [imageData.data[i], imageData.data[i + 1], imageData.data[i + 2]];

        cluster.reduce((prev, mean) => {
          const distance = euclideanDistance(color, mean);

          if (distance < prev) {
            imageData.data[i] = mean[0];
            imageData.data[i + 1] = mean[1];
            imageData.data[i + 2] = mean[2];
            return distance
          }

          return prev;
        }, Number.MAX_VALUE)
      }

      target.width = image.width;
      target.height = image.height;
      target.getContext('2d').putImageData(imageData, 0, 0)
    }
  }

}
