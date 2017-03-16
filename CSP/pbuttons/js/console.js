//------------------------------------------------------------------------------------------
//format cconsole.log entries
//------------------------------------------------------------------------------------------

// host the cconsole.log html
var html;

// array with the html content. It is used to filter
var lines=[];

//array with the htmlFilter content. It is used to filter
var filterLines=[];

$(document).ready(function(){
	// start loading the cconsole.log
	loadConsoleIframe();
});

function loadConsoleIframe(){
	var cconsoleFile =  urlParam("file");
	// load the iframe
	$("#iframeConsole").attr('src',cconsoleFile);
	document.title = 'LOG '+cconsoleFile;
	loadVersion();
}

// load version from general.txt section
var ZV=null;
function loadVersion(){
	var url =  urlParam("file") + "/../general.txt";
	$.get(url, function(data) {
		var start=data.indexOf("Version String:")+16;
		var end = data.indexOf("\n",start);
		ZV = data.substring(start,end);
	});
}


function prepareConsole(){
	// get contents from iFrame
	console.log("parsing...");
	html = $("#iframeConsole").contents().find("body pre").text();
	parseConsole();
	$("#iframeConsole").contents().find("body pre").html(html);
	
	return true;
}

// filter the cconsole.log 
function loadFilter(){
	var filterHtml = filterConsole($("#filter").val());
	$("#iframeConsole").contents().find("body pre").empty(); // this avoids memory leaks
	$("#iframeConsole").contents().find("body pre").html(filterHtml);
	enableLines();
	return true;
}

//filter the cconsole.log with level 
function loadFilterWithLevel(severity){
	
	var filter ="";
	if(severity == 1) {
		filter = "#337ab7"; //blue
	}
	else if(severity == 2) {
		filter = "#d58512"; //orange
	}
	else if(severity >= 3) {
		filter = "#ac2925"; //red
	}else{
		$("#iframeConsole").contents().find("body pre").html(html);
		filterLines=lines;
		$("#filteredText").text("filtered text: ");
		$("#filter").val("");
		return true;
	}
	var filterHtml = filterConsole(filter);
	$("#iframeConsole").contents().find("body pre").empty(); // this avoids memory leaks
	$("#iframeConsole").contents().find("body pre").html(filterHtml);
	enableLines();
	return true;
}


// filter with a particular string 
function filterConsole(string) {
	string=string.toLowerCase();
	var newLines=[];
	for(var ii = 1; ii < filterLines.length - 1; ii++) {
		var line = filterLines[ii];
		
		//MSM:  check if the string appears to filter
		if (line.toLowerCase().indexOf(string) >= 0){
			newLines.push(line);
		}
	}
	filterLines=newLines;
	$("#filteredText").text($("#filteredText").text()+" , "+string);
	$("#filter").val("");
	
	return newLines.join("\n");	
}

// prepare the object for future parsing and filters
function parseConsole() {
	if (urlParam("file").includes("cconsole")){
		// if the file is cconsole.log we parse it. If not we don't so it is quicker. 
		$("#levelButtons").show();
		parseCconsole();
		return ;

	}else if(urlParam("file").includes("syslog")) {
		// hide Level buttons when we don't see a cconsole.log file
		parseSYSLOG();	
	}else if(urlParam("file").includes("cpf")) {
		// hide Level buttons when we don't see a cconsole.log file
		parseCPF();
	}
	lines = html.trim().split(/[\n]/);
	filterLines=lines;
	
}



