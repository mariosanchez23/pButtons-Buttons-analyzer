csession latest -UUSER "##class(%SYSTEM.OBJ).ExportPackage(\"pButtons\",\"/tmp/classes.xml\")"

cd /Users/msanchez/isc/Atelier/workspace/Power\ pButtons/
mkdir installPackage
rm installPackage.zip
mv /tmp/classes.xml /Users/msanchez/isc/Atelier/workspace/Power\ pButtons/installPackage/classes.xml
cp -R CSP/pButtons/ installPackage/pButtons
cp install.txt installPackage/install.txt
zip -r -X installPackage.zip installPackage/
rm -R installPackage/
