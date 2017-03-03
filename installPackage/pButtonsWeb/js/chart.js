var pButtonsFile = urlParam("file");
var chartType = urlParam("type");
var titlesToGraph = urlParam("titlesToGraph");

var chartDataDateFormat = "";
// this variables will let me control if we want to zoom or not when adding/removing graphs
var allowZoom=true,zoomStartDate,zoomEndDate;

// Save time in the case we are opening a child window

var chart;
var chartData;

document.title = 'GRAPH '+titlesToGraph;

if (opener == null){
	chartData = loadChartData(chartType);
	populateButtonsMenu();	
}else{
	chartData = opener.chartData;
}
createMainChart();

// ============================================ FUNCTIONS =========================================

function createMainChart(){
	chart = AmCharts.makeChart("chartdiv", {
		  "type": "serial",
		  "theme": "light",
		  "marginRight": 40,
		  "marginLeft": 40,
		  "autoMarginOffset": 20,  
		  "addClassNames": true,
		  "legend": {
			    "horizontalGap": 10,
			    "position": "bottom",
			    "useGraphSettings": true,
			    "markerSize": 10,
			    "listeners": [{
			      "event": "rollOverItem",
			      "method": function(event) {
			        highlightGraph(event.chart.graphs[event.dataItem.index]);
			      }
			    }, {
			      "event": "rollOutItem",
			      "method": function(event) {
			    	  unHighlightGraphs();
			      }
			    }]
			  },	  
		  "dataProvider": chartData,
		  "valueAxes": [],
		  "graphs": [],
		  "categoryField": "dateTime",
		  "dataDateFormat": chartDataDateFormat,
		  "categoryAxis": {
		    "parseDates": true,
		    "dashLength": 1,
		    "minorGridEnabled": true,
		    "minPeriod": "ss"
		  },
		    "mouseWheelZoomEnabled":true,
		    "autoMarginOffset": 20,
		    "chartCursor": {
		        "cursorPosition": "mouse",
		        "categoryBalloonDateFormat": "JJ:NN:SS",
		        "pan": false,
		    },
		    "export": {
		        "enabled": true
		    },
		    "chartScrollbar": {
		    	"updateOnReleaseOnly": true,
		        "autoGridCount": true,
		        "scrollbarHeight": 40,
		        "oppositeAxis":true
		    },
		    "listeners": [{
		        "event": "rendered",
		        "method": function(e) {
		        			console.log("renderer..");
		        		  }
		      	},{
		      	"event": "init",
		        "method": function(e) {
				          	populateSelectValues();
			          		if (titlesToGraph !="") {
			          			console.log("init");
				          		addGraphs(titlesToGraph.split(","));
				          	}
		        		  }
		      	},{
		      	"event": "zoomed",
		        "method": syncZoom
		      	}
		    ]
		});

}

// zoom to previous saved date/time
function syncZoom(event) {
	if (!allowZoom){
	//chart.ignoreZoom = true;
	chart.zoomToDates(zoomStartDate, zoomEndDate);
	}else{
		zoomStartDate=event.startDate;
		zoomEndDate=event.endDate;
	}
}

// populate the select box with data columns
function populateSelectValues() {
  var selectBox = $("#selectPicker");
  var optionString="<optgroup label='"+chartType+"'>";
  $.each(chartData[0], function(k){
    if (k!='dateTime'){
    	optionString += "<option>"+k+"</option>";
    }else {
    	optionString+="</optgroup><optgroup label='OS METRICS'>";
    	// This is only needed when mixing 
    }
  });
  optionString += "</optgroup>";
  selectBox.append(optionString);
  selectBox.selectpicker('refresh');
}

