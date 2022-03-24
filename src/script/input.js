
import { clearChart, addDataset, updateChart } from "./plot.js"
import { getModelData } from "./math.js"

const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)
const presetElement = $("#preset")
const axisElement = $("#axis")
const modelElement = $("#model")
const equationElement = $("#equation")
const rOutputElement = $("#r-output")

let csvFileName = ""
let csvData = []
let axisNames = []
let yAxesNames = []
let selectedYAxis = "y1"
let selectedModel = "linear"
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

  addDataset("residuals", data);

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

  addDataset("Q–Q plot of residuals", data);

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

presetElement.addEventListener("change", () => {
  csvFileName = presetElement.value
  if (!csvFileName) return
  csvData = require(`../asset/${csvFileName}.csv`)

  // focus on scatterplot tab
  showTab("#tab-scatterplot")

  // populate axis names
  populateAxisNames()

  // clear data
  drawScatterplot()

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

function updateAll() {

  // Update summary and plot sections
  reducedData = csvData.map(p => [p['x'], p[selectedYAxis]])
  modelData = getModelData(reducedData, selectedModel)
  populateSummary()

  // Update X-value confidence interval
  
}

// Tabs
let currentTab = "tab-scatterplot"
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
  if (currentTab == "tab-scatterplot") {
    drawScatterplot()
  } else if (currentTab == "tab-residuals") {
    drawResidualsPlot()
  } else if (currentTab == "tab-qq") {
    drawQQPlot()
  }
}))



function optionalInit() {
  csvFileName = "ex1"
  csvData = require(`../asset/ex1.csv`)
  populateAxisNames()
  drawScatterplot()
}
optionalInit()