import { Chart, registerables  } from "chart.js";
import {} from "./math.js"

Chart.register(...registerables);

let colors = [
  'rgb(255,0,0)',
  'rgb(0,70,239)',
  'rgb(130,223,0)',
  'rgb(205,0,179)',
  'rgb(0,185,154)',
  'rgb(243,132,0)',
  'rgb(57,0,227)',
  'rgb(9,209,0)',
  'rgb(190,0,64)',
  'rgb(0,155,247)'
];

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
function addDataset(name, data) {
  myChart.data.datasets.push({
    label: name,
    data: data,
    borderColor: colors[name.at(-1) - 1],
    //backgroundColor: Utils.transparentize(Utils.CHART_COLORS.red, 0.5),
    yAxisID: "y",
  });
}
function plotData(inData, fileName) {
  console.log("plotData", inData, fileName);
  let columns = Object.keys(inData[0]);
  let yAxes = columns.filter(x => x.startsWith("y"));
  let xAxis = columns.find(x => x.startsWith("x"));
  
  // clear data
  myChart.data.datasets = [];

  // add datasets
  yAxes.forEach(yAxis => {
    let data = inData.map(p => {
      return {
        x: p[xAxis],
        y: p[yAxis],
      }
    })
    addDataset(yAxis, data);
  });

  myChart.options.plugins.title.text = `Scatterplot for ${fileName}`;
  myChart.update();
}

const canvas = document.getElementById("plot")
const myChart = new Chart(
  canvas,
  config
)
canvas.style.backgroundColor = 'white'


export { plotData };