// function copied from WRC+
// this functions parses the file as cconsole.log (colors,etc...)
function parseCconsole() {
	var isCconsole = false;
	var spaceCounter = 0;
	var divCounter = 0;
	var prefix = "";
	
	
	// MSM: move lines to global variable to speed filterConsole
	// var lines = html.trim().split(/[\n]/);
	lines = html.trim().split(/[\n]/);
	for(var ii = 1; ii < lines.length - 1; ii++) {
		var line = lines[ii];

		//Cconsole: if it is cconsole.log line
		if(line.match(/\d{2}\/\d{2}\/\d{2}-\d{2}:\d{2}:\d{2}:\d{3}\s\(\w+\)\s\d/)) {
			//handle the case of back to back cconsole entries (end cconsole)
			prefix = ""
			if(isCconsole && divCounter > 0) {
				//end last; start new cconsole
				prefix = "</div>";
				divCounter--;
			}
			
			//get the parts
			var parts = line.trim().split(/\s/g); 
			
			//create the html for the components
			//MSM: add line number to be able to scroll
			var date = '<span name="line" id="line'+ii+'" style="color: blue;"> ' + parts[0] + " </span>";
			var pid = '<span style="color: #999;">' + parts[1] + "</span>";
			var severity = parts[2]; 
			
			//get the rest of the message
			var message = line.split("" + parts[1] + " " + severity + " ")[1]; 
			
			//set the right color for the severity
			var color = "#333";
			if(severity === 0) {
				//nothing
			}
			else if(severity == 1) {
				color = "#337ab7"; //Info blue
			}
			else if(severity == 2) {
				color = "#d58512"; //orange
			}
			else if(severity >= 3) {
				color = "#ac2925"; //red
			}
			severity = '<span style="color: ' + color + ';">' + severity + "</span>";
			
			//build the new line
			line = prefix + "<div style='margin: 0 0 0 10px; padding: 0 0 5px 10px; border-left: 3px solid " + color + "; color: " + color +"'>" + date + " " + pid  + " " +  severity + " " + message
			
			//start new cconsole
			isCconsole = true;
			spaceCounter = 0; 
			divCounter++;
		}
							
		//Cconsole: track the number of empty lines
		if(line.trim() === "") {
			spaceCounter++; 
		}
		
		//Cconsole: Case: Empty lines after cconsole.log (end cconsole)
		if(spaceCounter > 0 && isCconsole && divCounter > 0) {					
			//end cconsole
			line = "</div>" + line;
			isCconsole = false;
			spaceCounter = 0;
			divCounter--;
		}
		
		//comments, but ignore urls
		var commentIndex = line.indexOf("//");
		if(commentIndex > -1 && (commentIndex === 0 || line.indexOf("://") != commentIndex -1)) {
			line = line.replace("//", "<span style='color: #009900;'>//") + "</span>";
		}
		
		//forward marks: > text text text 
		var forwardIndex = line.indexOf("&gt;");
		if(forwardIndex === 0) {
			line = line.replace("&gt;", "<span style='color: #666; border-left: 3px solid #666; margin-left: 10px; padding-left: 10px'>&gt;") + "</span>";
		}
		//save the modified line in the array
		lines[ii] = line;
	}
	
	html = lines.join("\n");
	
	//if there is somehow still an open <div>, close it at the end of the block
	if(divCounter > 0) {
		html = html + "</div>"
	}
	
	// MSM
	// lines and filtered lines are the same after loading
	filterLines=lines;
	
}

// COPIED FROM WRC+ Thanks!

