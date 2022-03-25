import { updateCurrentPlot, getCanvasDownloadFileName } from './input.js';

const $ = x => document.querySelector(x)
const $$ = x => document.querySelectorAll(x)

const step1 = $("#step1")
const step2 = $("#step2")
const step3a = $("#step3a")
const step3b = $("#step3b")
const step4 = $("#step4")
const plotCanvas = $("#plot")

function copyText(text) {
  var copyFrom = document.createElement("textarea");
  copyFrom.textContent = text;
  var body = document.getElementsByTagName('body')[0];
  body.appendChild(copyFrom);
  copyFrom.select();
  document.execCommand('copy');
  body.removeChild(copyFrom);
}

step1.addEventListener("click", () => {
  copyText($("#equation").innerText)
})

step2.addEventListener("click", () => {
  copyText($("#r-output").innerText)
})

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms))

// Convert canvas to image
step3a.addEventListener("click", function () {
  (async () => {
    updateCurrentPlot('tab-residuals')
    await sleep(650)
    var dataURL = plotCanvas.toDataURL("image/png", 1.0);
    downloadImage(dataURL, getCanvasDownloadFileName('residuals'))
    updateCurrentPlot()
  })();
});

step3b.addEventListener("click", function () {
  (async () => {
    updateCurrentPlot('tab-qq')
    await sleep(650)
    var dataURL = plotCanvas.toDataURL("image/png", 1.0);
    downloadImage(dataURL, getCanvasDownloadFileName('QQ'))
    updateCurrentPlot()
  })();
});

step4.addEventListener("click", () => {
  copyText($("#algebraic").innerText)
})

// Save | Download image
function downloadImage(data, filename = 'untitled.png') {
  var a = document.createElement('a');
  a.href = data;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
}