// main function to add graphs. titles parameter is an array of columns to display
function addGraphs(titles) {
  if (titles==undefined){
    // If there aren't titles then I take them from the select
    titles = jQuery(".form-template .titleField").selectpicker('val');
  }else {
    // I set the select values to reflect the changes
    jQuery(".form-template .titleField").selectpicker('val',titles);
  }

  var alreadyGraphed = [], toRemove=[];
  
  // disable automatic zoom
  allowZoom=false;
  // loop through axis to see if I need to remove or add
  chart.graphs.forEach(function(valGraph) {
      if (titles.includes(valGraph.title)) {
        // Already graphed
        alreadyGraphed.push(valGraph.title); 
      } else {
        // Remove graphs as is not in the select
        toRemove.push(valGraph);
      }   
  });

  var t0 = performance.now();
  // loop to remove
  toRemove.forEach(function(graph) {
      chart.removeGraph(graph);
  });
  var t1 = performance.now();
  console.log("Removing ALL graphs took " + (t1 - t0) + " milliseconds.");
  
  // loop through titles to add missing ones
   titles.forEach(function(title) {
	  if (!alreadyGraphed.includes(title)){
        // Add graph
    	var t0 = performance.now();
    	addGraphPlusAxisToChart(title);
    	var t1 = performance.now();console.log("Call to add graph&Axis TOTAL "+ title + " took " + (t1 - t0) + " milliseconds.");
      }
  });
  
  // This will update offsets for Axis
  updateAxisOffsets();
  // Enable the manual zoom
  allowZoom=true;
}


function addGraphPlusAxisToChart(title) {
	  // check if the the axis exists
	
 	 var axis = addAxisToChart(title);
	 addGraphToChart(axis);
	}

// Add an axis and returns it
function addAxisToChart(title) {
	  var axisArray = $.grep(chart.valueAxes, function(e){ return e.id == title; })
	  if (axisArray.length == 0) {
		  // not found, so add it
		  var color =  chart.colors[chart.valueAxes.length];
		  var t0 = performance.now();
		  var a = new AmCharts.ValueAxis();
			  a.id = title;
			  a.axisColor = color;
			  a.axisThickness = 2;
			  a.gridAlpha = 0;
			  a.axisAlpha = 1;
			  a.minimum = 0;	  
		  if (checkIfTitleIsCPUKind(title)) {
		  	a.maximum = 100;
		  	a.autoOffset = false;
		  	a.position = "left";
		  } else {
		  		a.autoOffset = true;
		  		a.position = "right";
		  }
		  chart.addValueAxis(a);
		  var t1 = performance.now();console.log("Call to addAxis "+ title + " took " + (t1 - t0) + " milliseconds.");

	  } else if (axisArray.length == 1) {
		  // access the foo property using axisArray[0].id
		  var a = axisArray[0];
	  } else{
		  // multiple axis found.;
		  var a = axisArray[0];
	  }
	  
	  // Add value axis
	  
	  return a;
}

// Check if title is a CPU type to not add new axis and set the max value to 100
// this helps with the visualitation
function checkIfTitleIsCPUKind(title) {
	if (title.includes("Processor") || title.includes("%util") || title.includes("await")) {
		return true;
	}else {
		if (title=="us" || title=="sy" ||title=="wa" ||title=="id" || title=="st") { return true }
	}
	return false;
}

function addGraphToChart(a) {
	  var title= a.id;
	  
	  // Add graph attached to the axis
	  var t0 = performance.now();
	  var g = new AmCharts.AmGraph();
		  g.precision = 2;
		  g.lineThickness=1.5;
		  g.valueAxis = a;
		  g.lineColor = a.axisColor;
		  g.bullet = "round";
		  g.lineAlpha = 0.8;
		  g.bulletBorderThickness = 1;
		  g.hideBulletsCount = 30;
		  g.title = title;
		  g.valueField = title;
		  g.fillAlphas = 0;
	  
	  chart.addGraph(g);
	  var t1 = performance.now();console.log("Call to addGraph "+ title + " took " + (t1 - t0) + " milliseconds.");
	  
	}


