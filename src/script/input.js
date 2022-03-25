
import { clearChart, addDataset, updateChart, addCurveOfBestFit } from "./plot.js"
import { getModelData } from "./math.js"

const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)
const chooseFileElement = $("#choose-file")
const presetElement = $("#preset")
const axisElement = $("#axis")
const modelElement = $("#model")
const ignoreElement = $("#ignore")
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

let ignoreAllOtherYAxes = false

let csvFileName = ""
let csvData = []
let globalYModifier = x => x;
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
        y: globalYModifier(p[yAxis]),
      }
    })
    if (!ignoreAllOtherYAxes || yAxis === selectedYAxis) {
      addDataset(yAxis, data);
    }
  });

  // add curve of best fit
  console.log(modelData.regression)
  addCurveOfBestFit(selectedModel + " least squares for " + selectedYAxis, modelData.regression.predict)

  // add bands
  if (modelData.lowerBand) {
    addDataset("Lower bound", modelData.lowerBand, "lower", selectedYAxis)
    addDataset("Upper bound", modelData.upperBand, "upper", selectedYAxis)
  }

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
  console.log(modelData)
  // Update equation
  equationElement.innerHTML = modelData.regression.string.replace(/\+ \-/g, "-")

  // Update R-squared
  let residualHeaders = ["Min", "1Q", "Median", "3Q", "Max"]
  let degreeNames = ["Intercept", "x", "x^2", "x^3", "x^4", "x^5", "x^6", "x^7", "x^8", "x^9", "x^10"]
  let coefficientHeaders = ["", "Estimate", "Std. Error", "t value", "Pr(>|t|)"]
  let coefs = modelData.regression.equation.map((val, degree) => {
    return [
      degreeNames[degree],
      val.toPrecision(4),
      "?",
      "?",
      "?"
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

function updateCurrentPlot(override=null) {
  let tab = override || currentTab
  if (tab === "tab-scatterplot") {
    drawScatterplot()
  } else if (tab === "tab-residuals") {
    drawResidualsPlot()
  } else if (tab === "tab-qq") {
    drawQQPlot()
  }
}
function getCanvasDownloadFileName(plotType) {
  return `${csvFileName}-${selectedModel}-${selectedYAxis}-${plotType}.png`
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

chooseFileElement.addEventListener("change", function(event) {
  let file = event.target.files[0]
  if (!file) return
  let reader = new FileReader()
  reader.onload = (event) => {
    console.log(event.target.result)
    let allRows = event.target.result.split("\n")
    let headers = allRows[0].split(",").map(s => s.trim())
    csvData = allRows.slice(1).map(row => {
      let cells = row.split(",").map(s => s.trim())
      let obj = {}
      for (let i = 0; i < headers.length; i++) {
        let num = parseFloat(cells[i])
        if (isNaN(num)) return null
        obj[headers[i]] = num
      }
      return obj
    }).filter(d => d !== null)
    console.log(csvData)
    csvFileName = file.name
    populateAxisNames()
    updateAll()
  }
  reader.readAsText(file)
})

presetElement.addEventListener("change", () => {
  csvFileName = presetElement.value
  if (!csvFileName) return
  csvData = require(`../asset/${csvFileName}.csv`)

  console.log(csvData)

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
ignoreElement.addEventListener("change", () => {
  ignoreAllOtherYAxes = ignoreElement.checked
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

  // Update global y modifier
  if (selectedModel.endsWith("ln")) {
    globalYModifier = y => Math.log(y)
  } else if (selectedModel.endsWith("sqrt")) {
    globalYModifier = y => Math.sqrt(y)
  } else {
    globalYModifier = y => y
  }

  // Update summary 
  reducedData = csvData.map(p => [p['x'], globalYModifier(p[selectedYAxis])])



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

export { updateCurrentPlot, getCanvasDownloadFileName }