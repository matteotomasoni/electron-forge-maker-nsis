;NSIS Modern User Interface
;Header Bitmap Example Script
;Written by Joost Verburg
;Documentation: https://nsis.sourceforge.io/Docs/Modern%20UI/Readme.html

  !define MUI_PRODUCT "%%NAME%%"
  !define MUI_FILE "%%FILE%%"
  !define MUI_VERSION "%%VERSION%%"
  !define MUI_AUTHOR "%%AUTHOR%%"
  !define MUI_IMAGE "%%IMAGE%%"
  !define MUI_ICON "%%ICON%%"
  CRCCheck On

  SetCompressor /SOLID /FINAL lzma

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"
;--------------------------------
;General

  ;Name and file
  Name "${MUI_PRODUCT}"
  OutFile "${MUI_FILE}"

  ;Default installation folder
  InstallDir "$PROGRAMFILES\${MUI_AUTHOR}\${MUI_PRODUCT}"
  
  ;Get installation folder from registry if available
  InstallDirRegKey HKCU "Software\${MUI_AUTHOR}\${MUI_PRODUCT}" "InstallDir"

;--------------------------------
;Interface Configuration

  !define MUI_HEADERIMAGE
  !define MUI_HEADERIMAGE_RIGHT
  ;!define MUI_HEADERIMAGE_BITMAP "${MUI_IMAGE}" ; optional
  !define MUI_ABORTWARNING

;--------------------------------
;Pages

  !insertmacro MUI_PAGE_WELCOME
  ;!insertmacro MUI_PAGE_LICENSE "${NSISDIR}\Docs\Modern UI\License.txt"
  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  ;!insertmacro MUI_PAGE_FINISH
  
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  
;--------------------------------
;Languages
 
  !insertmacro MUI_LANGUAGE "English"
  !insertmacro MUI_LANGUAGE "Italian"
  ;TODO: Aggiungere tutte le lingue supportate dall'app

;--------------------------------
;Installer Sections

  InstType "${MUI_PRODUCT}"

Section "${MUI_PRODUCT}"
  SectionIn 1
  
  ;program folder
  SetOutPath "$INSTDIR"
  File /r "%%FILEDIR%%\*.*"
  
  ;shortcuts
  SetOutPath "$INSTDIR" ;va a finire nel campo "Da:" del link
  CreateDirectory "$SMPROGRAMS\${MUI_AUTHOR}"
  CreateDirectory "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}\${MUI_PRODUCT}.lnk" "$INSTDIR\${MUI_PRODUCT}.exe"
  CreateShortCut "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}\Uninstall ${MUI_PRODUCT}.lnk" "$INSTDIR\Uninstall.exe"  

  ;Store installation folder
  WriteRegStr HKCU "Software\${MUI_AUTHOR}\${MUI_PRODUCT}" "InstallDir" $INSTDIR

  ;Create uninstaller
  WriteUninstaller "$INSTDIR\Uninstall.exe"

  ; write uninstall strings
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "DisplayName" "${MUI_AUTHOR} - ${MUI_PRODUCT} (remove only)"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "UninstallString" '"$INSTDIR\Uninstall.exe"'

SectionEnd

Section "Create desktop shortcut"
  SectionIn 1
  SetOutPath "$INSTDIR" ;va a finire nel campo "Da:" del link
  CreateShortCut "$DESKTOP\${MUI_PRODUCT}.lnk" "$INSTDIR\${MUI_PRODUCT}.exe"  
SectionEnd



;--------------------------------
;Descriptions

  ;Language strings
  ;LangString DESC_SecDummy ${LANG_ENGLISH} "A test section."

  ;Assign language strings to sections
  ;!insertmacro MUI_FUNCTION_DESCRIPTION_BEGIN
  ;  !insertmacro MUI_DESCRIPTION_TEXT ${SecDummy} $(DESC_SecDummy)
  ;!insertmacro MUI_FUNCTION_DESCRIPTION_END
 
;--------------------------------
;Uninstaller Section

Section "Uninstall"

  ;program folder
  Delete "$INSTDIR\${MUI_PRODUCT}.exe"
  Delete "$INSTDIR\SglW32.dll"
  Delete "$INSTDIR\SettingsManager.exe"
  Delete "$INSTDIR\Machines\*.*"  
  RMDir  "$INSTDIR\Machines"
  Delete "$INSTDIR\Languages\*.*"  
  RMDir  "$INSTDIR\Languages"
  Delete "$INSTDIR\Palettes\*.*"  
  RMDir  "$INSTDIR\Palettes"
  Delete "$INSTDIR\Uninstall.exe"
  RMDir "$INSTDIR"

  ;shortcuts
  Delete "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}\${MUI_PRODUCT}.lnk"
  Delete "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}\Uninstall ${MUI_PRODUCT}.lnk"  
  RMDir  "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}"
  RMDir  "$SMPROGRAMS\${MUI_AUTHOR}"

  ;uninstaller
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}"

SectionEnd