// Used to update offset positions for axis when adding or removing.
function updateAxisOffsets() {
    // initialize offsets
    var offsets = {
      "left": 0,
      "right": 0,
      "top": 0,
      "bottom": 0
    };

    // initialize initial margin
    if ( chart.axisMargins === undefined ) {
      chart.axisMargins = {
        "left": chart.marginLeftReal,
        "right": chart.marginRightReal,
        "top": chart.marginTopReal,
        "bottom": chart.marginBottomReal
      };
    }

    // iterate through all of the axis
    for ( var i = 0; i < chart.valueAxes.length; i++ ) {
      var axis = chart.valueAxes[ i ];
      var axisWidth;
      if ( axis.position == "top" || axis.position == "bottom" ) {
        axisWidth = axis.getBBox().height + chart.autoMarginOffset + 10;
        if ( typeof axis.guides !== "undefined" && axis.guides.length )
          axisWidth -= chart.plotAreaHeight;
      } else {
        axisWidth = axis.getBBox().width + chart.autoMarginOffset + 10;
        if ( typeof axis.guides !== "undefined" && axis.guides.length )
          axisWidth -= chart.plotAreaWidth;
      }

      if ( axis.autoOffset === true && axis.foundGraphs ) {
        axis.offset = offsets[ axis.position ];
        offsets[ axis.position ] += axisWidth;

        if ( axis.axisThickness > 1 )
          offsets[ axis.position ] += axis.axisThickness;
      }
    }

    // check if offsets have been updated
    if ( offsets.left === 0 && offsets.right === 0 && offsets.top === 0 && offsets.bottom === 0 )
      return;

    chart.marginsUpdated = false;
    chart.validateNow( false, true );
    
}
function getDatafromFile(file){
    var response="";
    var rawFile = new XMLHttpRequest();
    
    rawFile.open("GET", file, false);
    rawFile.onreadystatechange = function (){
        if(rawFile.readyState === 4){
            if(rawFile.status === 200 || rawFile.status == 0){
                response = rawFile.responseText;
            }
        }
    }
    rawFile.send(null);
    
    return response; 
}

function loadChartData(type) {
  var dataFile =  pButtonsFile+".sections/" + type + ".txt";
  switch(type) {
    case 'mgstat':
      return parseMgstat(dataFile);
      break;
    case 'vmstat':
      return parseVmstat(dataFile);
      break;
    case 'perfmon':
      return parsePerfmon(dataFile);
      break;
   case 'sard':
      return loadSarData();
      break;
    case 'mgstatPerfmon':
    	mgstatData = parseMgstat(pButtonsFile+".sections/mgstat.txt");
    	perfmonData = parsePerfmon(pButtonsFile+".sections/perfmon.txt");
    	for ( var i = 0; i < mgstatData.length; i++ ) {$.extend(mgstatData[i], perfmonData[i]);}
    	return mgstatData;
      break;
    case 'mgstatVmstat':
    	mgstatData = parseMgstat(pButtonsFile+".sections/mgstat.txt");
    	vmstatData = parseVmstat(pButtonsFile+".sections/vmstat.txt");
    	for ( var i = 0; i < mgstatData.length; i++ ) {$.extend(mgstatData[i], vmstatData[i]);}
    	return mgstatData;
      break;
    default:
      break;
    }
}

function parseVmstat(dataFile) {
  var rawFile = getDatafromFile(dataFile);
  // remove very first space
  rawFile = rawFile.substring(rawFile.indexOf(" ")+1);
  // remove first space on every line and then substitute spaces for single comma
  rawFile = rawFile.replace(/\n /g,'\n').replace(/[ ][ ]*/g, ',');
  // prepare the string with date and time text. On linux not always appear
  rawFile = "date,time,"+rawFile.substring(rawFile.indexOf("r"))
  var chartData = AmCharts.parseCSV( rawFile, {"useColumnNames": true} );
  // set DateTime as data column
  for ( var i = 0; i < chartData.length; i++ ) {
    //chartData[i]["dateTime"]=chartData[i].date + " " +chartData[i].time;
    chartData[i]["dateTime"]= AmCharts.stringToDate(chartData[i].date + " " +chartData[i].time,"MM/DD/YY JJ:NN:SS");
    delete chartData[i].date;
    delete chartData[i].time;
  }
  // remove last 3 lines as they have new line chars that prevents the chart to graph
  chartData.pop();chartData.pop();chartData.pop();
  //chartDataDateFormat = "MM/DD/YY JJ:NN:SS";
  return chartData;
}

