var pButtonsFile = urlParam("file");
addTabs();

function addTabs(){
	var url =  pButtonsFile + ".sections/sections.txt";
	$.get(url, function(data) {
		var sectionsArray = data.split(',');
		for(var i = 1; i < sectionsArray.length-1; i++){
			section=sectionsArray[i].split("#");
			populateTab(section[0],section[1]);
		}	   
	});
}


function populateTab(tabName,tabSize) {
    var parentList = $('ul#tabList');
    var newListElement = "<li><a href='#" + tabName + "' data-toggle='tab'>" + tabName + "</a></li>";
    parentList.append(newListElement);

    var urlFile,newContentElement;
    var parentContent = $('div#tabContent');
    if (tabName=="mgstat" || tabName=="perfmon" || tabName=="vmstat" || tabName=="sard"){
    	urlFile = "tabChart.html?file=" + pButtonsFile + "&type=" + tabName;
	    newContentElement = "<div class='tab-pane  main-display-area' id='" + tabName + "'>" +
	      "<iframe class='maxsize' frameborder='0' src='" + urlFile + "'></iframe>" +
	      "<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
	      "</div>";
    }else if (tabSize>8000000){ // Bigger than 8MB
		// if the files are very big (like sard or iostat) I don't want to display them in Browser
		urlFile = pButtonsFile + ".sections/" + tabName + '.txt'
		newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
			"<span>File too big to display in browser. You can use the link below to download</span>" +
			"<br><a href='" + urlFile + "' target='_blank' download>download<a/>" + 
			"</div>";
    }else if (tabName=="cconsole" || tabName=="SS" || tabName=="ss" || tabName=="syslog"  || tabName=="cpf" || tabName.includes("cstat")){
    	urlFile = "console.html?file=" + pButtonsFile + ".sections/" + tabName + '.txt'
    	newContentElement = "<div class='tab-pane  main-display-area' id='" + tabName + "'>" +
			"<embed class='maxsize' frameborder='0' src='" + urlFile + "'></embed>" +
			"<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
			"</div>";
	}else {
    	urlFile = pButtonsFile + ".sections/" + tabName + '.txt'
    	newContentElement = "<div class='tab-pane well main-display-area' id='" + tabName + "'>" +
    	  "<button type='button' class='btn btn-default' onclick='openWithFilter(\""+tabName+"\")'>See with filter tool</button>"+	
	      "<embed class='maxsize' frameborder='0' src='" + urlFile + "'></embed>" +
	      "<a href='" + urlFile + "' target='_blank' download>download<a/>" + 
	      "</div>";
    }

    parentContent.append(newContentElement);
  
}

function openWithFilter(tabName)
{
	var oldSrc=$("#"+tabName+" embed").attr("src");
	$("#"+tabName+" embed").attr("src","console.html?file="+oldSrc);
	var newEmbed=$("#"+tabName+" embed");
	var newEmbedParent=newEmbed.parent();
	$("#"+tabName+" embed").remove();
	newEmbedParent.removeClass("well");
	newEmbedParent.append(newEmbed);
	$("#"+tabName+" button").remove();
	
	
	
}