function parseSYSLOG(){
	// modify regex to add - syslog error numbers
	html = html.replace(/-*\d+\s+\d+\s+\d+\/\d+\/\d+\s+\d+:\d+:\d+(?:AM|PM)\s+\d+\s+\d+/g, function(m) {
		if(m.length > 1) {
			//try to get the version from the $ZV
			// MSM: changed variables to load the ZV from the page
			var version = "latest";
				if(ZV != "") {
				var versionMatch = ZV.match(/\d{4}\.\d\.\d/);
				if(versionMatch != null && versionMatch.length > 0) {
					version = versionMatch[0];
				}
			}
			
			//split the SYSLOG string into parts by whitespace
			var parts = m.split(/\s+/g);
			
			//check for the right number of parts
			if(parts.length >= 6) {
				var error= parts[0];
				var mod = parts[4];
				var line = parts[5];
				
				if (ZV.includes("Windows")){
					errText=windowsDict[error];
				}else{
					errText=linuxDict[error];
				}
				var errorHtml="<a href='#' style='color: green' title='"+errText+"'>"+error+"</a>  ";
				var regexError=new RegExp(error+"\\s+", "g");

				var regexError=new RegExp(error+"\\s+", "g");
				mtemp=m.replace(regexError, function(inner) {
					return errorHtml;
				});
				
				
				//build the SYSLOG lookup URL
				var href = "https://wrcplus.iscinternal.com/tools/ModLine.csp?mod="+mod+"&line="+line+"&version="+version;						
				var regex = new RegExp(mod+"\\s+"+line, "g");
				return mtemp.replace(regex, function(inner) {
					return '<a href="' + href + '" style="color: orange ' 
					+  '" target="_blank" title="SYSLOG Module Lookup">' 
					+ inner + '</a>';
				});
			}
		}
		return m;
	});

}



// functions copied from SMP
// Not used fromnow

function startSearch()
{
	var searchText = "journal";
	if (searchText == "") {
		alert('Please enter the string you want to search.');
		getFocus();
	} else {
		var textColor = "red";
		var bgColor = "yellow";
	    var highlightStartTag = "<font style='color:" + textColor + "; background-color:" + bgColor + ";'>";
	    var highlightEndTag = "</font>";
		var treatAsPhrase = true //document.getElementById("treatAsPhrase").checked;
		highlightSearchTerms(searchText, treatAsPhrase, true, highlightStartTag, highlightEndTag);
	}
}
	/*
 * This is sort of a wrapper function to the doHighlight function.
 * It takes the searchText that you pass, optionally splits it into
 * separate words, and transforms the text on the current web page.
 * Only the "searchText" parameter is required; all other parameters
 * are optional and can be omitted.
 */
function highlightSearchTerms(searchText, treatAsPhrase, warnOnFailure, highlightStartTag, highlightEndTag)
{
  // if the treatAsPhrase parameter is true, then we should search for 
  // the entire phrase that was entered; otherwise, we will split the
  // search string so that each word is searched for and highlighted
  // individually
  if (treatAsPhrase) {
    searchArray = [searchText];
  } else {
    searchArray = searchText.split(" ");
  }
  
  var bodyText = html;
  for (var i = 0; i != searchArray.length; i++) {
    bodyText = doHighlight(bodyText, searchArray[i], highlightStartTag, highlightEndTag);
  }
 
  
  //document.body.innerHTML = bodyText;
  //$("#console").fadeOut(500, function() { $(this).html(html).fadeIn(500);});
  $("#console").html(bodyText);
  
  return true;
 
}
function doHighlight(bodyText, searchTerm, highlightStartTag, highlightEndTag) 
{
  // the highlightStartTag and highlightEndTag parameters are optional
  if ((!highlightStartTag) || (!highlightEndTag)) {
    highlightStartTag = "<font style='color:blue; background-color:yellow;'>";
    highlightEndTag = "</font>";
  }
 
  // find all occurences of the search term in the given text,
  // and add some "highlight" tags to them (we're not using a
  // regular expression search, because we want to filter out
  // matches that occur within HTML tags and script blocks, so
  // we have to do a little extra validation)
  var newText = "";
  var i = -1;
  var lcSearchTerm = searchTerm.toLowerCase();
  var lcBodyText = bodyText.toLowerCase();
 
  while (bodyText.length > 0) {
    i = lcBodyText.indexOf(lcSearchTerm, i+1);
    if (i < 0) {
      newText += bodyText;
      bodyText = "";
    } else {
      // skip anything inside an HTML tag
      if (bodyText.lastIndexOf(">", i) >= bodyText.lastIndexOf("<", i)) {
        // skip anything inside a <script> block
        if (lcBodyText.lastIndexOf("/script>", i) >= lcBodyText.lastIndexOf("<script", i)) {
          newText += bodyText.substring(0, i) + highlightStartTag + bodyText.substr(i, searchTerm.length) + highlightEndTag;
          bodyText = bodyText.substr(i + searchTerm.length);
          lcBodyText = bodyText.toLowerCase();
          i = -1;
        }
      }
    }
  }
 
  return newText;
}

