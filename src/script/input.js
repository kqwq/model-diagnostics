
import { clearChart, addDataset, updateChart, addCurveOfBestFit } from "./plot.js"
import { getModelData } from "./math.js"

const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)
const presetElement = $("#preset")
const axisElement = $("#axis")
const modelElement = $("#model")
const equationElement = $("#equation")
const rOutputElement = $("#r-output")
const xValueElement = $("#x-value")
const ciElement = $("#confidence")
const kElement = $("#k")
const lowerElement = $("#lower")
const middleElement = $("#middle")
const upperElement = $("#upper")
const ciOutputElement = $("#ci-output")
const algebraicElement = $("#algebraic")

let csvFileName = ""
let csvData = []
let axisNames = []
let yAxesNames = []
let selectedYAxis = "y1"
let selectedModel = "linear"
let confidenceInterval = 0.95
let xValue = 0
let currentTab = "tab-scatterplot"
let reducedData = [] // data reduced to [[x, y], [x, y], ...]
let modelData = {
/*
  
    name: "linear",
    regression: getRegression(reducedData, "linear"),
    residuals: getResiduals(reducedData, "linear"),
  
  ...
*/
}

function drawScatterplot() {
  clearChart()

  // add datasets
  yAxesNames.forEach(yAxis => {
    let data = csvData.map(p => {
      return {
        x: p['x'],
        y: p[yAxis],
      }
    })
    addDataset(yAxis, data);
  });

  // add curve of best fit
  console.log(modelData.regression)
  addCurveOfBestFit(selectedModel + " least squares for " + selectedYAxis, modelData.regression.predict)

  // update chart
  updateChart(csvFileName)
}

function drawResidualsPlot() {
  clearChart()

  // add dataset
  let data = modelData.residuals.map(d => {
    return {
      x: d[0],
      y: d[1],
    }
  })

  addDataset(`${selectedYAxis} residuals`, data);

  // update chart
  updateChart(csvFileName)
}
function drawQQPlot() {
  clearChart()

  // add dataset
  let data = modelData.qq.map(d => {
    return {
      x: d[0],
      y: d[1],
    }
  })

  addDataset(`Q–Q plot of ${selectedYAxis} residuals`, data);

  // update chart
  updateChart(csvFileName)
}
function populateAxisNames() {
  // Update axes names
  axisNames = Object.keys(csvData[0])
  yAxesNames = axisNames.filter(axisName => axisName.startsWith("y"))

  // Add options to axis's select
  let axisOptions = yAxesNames.map(axisName => `<option value="${axisName}">${axisName}</option>`).join("")
  axisElement.innerHTML = axisOptions

  // default selected axis to the first one
  selectedYAxis = yAxesNames[0]
}

function populateSummary() {
  // Update equation
  equationElement.innerHTML = modelData.regression.string

  // Update R-squared
  let residualHeaders = ["Min", "1Q", "Median", "3Q", "Max"]
  let degreeNames = ["Intercept", "x", "x^2", "x^3", "x^4", "x^5", "x^6", "x^7", "x^8", "x^9", "x^10"]
  let coefficientHeaders = ["", "Estimate", "Std. Error", "t value", "Pr(>|t|)"]
  let coefs = modelData.regression.equation.map((val, degree) => {
    return [
      degreeNames[degree],
      val.toPrecision(4),
      "se",
      "t",
      "0.x"
    ]
  })
  let coefsTable = coefs.map(row => row.map(cell => cell.toString().padStart(10)).join(" ")).join("\n")
  let rSquaredText = 
`Residuals:
${residualHeaders.map(h => h.padStart(10)).join(" ")}
${modelData.qq4.map(q => q.toPrecision(4).padStart(10)).join(" ")}

Coefficients:
${coefficientHeaders.map(h => h.padStart(10)).join(" ")}
${coefsTable}
---
Signif. codes:  0 ‘***’ 0.001 ‘**’ 0.01 ‘*’ 0.05 ‘.’ 0.1 ‘ ’ 1

R-squared: ${modelData.regression.r2} on ${modelData.df} degrees of freedom
`


  rOutputElement.innerText = rSquaredText
}

function updateCurrentPlot() {
  if (currentTab === "tab-scatterplot") {
    drawScatterplot()
    
  } else if (currentTab === "tab-residuals") {
    drawResidualsPlot()
  } else if (currentTab === "tab-qq") {
    drawQQPlot()
  }
}

function populateInterval() {
  let interval = modelData.predictionInterval
  let ci = confidenceInterval
  if (!interval) return
  let lower = interval[0]
  let middle = modelData.y0
  let upper = interval[1]
  kElement.innerText = (modelData.x0).toPrecision(4)
  lowerElement.innerText = lower.toPrecision(4)
  middleElement.innerText = middle.toPrecision(4)
  upperElement.innerText = upper.toPrecision(4)
  algebraicElement.innerText = `(${lower.toPrecision(4)}, ${upper.toPrecision(4)})`
  ciOutputElement.innerText = `${(ci) * 100}%`
}

presetElement.addEventListener("change", () => {
  csvFileName = presetElement.value
  if (!csvFileName) return
  csvData = require(`../asset/${csvFileName}.csv`)


  // populate axis names
  populateAxisNames()

  // update everything else
  updateAll()
})

axisElement.addEventListener("change", () => {
  selectedYAxis = axisElement.value
  updateAll()
})
modelElement.addEventListener("change", () => {
  let val = modelElement.value
  if (!val) return
  selectedModel = val
  updateAll()
})
xValueElement.addEventListener("change", () => {
  let val = xValueElement.value
  if (!val) return
  xValue = parseFloat(val)
  updateAll()
})
ciElement.addEventListener("change", () => {
  let val = ciElement.value
  if (!val) return
  confidenceInterval = parseFloat(val)
  updateAll()
})

function updateAll() {

  // Update summary 
  reducedData = csvData.map(p => [p['x'], p[selectedYAxis]])
  modelData = getModelData(reducedData, selectedModel, xValue, confidenceInterval)
  populateSummary()
  
  // Update plot
  updateCurrentPlot()

  // Update X-value confidence interval
  populateInterval()
}

// Tabs
let tabs = $$(".tab")
function showTab(tabName) {
  currentTab = tabName
  tabs.forEach(tab => {
    tab.classList.remove("active")
  })
  $(tabName).classList.add("active")
}
tabs.forEach(tab => tab.addEventListener("click", function(e) {
  showTab("#" + e.target.id)
  currentTab = e.target.id
  updateCurrentPlot()
}))



// function optionalInit() {
//   csvFileName = "ex1"
//   csvData = require(`../asset/ex1.csv`)
//   populateAxisNames()
//   drawScatterplot()
// }
// optionalInit()