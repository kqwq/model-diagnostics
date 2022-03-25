import { Chart, registerables  } from "chart.js";


Chart.register(...registerables);

let colors = {
  y: 'rgb(255,0,0)',
  y1: 'rgb(255,0,0)',
  y2: 'rgb(0,70,239)',
  y3: 'rgb(130,223,0)',
  y4: 'rgb(205,0,179)',
  y5: 'rgb(0,185,154)',
  y5: 'rgb(243,132,0)',
  y5: 'rgb(57,0,227)',
  y5: 'rgb(9,209,0)',
  y5: 'rgb(190,0,64)',
  y5: 'rgb(0,155,247)'
};
let defaultColor = 'rgb(0,0,0)';

const data = {
  datasets: [
    // {
    //   label: 'Dataset 1',
    //   data: Utils.bubbles(NUMBER_CFG),
    //   borderColor: Utils.CHART_COLORS.red,
    //   //backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    //   yAxisID: 'y',
    // },
    // {
    //   label: 'Dataset 2',
    //   data: Utils.bubbles(NUMBER_CFG),
    //   borderColor: Utils.CHART_COLORS.orange,
    //   backgroundColor: Utils.transparentize(Utils.CHART_COLORS.orange, 0.5),
    //   yAxisID: 'y2',
    // }
  ]
};
const config = {
  type: 'scatter',
  data: data,
  options: {

    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Scatter Multi Axis Chart'
      }
    },
    scales: {
      y: {
        type: 'linear', // only linear but allow scale type registration. This allows extensions to exist solely for log scale for instance
        position: 'left',
        reverse: false,
        ticks: {
          color: '#00f'
        },
        grid: {
          drawOnChartArea: false // only want the grid lines for one axis to show up
        }
      }
    }
  },
};
function clearChart() {
  myChart.minX = Infinity
  myChart.maxX = -Infinity
  myChart.data.datasets = [];
  myChart.update();
}
function addDataset(name, data, bandType, selectedYAxis) {
  myChart.minX = Math.min(myChart.minX, ...data.map(d => d.x))
  myChart.maxX = Math.max(myChart.maxX, ...data.map(d => d.x))
  let chartData = {
    label: name,
    data: data,
    borderColor: colors[name] || defaultColor,
    yAxisID: "y",
  }
  if (bandType) {
    chartData.borderColor = "transparent"
    chartData.backgroundColor = colors[selectedYAxis].slice(0, -1) + ",0.3)"
    chartData.fill = myChart.data.datasets.length - (bandType === "lower" ? 1 : 2)
    chartData.pointRadius = 0

  }
  myChart.data.datasets.push(chartData);
}
function addCurveOfBestFit(name, predictor) {
  // lerp between min and max for 100 points
  let lineData = [];
  for (let i = 0; i < 100; i++) {
    let x = myChart.minX + (myChart.maxX - myChart.minX) * i / 100
    let y = predictor(x)[1]
    lineData.push({
      x: x,
      y: y,
    })
  }
  myChart.data.datasets.push({
    label: name,
    data: lineData,
    borderColor: defaultColor,
    yAxisID: "y",
    type: 'line',
    pointRadius: 0,
    borderWidth: 1.5
  });
}
function updateChart(fileName) {
  //myChart.options.plugins.title.text = `Scatterplot for ${fileName}`;
  myChart.options.plugins.title.display = false;
  myChart.update();
}

const canvas = document.getElementById("plot")
const myChart = new Chart(
  canvas,
  config
)
canvas.style.backgroundColor = 'white'
clearChart()

export { clearChart, addDataset, updateChart, addCurveOfBestFit };