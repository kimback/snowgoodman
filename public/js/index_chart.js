	 
//라인차트예제
//var MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
var config = {
	type: 'line',
	data: {
		labels: [],
		datasets: []
	},
	options: {
		responsive: true,
		title: {
			display: true,
			text: '개인 기록 - 날짜별'
		},
		tooltips: {
			mode: 'index',
			intersect: false,
		},
		hover: {
			mode: 'nearest',
			intersect: true
		},
		scales: {
			xAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: '날짜'
				},
				ticks: {
				  beginAtZero: true,
				  padding: 0,
				}
			}],
			yAxes: [{
				display: true,
				scaleLabel: {
					display: true,
					labelString: '거리(km)'
				},
				ticks: {
				  beginAtZero: true,
				  padding: 0,
				}
			}]
		},
		maintainAspectRatio: false,
		/*
		tooltips: {
		  callbacks: {
			title: function(tooltipItem, data) {
			  return data['labels'][tooltipItem[0]['index']];
			},
			label: function(tooltipItem, data) {
			  return data['datasets'][0]['data'][tooltipItem['index']];
			},
			afterLabel: function(tooltipItem, data) {
			  var dataset = data['datasets'][0];
			  var percent = Math.round((dataset['data'][tooltipItem['index']] / dataset["_meta"][0]['total']) * 100)
			  return '(' + percent + '%)';
			}
		  },
		  backgroundColor: '#FFF',
		  titleFontSize: 16,
		  titleFontColor: '#0066ff',
		  bodyFontColor: '#000',
		  bodyFontSize: 14,
		  displayColors: false
		},*/
		
	}
};
window.onload = function() {
	var ctx = document.getElementById('myLineChart').getContext('2d');
	window.myLine = new Chart(ctx, config);
};

/*
document.getElementById('randomizeData').addEventListener('click', function() {
	config.data.datasets.forEach(function(dataset) {
		dataset.data = dataset.data.map(function() {
			return randomScalingFactor();
		});
	});
	window.myLine.update();
});
var colorNames = Object.keys(window.chartColors);
document.getElementById('addDataset').addEventListener('click', function() {
	var colorName = colorNames[config.data.datasets.length % colorNames.length];
	var newColor = window.chartColors[colorName];
	var newDataset = {
		label: 'Dataset ' + config.data.datasets.length,
		backgroundColor: newColor,
		borderColor: newColor,type
		data: [],
		fill: false
	};
	for (var index = 0; index < config.data.labels.length; ++index) {
		newDataset.data.push(randomScalingFactor());
	}
	config.data.datasets.push(newDataset);
	window.myLine.update();
});
document.getElementById('addData').addEventListener('click', function() {
	if (config.data.datasets.length > 0) {
		var month = MONTHS[config.data.labels.length % MONTHS.length];
		config.data.labels.push(month);
		config.data.datasets.forEach(function(dataset) {
			dataset.data.push(randomScalingFactor());
		});
		window.myLine.update();
	}
});
document.getElementById('removeDataset').addEventListener('click', function() {
	config.data.datasets.splice(0, 1);
	window.myLine.update();
});
document.getElementById('removeData').addEventListener('click', function() {
	config.data.labels.splice(-1, 1); // remove the label first
	config.data.datasets.forEach(function(dataset) {
		dataset.data.pop();
	});
	window.myLine.update();
});
*/