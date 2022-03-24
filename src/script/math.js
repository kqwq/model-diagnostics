import regression from 'regression';
import { probabilityToZscore, zScoreToProbability } from "zscore-probability";


function getModelData(data, modelType) {
  let md = {
    name: modelType,
    regression: getRegression(data, modelType),
  }
  md.residuals = getResiduals(data, md.regression.predict)
  md.qq = getQQ(md.residuals)
  md.qqBestFit = getRegression(md.qq, "linear")
  md.qq4 = getQQ4(md.qq)
  md.n = data.length
  md.df = md.n - 2
  return md
}

function getRegression(data, model) {
  let result
  if (model == "linear") {
    result = regression.linear(data, {precision: 4})
  } else if (model == "linear-ln") {
    data = data.map(d => [d, Math.log(d[1])])
    result = regression.linear(data, {precision: 4})
  } else if (model == "quadratic") {
    result = regression.polynomial(data, { order: 2, precision: 4 })
  } else if (model == "quadratic-sqrt") {
    data = data.map(d => [d, Math.sqrt(d[1])])
    result = regression.polynomial(data, { order: 2, precision: 4 })
  }
  return result
}



function getResiduals(data, predictor) {
  let residuals = data.map(d => {
    let predictedPair = predictor(d[0])
    return [d[0], d[1] - predictedPair[1]]
  })
  return residuals
}

function getQQ(residuals) {
  let qq = []
  let n = residuals.length
  let sortedResiduals = residuals.sort((a, b) => a[1] - b[1])
  let theoreticalZScores = []
  for (let i = 0; i < n; i++) {
    let adjustedMidXPosition = (i + 0.5) / (n + 1) // x-position of the midpoint of the bar
    let z = probabilityToZscore(adjustedMidXPosition)
    qq.push([z, sortedResiduals[i][1]])
  }
  return qq
}

function getQQ4(residuals) {
  let resSorted = residuals.sort((a, b) => a[1] - b[1])
  return [
    resSorted[0][1],
    resSorted[Math.floor(residuals.length / 4)][1],
    resSorted[Math.floor(residuals.length / 2)][1],
    resSorted[Math.floor(residuals.length * 3 / 4)][1],
    resSorted[residuals.length - 1][1],
  ]
}

export { getModelData }