/// Funcitons to scroll 

function scrollEndOfPage(){
	//$("#iframeConsole").contents().scrollTop($("#iframeConsole").contents().height());
	$("#iframeConsole").contents().find('body').animate({scrollTop:$("#iframeConsole").contents().height()}, '500', 'swing');
	
}
function scrollTopOfPage(){
	//$("#iframeConsole").contents().scrollTop(0);
	$("#iframeConsole").contents().find('body').animate({scrollTop:0}, '5005', 'swing');
}

function enableLines(){
	$("span[name='line']",$("#iframeConsole").contents()).click(function() {
		var toThisBefore=$("#"+this.id,$("#iframeConsole").contents()).offset().top;
		var toThisBeforeScroll=$("#iframeConsole").contents().scrollTop();
		var toThisVariation=toThisBefore-toThisBeforeScroll;
		
		loadFilterWithLevel(0);// clear filter to show all lines
		$("#"+this.id,$("#iframeConsole").contents()).css("background-color", "yellow");
		
		var toThis=$("#"+this.id,$("#iframeConsole").contents()).offset().top;
		
		//$("#iframeConsole").contents().find('body').animate({scrollTop:toThis-toThisVariation}, '500', 'swing');
		$("#iframeConsole").contents().scrollTop(toThis-toThisVariation);
		});
	$("span[name='line']",$("#iframeConsole").contents()).hover(
		function() {
			$( this ).css("background-color", "yellow");
		}, function() {
			$( this ).css("background-color", "#f5f5f5");
		}
		);
}	



