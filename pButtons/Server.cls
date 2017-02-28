Class pButtons.Server Extends %CSP.REST
{

XData UrlMap
{
<Routes>
	<Route Url="/directoryList/:directoryId" Method="GET" Call="getDirectoryList"/>
	<Route Url="/deleteFile/:directory/:filename" Method="GET" Call="doDeleteFile"/>
	<Route Url="/uploadFile/" Method="POST" Call="uploadFile"/>
		
</Routes>
}


/// This parameter controls the CSP session support. By default the CSP session will be
/// ended after each request in accordance with the spirit of REST. However this CAN be
/// overridden by the user. To use a session, it's necessary to manage the CSPSESSION cookie.
/// Browsers do this automatically but command line tools such as CURL require the setting of
/// options.
Parameter UseSession As Integer = 1;



ClassMethod getDirectoryList(directoryName) As %Status
{ 
	#dim ReturnStatus as %Status
	set ReturnStatus = $$$OK
	set baseDirectory= ^PowerpButtons("UploadDirectory")
	set directory=##class(%File).NormalizeDirectory(directoryName,baseDirectory)
	
	Set rset = ##class(%ResultSet).%New("%File:FileSet")
	 // Execute the query
	Set sc = rset.Execute(directory,"*.html;*.HTML;*.txt;*.")
	
	set jsonFiles = []
	While (rset.Next()) {
		set type=$PIECE(rset.GetDataByName("ItemName"),"_",1)
		set jsonFile = {"name":(rset.GetDataByName("ItemName")),"size":(rset.GetDataByName("Size")),"type":(type)}
		do jsonFiles.%Push(jsonFile)
	}    
	do rset.Close()
	
	write {"files":(jsonFiles)}.%ToJSON()
	
	
	quit ReturnStatus
}

ClassMethod doDeleteFile(directoryname,filename) As %Status
{
	#dim ReturnStatus as %Status
	set baseDirectory= ^PowerpButtons("UploadDirectory")
	set directory=##class(%File).NormalizeDirectory(directoryname,baseDirectory)
	set file=##class(%File).NormalizeFilename(filename,directory)
	set directoryMetrics=##class(%File).NormalizeDirectory(filename_".sections",directory)
	
	set sc1=##class(%File).Delete(file)
	set sc2=##class(%File).RemoveDirectoryTree(directoryMetrics)
	
	// check if there is any file to delete completely the directory
    // It's a good way to clean ;-)
    
    Set rset = ##class(%ResultSet).%New("%File:FileSet")
	Set sc = rset.Execute(directory)
	if (rset.Next() = 0) { // There is nothing so clean whole directory
		set sc3=##class(%File).RemoveDirectoryTree(directory)
	}    
	do rset.Close()
	
	quit ReturnStatus
}

// Upload files methods
//
ClassMethod uploadFile() As %Status 
{
	set directory=$G(%request.Data("directory",1))
	set output = {"error":"Empty File"}
	
	if ($data(%request.MimeData("file",1)))
	{
		set file=%request.MimeData("file",1)
		if (directory'="")
		{
			s phisycalDirectory = ..CheckAndCreateUniqueDirectory(.directory)
			s fileName=$ZCONVERT(file.FileName,"U")
			set uploadedFile = ##class(%File).NormalizeFilename(fileName,phisycalDirectory)
			set f=##class(%Stream.FileBinary).%New()
			do f.LinkToFile(uploadedFile)
			s sc=f.CopyFromAndSave(file)
			
			set sc=##class(pButtons.Utilities).unzipFile(.uploadedFile)
			set sc=##class(pButtons.Utilities).checkFileType(.uploadedFile)
			set previewHTML=##class(pButtons.Utilities).parseHTML(uploadedFile)
			
			set finalFileName=##class(%File).GetFilename(uploadedFile)
			// return output file and properties
			set output = {"name":(finalFileName),"previewPage":(previewHTML_"?file=uploaded/"_directory_"/"_finalFileName)}
			
		} else{
			set output = {"error":"Empty directory"}
		}
	}
	
	write output.%ToJSON()
	Quit $$$OK
}

ClassMethod CheckAndCreateUniqueDirectory(ByRef directory As %String) as %String
{
	set originalDirectory = directory
	s i=1
	set baseDirectory= ^PowerpButtons("UploadDirectory")
	
	while ('##class(%File).CreateNewDir(baseDirectory,directory) || i>100){
		set directory = originalDirectory_"("_i_")" ; if the directory exist add some number
		s i=i+1
	}
	return ##class(%File).NormalizeDirectory(directory,baseDirectory)
}

// test

}
