
import { plotData } from "./plot.js"

const $ = x => document.querySelector(x)
const presetElement = $("#preset")




presetElement.addEventListener("change", () => {
  let val = presetElement.value
  if (!val) return
  let data = require(`../asset/${val}.csv`)
  plotData(data, val)
})

let d = require(`../asset/ex1.csv`)
plotData(d, "ex1")