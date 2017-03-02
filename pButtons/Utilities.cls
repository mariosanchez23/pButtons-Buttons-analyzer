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
		
		set listSections=listSections_","_section
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
		set directory=filename_".sard"
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
	do data.ReadLine()
	do data.ReadLine() // Jump one line
	set headerLine = data.ReadLine()	
	// loop through file searching for device Names and creating the empty files
	// It is better to loop twice to create the files first than checking for file creation every time
	s deviceName="",deviceList=""
	while ('data.AtEnd){	
		set sectionLine = data.ReadLine()
		// Example
		// 11:24:10     dev65-64      3,50      0,00    110,51     31,54      
		s deviceName=$PIECE($ZSTRIP(sectionLine,"=W")," ",2)
		if (deviceName'="DEV") {
			set fileName = ##class(%File).NormalizeFilename(deviceName_".txt",directory)
			set fileStream(deviceName) = ##class(%Stream.FileCharacter).%New()
			set fileStream(deviceName).Filename=fileName
			do fileStream(deviceName).WriteLine(headerLine)
			do fileStream(deviceName).WriteLine(sectionLine)
			set deviceList=deviceList_","_deviceName
		
		} else { 
			// Save a device.txt file with a list of devices 
			set fileName = ##class(%File).NormalizeFilename("devices.txt",directory)
			set fileStreamDevices = ##class(%Stream.FileCharacter).%New()
			set fileStreamDevices.Filename=fileName
			do fileStreamDevices.WriteLine(deviceList)
			do fileStreamDevices.%Save()
			quit
		}
	}
	
	// loop to save data. 
	while ('data.AtEnd){	
		set sectionLine = data.ReadLine()
		s deviceName=$PIECE($ZSTRIP(sectionLine,"=W")," ",2)
		if (deviceName'="DEV") {
			do fileStream(deviceName).WriteLine(sectionLine)
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



Storage Default
{
<StreamLocation>^pButtons.UtilitiesS</StreamLocation>
<Type>%Library.CacheSerialState</Type>
}

}