var pButtonsFile = urlParam("file");
addTabs();

function addTabs(){
	var url =  pButtonsFile + ".sections/sections.txt";
	$.get(url, function(data) {
		var sectionsArray = data.split(',');
		for(var i = 1; i < sectionsArray.length-1; i++){
			populateTab(sectionsArray[i]);
		}	   
	});
}


function populateTab(tabName) {
    var parentList = $('ul#tabList');
    var newListElement = "<li><a href='#" + tabName + "' data-toggle='tab'>" + tabName + "</a></li>";
    parentList.append(newListElement);

    var urlFile,newContentElement;
    var parentContent = $('div#tabContent');
    if (tabName=="mgstat" || tabName=="perfmon" || tabName=="vmstat"){
    	urlFile = "tabChart.html?file=" + pButtonsFile + "&type=" + tabName;
	    newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
	      "<iframe class='maxsize main-display-area' frameborder='0' src='" + urlFile + "'></iframe>" +
	      "<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
	      "</div>";
    }else if (tabName=="cconsole" ){
    	urlFile = "console.html?file=" + pButtonsFile + ".sections/" + tabName + '.txt'
    	newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
			"<iframe class='maxsize main-display-area' frameborder='0' src='" + urlFile + "'></iframe>" +
			"<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
			"</div>";
	}else if (tabName=="sard" || tabName=="iostat"){
		// if the files are very big (like sard or iostat) I don't want to display them in Browser
		urlFile = pButtonsFile + ".sections/" + tabName + '.txt'
		newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
			"<span>File too big to display in browser. You can use the link below to download</span>" +
			"<br><a href='" + urlFile + "' target='_blank' download>download<a/>" + 
			"</div>";
	}else if (tabName=="EXTRA"){
		// THIS IS USED to add extra TAB for graphing faster ----- TESTING------
    	titles="&titlesToGraph=Rourefs,PhyRds,Gloupds,Glorefs";
    	urlFile = "tabChart.html?file=" + pButtonsFile + "&type=mgstat" + titles;
    	
    	newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
	      "<iframe class='maxsize main-display-area' frameborder='0' src='" + urlFile + "'></iframe>" +
	      "<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
	      "</div>";
    }else {
    	urlFile = pButtonsFile + ".sections/" + tabName + '.txt'
    	newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
	      "<embed class='maxsize main-display-area' frameborder='0' src='" + urlFile + "'></embed>" +
	      "<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
	      "</div>";
    }

    parentContent.append(newContentElement);
  
}

