;NSIS Modern User Interface
;Header Bitmap Example Script
;Written by Joost Verburg
;Documentation: https://nsis.sourceforge.io/Docs/Modern%20UI/Readme.html

  CRCCheck On

  SetCompressor /SOLID /FINAL lzma

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"
;--------------------------------
;General

  ;Require admin rights on NT6+ (When UAC is turned on)
  RequestExecutionLevel ${EXECUTION_LEVEL}

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

  !define MUI_FINISHPAGE_RUN "${MUI_PRODUCT}.exe"

;--------------------------------
;Pages

  !insertmacro MUI_PAGE_WELCOME
  ;!insertmacro MUI_PAGE_LICENSE "${NSISDIR}\Docs\Modern UI\License.txt"
  !insertmacro MUI_PAGE_COMPONENTS
  !insertmacro MUI_PAGE_DIRECTORY
  !insertmacro MUI_PAGE_INSTFILES
  !insertmacro MUI_PAGE_FINISH
  
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
  
;--------------------------------
;Languages
 
  !insertmacro MUI_LANGUAGE "English" ; The first language is the default language
  !insertmacro MUI_LANGUAGE "French"
  !insertmacro MUI_LANGUAGE "German"
  !insertmacro MUI_LANGUAGE "Spanish"
  !insertmacro MUI_LANGUAGE "Italian"
  !insertmacro MUI_LANGUAGE "Japanese"

;--------------------------------
;Installer Sections

  InstType "${MUI_PRODUCT}"

Section "${MUI_PRODUCT}"
  SectionIn 1
  SectionIn RO ;Used to grey-out the section
  
  ;program folder
  SetOutPath "$INSTDIR"
  RMDir /r "$INSTDIR"
  CreateDirectory "$INSTDIR"
  File /r /x "*.nsi" ".\*.*"
  
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
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "DisplayName" "${MUI_AUTHOR} - ${MUI_PRODUCT}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "DisplayIcon" "$INSTDIR\${MUI_PRODUCT}.exe"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "Publisher" "${MUI_AUTHOR}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "ProductVersion" "${MUI_VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "DisplayVersion" "${MUI_VERSION}"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "InstallLocation" '$INSTDIR'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "UninstallString" '"$INSTDIR\Uninstall.exe"'
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "QuietUninstallString" '"$INSTDIR\Uninstall.exe" /S'
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "NoModify" 1
  WriteRegDWORD HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}" "NoRepair" 1

SectionEnd

; unselected because it is /o
Section /o "Create desktop shortcut"
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
  RMDir /r "$INSTDIR"

  ;shortcuts
  RMDir /r "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}"
  RMDir "$SMPROGRAMS\${MUI_AUTHOR}"
  Delete "$DESKTOP\${MUI_PRODUCT}.lnk"

  ;uninstaller
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}"

SectionEnd