function parsePerfmon(dataFile) {
  //console.log(dataFile);
  var rawFile = getDatafromFile(dataFile);
 
  var t0 = performance.now();
//remove first lines from the mgstat file
  rawFile = rawFile.substring(rawFile.indexOf("\n")+1)
  
  //rawFile = rawFile.replace("(PDH-CSV 4.0) (Romance Standard Time)(-60)","dateTime");
  //rawFile = rawFile.replace("(PDH-CSV 4.0) (Malay Peninsula Standard Time)(-480)","dateTime");
  rawFile = rawFile.replace(/\"([^"]+)\"/,'"dateTime"');
  var t1 = performance.now();
  console.log("Call to replace to datetime took " + (t1 - t0) + " milliseconds.");
	
  var t0 = performance.now();
  var chartData = AmCharts.parseCSV( rawFile, {"useColumnNames": true} );
  var t1 = performance.now();
  console.log("Call to parseCSV took " + (t1 - t0) + " milliseconds.");

  // remove last lines
  chartData.pop(); chartData.pop();
  chartDataDateFormat = "MM/DD/YYYY JJ:NN:SS.QQQ";

  return chartData;
}

function parseMgstat(dataFile) {
	var t0 = performance.now();  
  var rawFile = getDatafromFile(dataFile);
  // go to the column file starting with Date in the mgstat file
  rawFile = rawFile.substring(rawFile.indexOf("Date"));
  var chartData = AmCharts.parseCSV( rawFile, {"useColumnNames": true } );
  // remove last lines to avoid undefined (garbage in mgstat)
  chartData.pop();  chartData.pop();  chartData.pop();  chartData.pop(); 
  // set DateTime as data column
  for ( var i = 0; i < chartData.length; i++ ) {
    //chartData[i]["dateTime"]=chartData[i].Date + chartData[i].Time;
    chartData[i]["dateTime"]=AmCharts.stringToDate(chartData[i].Date + chartData[i].Time,"MM/DD/YYYY JJ:NN:SS");
    delete chartData[i].Date;
    delete chartData[i].Time;
  }
  chartDataDateFormat = "MM/DD/YYYY JJ:NN:SS";
  var t1 = performance.now();
  console.log("Call to parseData took " + (t1 - t0) + " milliseconds.");
 
  return chartData
}

//
// PARSE SARD DATA FUNCTIONS
//
function loadSarData(){
	var url =  pButtonsFile + ".sections/sard/devices.txt";
	// I need to use the async call to get return the data
	var devicesArray;
	$.ajax({
	     async: false,
	     type: 'GET',
	     url: url,
	     success: function(data) {
	         devicesArray = data.split(',');
	     }
	});

	deviceDataFinal = parseSard( pButtonsFile+".sections/sard/" +devicesArray[1]+".txt");	
	for(var i = 2; i < devicesArray.length-1; i++){
		deviceData = parseSard( pButtonsFile+".sections/sard/" +devicesArray[i]+".txt");
		for ( var j = 0; j < deviceDataFinal.length; j++ ) {$.extend(deviceDataFinal[j], deviceData[j]);}
	}
	return deviceDataFinal;
	
}

function parseSard(dataFile) {
  
  var t0 = performance.now();  
  var rawFile = getDatafromFile(dataFile);
  var chartData = AmCharts.parseCSV( rawFile, {"useColumnNames": true } );
  chartData.pop();
  chartData.pop();
  
  chartDataDateFormat = "MM/DD/YY JJ:NN:SS";
  var t1 = performance.now();
  console.log("Call to parseSardData took " + (t1 - t0) + " milliseconds.");
 
  return chartData
}

//
//											END PARSING
//

// 
// Legend listener to highlight graphs functions
//
function highlightGraph(graph) {
	for ( var i = 0; i < chart.graphs.length; i++ ) {
		if (chart.graphs[i]==graph){
			setOpacityGraph(chart.graphs[i],1);
		}
		else{
			setOpacityGraph(chart.graphs[i],0.1);
		}
		
	}
}

function unHighlightGraphs() {
	for ( var i = 0; i < chart.graphs.length; i++ ) {
		setOpacityGraph(chart.graphs[i],0.8);
	}
}

