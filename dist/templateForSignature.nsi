!ifdef INNER
  !echo "Inner invocation"                  ; just to see what's going on
  OutFile "${TMP_INSTALLER_FILE}"           ; not really important where this is
  SetCompress off                           ; for speed
!else
  !echo "Outer invocation"
  OutFile "${MUI_FILE}"
  SetCompressor /SOLID /FINAL lzma
!endif


Function .onInit
!ifdef INNER
 
  ; If INNER is defined, then we aren't supposed to do anything except write out
  ; the uninstaller. This is better than processing a command line option as it means
  ; this entire code path is not present in the final (real) installer.
  SetSilent silent
  WriteUninstaller "${TMP_UNINSTALLER_FILE}"
  Quit  ; just bail out quickly when running the "inner" installer
!endif

; ...[the rest of your normal .onInit]...
FunctionEnd


;NSIS Modern User Interface
;Header Bitmap Example Script
;Written by Joost Verburg
;Documentation: https://nsis.sourceforge.io/Docs/Modern%20UI/Readme.html

  CRCCheck On

;--------------------------------
;Include Modern UI

  !include "MUI2.nsh"
;--------------------------------
;General

  ;Require admin rights on NT6+ (When UAC is turned on)
  RequestExecutionLevel ${EXECUTION_LEVEL}

  ;Name and file
  Name "${MUI_PRODUCT}"

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
  
!ifdef INNER  
  !insertmacro MUI_UNPAGE_CONFIRM
  !insertmacro MUI_UNPAGE_INSTFILES
!endif
  
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
  CreateDirectory "$SMPROGRAMS\${MUI_AUTHOR}"
  CreateDirectory "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}"
  CreateShortCut "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}\${MUI_PRODUCT}.lnk" "$INSTDIR\${MUI_PRODUCT}.exe"
  CreateShortCut "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}\Uninstall ${MUI_PRODUCT}.lnk" "$INSTDIR\Uninstall.exe"  

  ;Store installation folder
  WriteRegStr HKCU "Software\${MUI_AUTHOR}\${MUI_PRODUCT}" "InstallDir" $INSTDIR

  ;Create uninstaller
  !ifndef INNER
    SetOutPath $INSTDIR
    ; this packages the signed uninstaller
    File "${TMP_UNINSTALLER_FILE}"
  !endif

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
;Uninstaller Section

SilentUnInstall silent

!ifdef INNER
Section "Uninstall"
 
  ; your normal uninstaller section or sections (they're not needed in the "outer"
  ; installer and will just cause warnings because there is no WriteUninstaller command)

  ;program folder
  RMDir /r "$INSTDIR"

  ;shortcuts
  RMDir /r "$SMPROGRAMS\${MUI_AUTHOR}\${MUI_PRODUCT}"
  RMDir "$SMPROGRAMS\${MUI_AUTHOR}"
  Delete "$DESKTOP\${MUI_PRODUCT}.lnk"

  ;uninstaller
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\${MUI_PRODUCT}"
 
SectionEnd
!endif
