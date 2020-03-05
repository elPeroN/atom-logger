'use babel';
import atomLogger from './atom-logger';
var Chart = require('chart.js');

export default class ChartView{

  constructor(title, data) {
    this.config = this.createConfig(title, data);

    this.element = document.createElement('canvas');
    this.chart = new Chart(this.element, this.config);
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  createConfig(title, data){

    var conf = {
      type : 'doughnut',
      data : {
        labels : Object.keys(data),
        datasets : [{
          data : Object.values(data),
          backgroundColor : ['springgreen','tomato','gold']
        }]
      },
      options: {
        legend: {
          labels: {
            fontColor: getComputedStyle(atomLogger.dashView.title).color
          },
          position: 'left'
        },
        title: {
          fontColor: getComputedStyle(atomLogger.dashView.title).color,
          display: true,
          text : title
        },
        animation: {
          animateRotate :true
        }
      }
    }
    return conf;
  }

  update(data) {
    this.chart.config.data.datasets[0].data = Object.values(data);
    this.chart.update();
  }
}
