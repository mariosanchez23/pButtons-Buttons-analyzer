# pButtons & Buttons parser (graphing nicely pButtons files)

## What is it? 
It is a parser for pButtons and Buttons files. PButtons&Buttons are html files that can be hard to open and work on a browser. 
PButtons usually require external graphing tools (like excel or mgsview). With this parser they will be graphed automatically. 

## Main Features
* Graph nicely pButtons data: mgstat, perfmon, vmstat and sard!
* Enhanced graphs with possibility to annotate, add text, shapes, lines. Download graphs and data.
* Upload and manage files easily (including drag&drop and several files at once)
* Display sections in tabs
* Filtering / search for logs
* cpf parse (including links to doc)
* SYSLOG parse, showing OS error description and linking to internal modules
* cconsole.log special filter and highligh of levels
* Allow download of individual sections in text files

## How it works
Load the page /pButtons/pButtonsLoader.html in the browser and type any small description. This description will be used as a directory for the files. A good advise is to use the WRC number.

Then upload pButtons or Buttons files. You can upload using drag&drop which is much easier. 

Press the View button to open the files and enjoy! ;-)

## How it is done
The tool is written using HTML, Javascript and Caché Objectscript. 

### Uploading & Directories 
 This managerment is done mainly in Caché. 
#### pbuttons.server and pbuttons.utilities (Rest API)
* Unzip (only OSX from now) 
* Split html in sections
* Do some minimal parse (example sard)

### Display
All the display and graph parse and display has been done with HTML,CCS and Javascript.
#### Logic:
    Simple (and sometimes obscure :-) JavaScript with JQuery
    Used some libraries (for select box and upload)
#### Style:
    CCS bootstrap 
#### Graphing: 
    Amchart library (it's super powerful!)

# Installation 

To install:
- download the installPackage.zip and unzip.
- copy the pButtons folder to any place: ```<yourPath>```
- make sure that the folder ```<yourPath>```/uploaded has write permissions for cacheusr
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


### Notes: 
 In Linux/mac you may need to give permissions to the "uploaded" folder to be able to upload files. 
(just a simple chmod 777 to the folder will do the trick)

Any ideas are welcome!

### Bugs: 
 Developed and tested mainly with safari, so I would expect more bugs on Chrome / Firefox.  
 
