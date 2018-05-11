@ECHO OFF
	IF "%2"=="" GOTO Explain
	del /S /Q %2\*.html
	java -jar jsrun.jar app\run.js %1 -t=templates\jsdoc -d=%2 -x=ds -r=10 -a
	GOTO Exit

:Explain
	ECHO.
	ECHO.
	ECHO 	The script needs to be executed in the jsdoc-toolkit directory - e.g. 
	ECHO 	  e.g. "c:\yourproject\cartridges\build_cs\cartridge\build\lib\jsdoc-toolkit"
	ECHO.
	ECHO 	Use the script as follows:
	ECHO 	  run.bat {sources directory} {documentation target directory}
	ECHO.
	ECHO 	Example: run.bat c:\myproject\catridges c:\myproject\jsdoc
	ECHO.
	ECHO.
	PAUSE
:Exit