function setOpacityGraph(graph, opacity) {
	  var className = "amcharts-graph-" + graph.id;
	  var items = document.getElementsByClassName(className);
	  if (undefined === items)
	    return;
	  for (var x in items) {
	    if ("object" !== typeof items[x])
	      continue;
	    var path = items[x].getElementsByTagName("path")[0];
	    if (undefined !== path) {
	      // set line opacity
	      path.style.strokeOpacity = opacity;
	    }

	    // set bullet opacity
	    var bullets = items[x].getElementsByClassName("amcharts-graph-bullet");
	    for (var y in bullets) {
	      if ("object" !== typeof bullets[y])
	        continue;
	      bullets[y].style.fillOpacity = opacity;
	    }
	    
	    // set label opacity
	    var labels = items[x].getElementsByClassName("amcharts-graph-label");
	    for (var y in labels) {
	      if ("object" !== typeof labels[y])
	        continue;
	      labels[y].style.opacity = opacity == 1 ? 1 : 0;
	    }

	  }
	  
	// set axis opacity
	  var className = "value-axis-" + graph.title;
	  var axis = document.getElementsByClassName(className);
	    for (var y in axis) {
	      if ("object" !== typeof axis[y])
	        continue;
	      axis[y].style.opacity = opacity;
	    }
	}


//
//<button type="button" class="btn btn-primary" onclick='addGraphs(["Rourefs", "PhyRds", "Gloupds", "Glorefs"])'>Global Module</button>
//<button type="button" class="btn btn-primary" onclick='addGraphs(["WIJwri","WDtmpq","PhyWrs","WDQsz","WDphase"])'>Write Daemon</button>
//<button type="button" class="btn btn-primary" onclick='addGraphs(["PhyRds","WIJwri","PhyWrs","Jrnwrts","WDphase"])'>Physical I/O</button>


function populateButtonsMenu(){
	switch(chartType) {
    case 'mgstat':
    	$("<input type='button' class='btn btn-primary dinamicBtn' value='Global Module' id='btn_GM' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_GM', function(){ addGraphs(["Rourefs", "PhyRds", "Gloupds", "Glorefs"])});

    	$("<input type='button' class='btn btn-primary dinamicBtn' value='Write Daemon' id='btn_WD' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_WD', function(){ addGraphs(["WIJwri","WDtmpq","PhyWrs","WDQsz","WDphase"])});
    	
    	$("<input type='button' class='btn btn-primary dinamicBtn' value='Physical I/O' id='btn_PY' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_PY', function(){ addGraphs(["PhyRds","WIJwri","PhyWrs","Jrnwrts","WDphase"])});
   
     	$("<input type='button' class='btn btn-primary dinamicBtn' value='Open in new windows' id='btn_Windows' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_Windows', function(){ 
    		graphNewWindows=["Rourefs,PhyRds,Gloupds,Glorefs",
    		         "WIJwri,WDtmpq,PhyWrs,WDQsz,WDphase",
    		         "PhyRds,WIJwri,PhyWrs,Jrnwrts,WDphase"];
    		newWindowWithGraphs(graphNewWindows)});

      break;
    case 'vmstat':
    	$("<input type='button' class='btn btn-warning dinamicBtn' value='CPU' id='btn_CPU' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_CPU', function(){ addGraphs(["us", "sy", "id", "wa"])});

    	$("<input type='button' class='btn btn-warning dinamicBtn' value='Memory' id='btn_MEM' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_MEM', function(){ addGraphs(["free","buff","cache","swpd"])});
    	
    	$("<input type='button' class='btn btn-warning dinamicBtn' value='IO' id='btn_IO' />").appendTo('#buttonMenu');
    	$('#buttonMenu').on('click', '#btn_IO', function(){ addGraphs(["r","b","wa"])});
      break;
    case 'perfmon':
      break;
    case 'mix':
      break;
    default:
      break;
    }
}


function newWindowWithGraphs(graphNewWindows){
	for (i = 0; i < graphNewWindows.length; i++) {
	    var a = window.open(this.location.href+'&titlesToGraph='+graphNewWindows[i],'_blank','width=1200,height=450');
	 }
	
}

