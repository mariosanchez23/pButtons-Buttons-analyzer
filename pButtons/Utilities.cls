Class pButtons.Utilities extends  %RegisteredObject [ Abstract ]
{

// PArse the html and returns the preview HTML page to visualize
Classmethod parseHTML(pFile) as %String{
	set justFileName=##class(%File).GetFilename(pFile)
		
	set fileType=$PIECE(justFileName,"_",1)
	if (fileType="pButtons"){
		do ..parseHTMLpButtons(pFile)
		return "pButtons.html"
	}elseif (fileType="Buttons"){
		do ..parseHTMLButtons(pFile)
		return "pButtons.html"
	}
	return "console.html"
}

// Check the type of file to parse as pButtons or as Buttons
// and rename the file adding the type
Classmethod checkFileType(byREf pFile) as %Status{
	try {
		Set data=##class(%Stream.FileCharacter).%New()
		$$$THROWONERROR(tSC, data.LinkToFile(pFile))
		
		set justFileName=##class(%File).GetFilename(pFile)
		set justDirectory=##class(%File).GetDirectory(pFile)
		
		// Read first 
		do data.Rewind()
		set firstLines=data.Read(100)
		
		if ($FIND(firstLines,"Diagnostic Log")){
			set type = "Buttons_"
		}elseif ($FIND(firstLines,"Performance Data Report")) {
		 	set type =  "pButtons_"
		}
		else {
			// change .log files to txt to be able to parse correctly from iframes
			set type = "Other_"
			set justFileName=$ZSTRIP(justFileName,"*P")_".txt"
		}
		// This is needed to be able to rename the file in Windows. s
		kill data
		
		s finalName=##class(%File).NormalizeFilename(type_justFileName,justDirectory)
		set sc=##class(%File).Rename(pFile,finalName)
		set:sc=1 pFile=finalName
	
	} catch ex {
		set ret = ex.AsStatus()
		write !,"<ERROR> parseHTML: "_$system.Status.GetOneErrorText(ret)
	}
	quit $$$OK
}


//  ---------------------- parse pButtons functions  ----------------------
/// main parse function to parse pButtons
///
Classmethod parseHTMLpButtons(pFile) as %Status{
	set directory = pFile_".sections"
	set ret = $$$OK
	try {
		Set stream=##class(%Stream.FileCharacter).%New()
		$$$THROWONERROR(tSC, stream.LinkToFile(pFile))
		set sc=##class(%File).CreateDirectory(directory)
		if sc {
			do ..writepButtonsSectionsToFile(stream,directory)
		}else{
			write !,"ERROR:can't create directory "_directory_"\n"
		}
		
	} catch ex {
		set ret = ex.AsStatus()
		write !,"<ERROR> parseHTML: "_$system.Status.GetOneErrorText(ret)
	}
	quit ret
}

ClassMethod writepButtonsSectionsToFile(data As %Stream.FileCharacter,directory)
{
	set startSearch=1
	set listSections=""
	while ('data.AtEnd){
		set sectionPosition=data.FindAt(startSearch,"<div id=")
		quit:sectionPosition=-1 ; no more sections found
		
		set sc = data.MoveTo( sectionPosition )
		set sectionLine = data.ReadLine()
		set startSearch=sectionPosition+$L(sectionLine)
		
		// Parse section with format:
		//<div id="Configuration"></div>Configuration</font></b></p><pre>
		set section = $ZSTRIP($P($p(sectionLine,"id=",2),"></div>",1),"*P") 
		
		// open file to write section
		set fileName = ##class(%File).NormalizeFilename(section_".txt",directory)
		Set fileStream = ##class(%Stream.FileCharacter).%New()
		set fileStream.Filename=fileName
		// search end of section which always start with <pre> finish with </pre>
		set line = $P(sectionLine,"<pre>",2)
		//set line=data.ReadLine()
	
	
		// Improvement. Apply regex to remove html tags
		// set matcher=##class(%Regex.Matcher).%New("(<([^>]+)>)")
		//set matcher.Text=t
		//set t=matcher.ReplaceAll("") 
	
	
		// sections like SS and cstat are multisections
		// Improvement, parse specifically each section
		if (section="SS") || (section="cstatc1") || (section="cstatD"){
			set endSection="</pre><p"}
		else {
			set endSection="</pre>"
			}
		
		while ( '$FIND(line,endSection) || data.AtEnd ){
			do fileStream.WriteLine(line)
			set line = data.ReadLine()
			set startSearch=startSearch+$L(line)
		}
		do fileStream.%Save()
		
		// Parse sard data to get graphs
		if (section="sard") { 
			job ..parseSard(fileName)
		}
		
		set listSections=listSections_","_section_"#"_fileStream.SizeGet()
		// Write some output with progress
		//set procesed = $NORMALIZE(startSearch*100/data.Size,2)
		//set ^pButtonsUpload(fileName,listSections)="Section "_ section_" exported. Procesed: "_ procesed _"%"
	}
	
	// save the sections.txt file with a list of all the processed sections
	set fileName = ##class(%File).NormalizeFilename("sections.txt",directory)
	Set fileStream = ##class(%Stream.FileCharacter).%New()
	set fileStream.Filename=fileName
	do fileStream.WriteLine(listSections_",") //Added an empty line to parse easier 
	do fileStream.%Save()
	
	quit
}


//  ---------------------- parse sard functions  ----------------------
/// parse sard info into multiple files
ClassMethod parseSard(filename) 
{
	try {
		Set stream=##class(%Stream.FileCharacter).%New()
		$$$THROWONERROR(tSC, stream.LinkToFile(filename))
		set directory=$REPLACE(filename,".txt","")
		set sc=##class(%File).CreateDirectory(directory)
		
		if sc {
			do ..writeDevicesToFile(stream,directory)
		}else{
			write !,"ERROR:can't create directory "_directory_"\n"
		}
		
	} catch ex {
		set ret = ex.AsStatus()
		write !,"<ERROR> parseSard: "_$system.Status.GetOneErrorText(ret)
	}
	quit 
}

// Creates a file for every device in sard.
ClassMethod writeDevicesToFile(data As %Stream.FileCharacter,directory)
{
	// First lines like
	// Linux 2.6.32-131.0.15.el6.x86_64 (c0lx0009.sacyl.es) 	11/11/16 	_x86_64_	(24 CPU)
	// 11:24:00          DEV       tps  rd_sec/s  wr_sec/s  avgrq-sz  avgqu-sz     await     svctm     %util
	// 11:24:10     dev65-64      3,50      0,00    110,51     31,54      
	set sc = data.MoveTo(1)
	do data.ReadLine()  // jump empty line
	set dateCapture=$PIECE(data.ReadLine(),$C(9),2)  // Get the date from the first line
	set headerLine = data.ReadLine()	
	set headerLine = $REPLACE($ZSTRIP(headerLine,"=W")," ",",") // change spaces for ,
	set headerLine = "dateTime,"_$PIECE(headerLine,",",2,*)  // Add a valid name for time column 
	 
	// loop through file searching for device Names and creating the empty files
	// It is better to loop twice to create the files first than checking for file creation every time
	s deviceName="",deviceList=""
	while ('data.AtEnd){	
		set sectionLine = data.ReadLine()
		//change the decimal format to . instead of ,
		// change spaces for ,
		set sectionLine=$REPLACE($ZSTRIP($REPLACE(sectionLine,",","."),"=W")," ",",")
		set oldTime=$P(sectionLine,",",1)  // get time
		set sectionLine=dateCapture_sectionLine
			
		// Example
		// 11:24:10     dev65-64      3,50      0,00    110,51     31,54      
		s deviceName=$PIECE(sectionLine,",",2)
		if (deviceName'="DEV") {
			set fileName = ##class(%File).NormalizeFilename(deviceName_".txt",directory)
			set fileStream(deviceName) = ##class(%Stream.FileCharacter).%New()
			set fileStream(deviceName).Filename=fileName
			do fileStream(deviceName).WriteLine($REPLACE(headerLine,",",",("_deviceName_") "))
			do fileStream(deviceName).WriteLine(sectionLine)
			set deviceList=deviceList_","_deviceName
		
		} else { 
			// Save a device.txt file with a list of devices 
			set fileName = ##class(%File).NormalizeFilename("devices.txt",directory)
			set fileStreamDevices = ##class(%Stream.FileCharacter).%New()
			set fileStreamDevices.Filename=fileName
			do fileStreamDevices.WriteLine(deviceList_",")
			do fileStreamDevices.%Save()
			quit
		}
	}
	
	// loop to save data. 
	while ('data.AtEnd){	
		set sectionLine = data.ReadLine()
		s deviceName=$PIECE($ZSTRIP(sectionLine,"=W")," ",2)
		if (deviceName'="DEV") {
			//change the decimal format to . instead of ,
			// change spaces for ,
			set sectionLine=$REPLACE($ZSTRIP($REPLACE(sectionLine,",","."),"=W")," ",",")
			set newTime=$P(sectionLine,",",1)  // get time
			
			// if we have a day change, I need to increment dateCapture
			try {
				if ($ZTH(newTime)<$ZTH(oldTime)){
					set dateCapture=$ZD($ZDH(dateCapture,1)+1,1)_" "  //we need to add an extra space
				}
				set oldTime=newTime
			 
				// add date to graph easily
				set sectionLine=dateCapture_sectionLine
				do fileStream(deviceName).WriteLine(sectionLine)	
			 }catch{ 
			 	// do nothing, simply we can't parse the date and we don't want the line
			 }
		}
	}
	
	// Save files
	s dn=""
	for  {
     set dn=$ORDER(fileStream(dn)) 
     quit:dn=""
     do fileStream(dn).%Save()
    }
	
	
	quit
}

//  ---------------------- parse Buttons functions  ----------------------
/// main parse function to parse Buttons
///
Classmethod parseHTMLButtons(pFile) as %Status{
	
	set directory = pFile_".sections"
	set ret = $$$OK
	try {
		Set stream=##class(%Stream.FileCharacter).%New()
		$$$THROWONERROR(tSC, stream.LinkToFile(pFile))
		set sc=##class(%File).CreateDirectory(directory)
		if sc {
			do ..writeButtonsSectionsToFile(stream,directory)
		}else{
			write !,"ERROR:can't create directory "_directory_"\n"
		}
		
	} catch ex {
		set ret = ex.AsStatus()
		write !,"<ERROR> parseHTML: "_$system.Status.GetOneErrorText(ret)
	}
	quit ret
}

ClassMethod writeButtonsSectionsToFile(data As %Stream.FileCharacter,directory)
{
	set startSearch=1
	set listSections=""
	while ('data.AtEnd){
		// Sections like
		// <a name="general"></a>General</b></font>
		// <pre>
		// ..
		// </pre>

		set sectionPosition=data.FindAt(startSearch,"<a name=")
		quit:sectionPosition=-1 ; no more sections found
		
		set sc = data.MoveTo( sectionPosition )
		set sectionLine = data.ReadLine()
		set startSearch=sectionPosition+$L(sectionLine)
		
		// Parse section with format:
		//<a name="general"></a>General</b></font>
		set section = $P(sectionLine,"""",2) 
		
		//Sections like cstat are different :-( so I can't use " to split
		//<a name=cstat1></a>cstat Snapshot # 1</font></b>
		if (section="") {
			set section = $P($P(sectionLine,"=",2),">",1) 
		}
		
		// open file to write section
		set fileName = ##class(%File).NormalizeFilename(section_".txt",directory)
		Set fileStream = ##class(%Stream.FileCharacter).%New()
		set fileStream.Filename=fileName
		// <pre>
		// Read lines to start inside the <pre>
		//BREAK
		set prePosition=data.FindAt(startSearch,"<pre>")
		set sc = data.MoveTo( prePosition + $L("<pre>"))
		set line = data.ReadLine()
		set startSearch=sectionPosition+$L(line)
		
		while ( '$FIND(line,"</pre>") || data.AtEnd ){
			do fileStream.WriteLine(line)
			set line = data.ReadLine()
			set startSearch=startSearch+$L(line)
		}
		do fileStream.%Save()
		
		set listSections=listSections_","_section
		//set procesed = $NORMALIZE(startSearch*100/data.Size,2)
		//write !, "Section "_ section_" exported. Procesed: "_ procesed _"%"
		
	}
	
	// save the sections.txt file with a list of all the processed sections
	set fileName = ##class(%File).NormalizeFilename("sections.txt",directory)
	Set fileStream = ##class(%Stream.FileCharacter).%New()
	set fileStream.Filename=fileName
	do fileStream.WriteLine(listSections_",") //Added an empty line to parse easier 
	do fileStream.%Save()
	
	quit
}




//  ---------------------- generic functions  ----------------------

ClassMethod unzipFile(byRef pFile) as %Status
{
	s noZipFile=$P(pFile,".ZIP",1) // Get the part without the .ZIP extention
	if ($LENGTH(noZipFile)<$LENGTH(pFile)) { //This is a zip file
		set cmd="unzip -o "_pFile_" -d "_##class(%File).GetDirectory(pFile)
		set sc=$ZF(-1,cmd)
		s pFile = noZipFile
		quit 'sc // If ZF(-1) is ok it returns 0 (not 1)
	}
	quit $$$OK
}

// install and prepare the web applications
ClassMethod Setup(path)
{
	if ($G(path)=""){
		w !,"<You need to enter the path>",!
		w !,"To install:"
		w !," - download the installPackage.zip and unzip."
		w !," - copy the pButtons folder to any place: <yourPath>"
		w !," - make sure that the folder <yourPath>/uploaded has write permissions for cacheusr"
		w !," - Run: "
		w !,"do ##class(pButtons.Utilities).Setup(<yourPath>)",!
		w !," Example: "
		w !,"do ##class(pButtons.Utilities).Setup(""/Users/msanchez/isc/pButtonsWeb/"")",!
		
		quit
	}
	
	w !,"Setting the uploaded path to "
	Set ^PowerpButtons("UploadDirectory")=path_"uploaded/"
	w !,^PowerpButtons("UploadDirectory")
	w !,"You can find all the files you upload there",!
	
	w !,"Setting the required Web Applications..."
	set namespace=$namespace
	new $Namespace
	set $Namespace = "%SYS"
	
	Set PropertiesApi("DispatchClass")="pButtons.Server"
	Set PropertiesApi("NameSpace")=namespace
	if (##class(Security.Applications).Exists("/api/pButtons")){
		w !,"Application /api/pButtons exists. Setting properties"
		do ##class(Security.Applications).Modify("/api/pButtons",.PropertiesApi)
	}else{
		w !,"Creating web application /api/pButtons"
		do ##class(Security.Applications).Create("/api/pButtons",.PropertiesApi)
	}
	
	Set Properties("Path")=path
	Set Properties("NameSpace")=namespace
	Set Properties("MatchRoles")=":%Developer"
		if (##class(Security.Applications).Exists("/pButtons")){
		w !,"Application /pButtons exists. Setting properties"
		do ##class(Security.Applications).Modify("/pButtons",.Properties)
	}else{
		w !,"Creating web application pButtons"
		do ##class(Security.Applications).Create("/pButtons",.Properties)
	}
	
	s Status=##Class(Config.Startup).Get(.Properties)
	s port=Properties("WebServerPort")
	s serverName=$ZU(54,0)
	w !,"Applications set. Now you can go to this url and enjoy: ",!
	w !," http://"_serverName_":"_port_"/pButtons/pButtonsLoader.html",!
	
	quit
}



Storage Default
{
<StreamLocation>^pButtons.UtilitiesS</StreamLocation>
<Type>%Library.CacheSerialState</Type>
}

}