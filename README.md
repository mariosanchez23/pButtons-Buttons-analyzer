# power-pButtons
## A tool to graph fast and nicely the pButtons and Buttons

###Installation steps 

To install:
- download the installPackage.zip and unzip.
- copy the pButtons folder to any place: <yourPath>
- make sure that the folder <yourPath>/uploaded has write permissions for cacheusr
- Open terminal, import the classes and execute:

```
do $SYSTEM.OBJ.Load(<path/classes.xml>,"ck")
do ##class(pButtons.Utilities).Setup(<yourPath>)
```

Example: 

```
do $SYSTEM.OBJ.Load("tmp/classes.xml","ck")
do ##class(pButtons.Utilities).Setup("/Users/msanchez/isc/pButtons/")
```

## Video
See the quickdemo.mp4 video to have an idea 


###Notes: 
 In Linux/mac you may need to give permissions to the "uploaded" folder to be able to upload files. 
(just a simple chmod 777 to the folder will do the trick)

Any ideas are welcome!

###Bugs: 
 I developed it and tested mainly with safari. 
 