//------------------------------------------------------------------------------------------------------------
// METHOD: build the CPF regular expression as a series of ORs
//------------------------------------------------------------------------------------------------------------
//Create CPF Regex
this.CPFArray = {'AgentAddress': 'RCPF_MirrorAgentAddress','AllowRowIDUpdate': 'RCPF_AllowRowIDUpdate','AlternateDirectory': 'RCPF_AlternateDirectory','AsyncDisconnectErr': 'RCPF_AsyncDisconnectError','AsynchError': 'RCPF_AsynchError','AsyncMemberGUID': 'RCPF_AsyncMemberGUID','AsyncMemberType': 'RCPF_AsyncMemberType','BackupsBeforePurge': 'RCPF_BackupsBeforePurge','bbsiz': 'RCPF_bbsiz','BreakMode': 'RCPF_BreakMode','CallinHalt': 'RCPF_CallinHalt','CallinStart': 'RCPF_CallinStart','ClientReconnectDuration': 'RCPF_ClientReconnectDuration','ClientReconnectInterval': 'RCPF_ClientReconnectInterval','CliSysName': 'RCPF_CliSysName','CollectResourceStats': 'RCPF_CollectResourceStats','Comment': 'RCPF_Comment','CommIPAddress': 'RCPF_CommIPAddress','COMn': 'RCPF_Comn','CurrentDirectory': 'RCPF_CurrentDirectory','DaysBeforePurge': 'RCPF_DaysBeforePurge','DBMSSecurity': 'RCPF_DBMSSecurity','DBSizesAllowed': 'RCPF_DBSizesAllowed','DDLNo201': 'RCPF_No201','DDLNo30': 'RCPF_No30','DDLNo307': 'RCPF_No307','DDLNo311': 'RCPF_No311','DDLNo315': 'RCPF_No315','DDLNo324': 'RCPF_No324','DDLNo333': 'RCPF_No333','DefaultPort': 'RCPF_DefaultPort','DefaultPortBindAddress': 'RCPF_DefaultPortBindAddress','DefaultSchema': 'RCPF_DefaultSchema','DelimitedIds': 'RCPF_DelimitedIds','DeviceSubTypes': 'RCPF_DeviceSubTypes_n','DisconnectErr': 'RCPF_DisconnectErr','DNSLookup': 'RCPF_DNSLookup','DropDelete': 'RCPF_DropDelete','Dumpstyle': 'RCPF_Dumpstyle','ECPServers': 'RCPF_ECPServers_n','ECPSync': 'RCPF_ECPSync','EnableLongStrings': 'RCPF_EnableLongStrings','EnsembleAutoStart': 'RCPF_EnsembleAutoStart','errlog': 'RCPF_errlog','ErrorPurge': 'RCPF_ErrorPurge','ExtrinsicFunctions': 'RCPF_ExtrinsicFunctions','FastDistinct': 'RCPF_FastDistinct','FileMode': 'RCPF_FileMode','FileSizeLimit': 'RCPF_FileSizeLimit','FreezeOnError': 'RCPF_FreezeOnError','GlobalKillEnabled': 'RCPF_GlobalKillEnabled','gmheap': 'RCPF_gmheap','IdKey': 'RCPF_IdKey','IdTrxFrom': 'RCPF_IdTrxFrom','IdTrxTo': 'RCPF_IdTrxTo','IEEEError': 'RCPF_IEEEError','ijcbuff': 'RCPF_ijcbuff','ijcnum': 'RCPF_ijcnum','IPv6': 'RCPF_IPv6','JavaClassPath': 'RCPF_JavaClassPath','JavaHome': 'RCPF_JavaHome','JDBCGatewayAddress': 'RCPF_JDBCGatewayAddress','JDBCGatewayLog': 'RCPF_JDBCGatewayLog','JDBCGatewayPort': 'RCPF_JDBCGatewayPort','JobHalt': 'RCPF_JobHalt','JobServers': 'RCPF_JobServers','JobStart': 'RCPF_JobStart','JoinCluster': 'RCPF_JoinCluster','JoinMirror': 'RCPF_JoinMirror','JournalcspSession': 'RCPF_JournalcspSession','JournalFilePrefix': 'RCPF_JournalFilePrefix','LibPath': 'RCPF_libpath','LicenseServers': 'RCPF_LicenseServers_n','LineRecall': 'RCPF_LineRecall','locksiz': 'RCPF_locksiz','LockThreshold': 'RCPF_LockThreshold','LockTimeout': 'RCPF_LockTimeout','LogRollback': 'RCPF_LogRollback','MagTape': 'RCPF_Mnemonic_MT','MagTapes': 'RCPF_MagTapes_n','MapMirrors': 'RCPF_MapMirrors_n','MapShadow.Name': 'RCPF_MapShow.Name','MaxCacheTempSizeAtStart': 'RCPF_MaxCacheTempSizeAtStart','MaxConsoleLogSize': 'RCPF_MaxConsoleLogSize','MaxServerConn': 'RCPF_MaxServerConn','MaxServers': 'RCPF_MaxServers','memlock': 'RCPF_memlock','Mnemonic_TTY': 'RCPF_Mnemonic_TTY','MVDefined': 'RCPF_MVDefined','netjob': 'RCPF_netjob','nlstab': 'RCPF_nlstab','NodeNameInPid': 'RCPF_NodeNameInPid','NullSubscripts': 'RCPF_NullSubscripts','ODBCVarcharMaxlen': 'RCPF_ODBCVarcharMaxlen','OldZU5': 'RCPF_OldZU5','OpenMode': 'RCPF_OpenMode','overview': 'RCPF_overview','Package': 'RCPF_Package','PatrolCollectionInterval': 'RCPF_PatrolCollectionInterval','PatrolDisplayMode': 'RCPF_PatrolDisplayMode','PatrolEnabled': 'RCPF_PatrolEnabled','PatrolTopProcesses': 'RCPF_PatrolTopProcesses','pijdir': 'RCPF_pijdir','PopError': 'RCPF_PopError','ProcessHalt': 'RCPF_ProcessHalt','ProcessStart': 'RCPF_ProcessStart','QueryProcedures': 'RCPF_QueryProcedures','ReferentialChecks': 'RCPF_ReferentialChecks','RefInKind': 'RCPF_RefInKind','SaveMAC': 'RCPF_SaveMAC','ScientificNotation': 'RCPF_ScientificNotation','ServerTroubleDuration': 'RCPF_ServerTroubleDuration','SetZEOF': 'RCPF_SetZEOF','ShutDownLogErrors': 'RCPF_ShutDownLogErrors','ShutdownTimeout': 'RCPF_ShutdownTimeout','SNMPEnabled': 'RCPF_SNMPEnabled','SQLOnlyCompile': 'RCPF_SQLOnlyCompile','StopID': 'RCPF_StopID','SwitchOSdir': 'RCPF_SwitchOSdir','SynchCommit': 'RCPF_SynchCommit','SystemHalt': 'RCPF_SystemHalt','SystemName': 'RCPF_MirrorSystemName','SystemStart': 'RCPF_SystemStart','TCPKeepAlive': 'RCPF_TCPKeepAliveInterval','TelnetNUL': 'RCPF_TelnetNUL','TempDirectory': 'RCPF_TempDirectory','TerminalPrompt': 'RCPF_TerminalPrompt','TimePrecision': 'RCPF_TimePrecision','TODATEDefaultFormat': 'RCPF_TODATEDefaultFormat','TruncateOverflow': 'RCPF_TruncateOverflow','udevtabsiz': 'RCPF_udevtabsiz','UseNagleAlgorithm': 'RCPF_UseNagleAlgorithm','useresidentmem': 'RCPF_useresidentmem','vectors': 'RCPF_vectors','ViewPastData': 'RCPF_ViewPastData','VirtualAddressInterface': 'RCPF_VirtualAddressInterface','WebServer': 'RCPF_WebServer','WebServerName': 'RCPF_WebServerName','WebServerPort': 'RCPF_WebServerPort','WebServerURLPrefix': 'RCPF_WebServerURLPrefix','wijdir': 'RCPF_wijdir','WMIEnabled': 'RCPF_WMIEnabled','ZaMode': 'RCPF_ZaMode','ZDateNull': 'RCPF_ZDateNull','zfheap': 'RCPF_zfheap','ZSTU': 'RCPF_zstu'};
this.CPFRegex = null;

this.CreateCPFRegex = function() {
	//counter
	var ii = 0;

	//build the regular expression
	var cpf = "(?:$|\s)?(";
	for(var key in this.CPFArray) {
		if(ii++ > 0) {
			cpf += "|"; 
		}
		cpf += key;
	}
	// MSM the regex could fail if there are "
	//cpf += ')(?:\b|\s)?(?=(?:[^"]|"[^"]*")*$)';
	cpf += ')(?:\b|\s)?(?=(?:[^"]|"[^"]*)*$)';

	
	//create the actual regex
	this.CPFRegex = new RegExp(cpf, "g");
	
	return this.CPFRegex;
};

this.CreateCPFRegex();


//------------------------------------------------------------------------------------------
//add links to CPF Reference
//------------------------------------------------------------------------------------------

function parseCPF(){
	var version="latest";
	html = html.replace(this.CPFRegex, function(m) {
		//replace all references to the CPF tag with a link to the documentation
		return '<a href="http://docs.intersystems.com/' + version + '/csp/docbook/DocBook.UI.Page.cls?KEY=' + this.CPFArray[m] + '" style="color:"green" target="_blank">' + m + '</a>';
	});
	
}
