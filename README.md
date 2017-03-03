# power-pButtons
## A tool to graph fast and nicely the pButtons and Buttons

To install:
  - download the installPackage.zip and unzip.
  - copy the pButtonsWeb folder to any place.
  - open a terminal and copy and paste the following text. 
(Of course if you don't want my path and namespace you can change it )

## Video
See the quickdemo.mp4 video to have an idea 



###Copy & Paste in terminal to SETUP: 

```
set path="/Users/msanchez/isc/pButtonsWeb/"
set namespace="USER"
w !,"Create the Web Applications",!
zn "%SYS"
Set PropertiesApi("DispatchClass")="pButtons.Server"
Set PropertiesApi("NameSpace")=namespace
do ##class(Security.Applications).Create("/api/pButtons",.PropertiesApi)
Set Properties("Path")=path
Set Properties("NameSpace")=namespace
Set Properties("MatchRoles")=":%Developer"
do ##class(Security.Applications).Create("/pButtons",.Properties)

zn namespace
Set ^PowerpButtons("UploadDirectory")=path_"uploaded/"
w !,"Import the class: "_path_"/classes.xml",!
do $SYSTEM.OBJ.Load(path_"classes.xml","ck")
```

###Notes: 
 In Linux/mac you may need to give permissions to the "uploaded" folder to be able to upload files. 
(just a simple chmod 777 to the folder will do the trick)

Any ideas are welcome!

###Bugs: 
 I developed it and tested mainly with safari. 
 There are some rendering bugs on chrome/firefox where you may need to zoom the graphs to be able to see it correctly.  
