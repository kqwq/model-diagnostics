import regression from 'regression';
import { probabilityToZscore, zScoreToProbability } from "zscore-probability";
import { jStat } from 'jstat'



function getModelData(data, modelType, x0, ci) {
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
  md.x0 = x0
  if (x0 != null) {
    md.y0 = md.regression.predict(x0)[1]
    md.predictionInterval = getPredictionIntervals(data, md.regression.predict, x0, ci)
  }
  // prediction interval for all x values
  let intervals = data.map(d => getPredictionIntervals(data, md.regression.predict, d[0], ci))
  md.lowerBand = data.map((d, ind) => { return {x: d[0], y:intervals[ind][0]} })
  md.upperBand = data.map((d, ind) => { return {x: d[0], y:intervals[ind][1]} })
  return md
}

function getRegression(d, model) {
  let result
  let data = [...d]
  if (model.endsWith("ln")) {
    data = data.map(d => [d[0], Math.log(d[1])])
  } else if (model.endsWith("sqrt")) {
    data = data.map(d => [d[0], Math.sqrt(d[1])])
  }
  if (model.startsWith("linear")) {
    result = regression.linear(data, {precision: 3})
  } else if (model.startsWith("quadratic")) {
    result = regression.polynomial(data, { order: 2, precision: 3 })
  } else if (model.startsWith("cubic")) {
    result = regression.polynomial(data, { order: 3, precision: 3 })
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

function tdist(df, conf_lvl) {
  return jStat.studentt.inv((1 - (1 - conf_lvl) / 2), df)
}


function getPredictionIntervals(data, predictor, x0, ci) {
  let n = data.length
  let df = n - 2
  let xBar = data.reduce((a, b) => a + b[0], 0) / data.length
  let yBar = data.reduce((a, b) => a + b[1], 0) / data.length
  let y0 = predictor(x0)[1]
  let sumEi = data.map((d, ind) => {
    let trueY = d[1]
    let predictedY = predictor(d[0])[1]
    let ei = Math.pow(trueY - predictedY, 2)
    return ei
  }).reduce((a, b) => a + b, 0)
  let sumXi2 = data.map(d => {
    let xi = Math.pow(d[0] - xBar, 2)
    return xi
  }).reduce((a, b) => a + b, 0)


  // let xDiffSum = data.reduce((a, b) => a + b[0] - xBar, 0)
  // let yDiffSum = data.reduce((a, b) => a + b[1] - yBar, 0)
  // let xDiffSqSum = data.reduce((a, b) => a + Math.pow(b[0] - xBar, 2), 0)
  // let yDiffSqSum = data.reduce((a, b) => a + Math.pow(b[1] - yBar, 2), 0)
  // let xyDiffSum = data.reduce((a, b) => a + (b[0] - xBar) * (b[1] - yBar), 0)


  let se = Math.sqrt(sumEi / (n - 2)) * Math.sqrt(1 + 1 / n + Math.pow(x0 - xBar, 2) / (sumXi2 - n * Math.pow(xBar, 2)))
  let tCrit = tdist(df, ci)
  let lower = y0 - se * tCrit
  let upper = y0 + se * tCrit
  console.log('t score', tCrit)
  return [lower, upper]
}


export { getModelData }