!macro customInstall
  !if "$%SCHOOL_CLAUDE_INSTALLER_PATH%" == ""
    !error "Set SCHOOL_CLAUDE_INSTALLER_PATH to the private School Claude installer before building."
  !endif
  InitPluginsDir
  SetOutPath "$PLUGINSDIR"
  File /oname=School-Claude-Setup.exe "$%SCHOOL_CLAUDE_INSTALLER_PATH%"
  ExecWait '"$PLUGINSDIR\School-Claude-Setup.exe" --install-only' $0
  ${If} $0 != 0
    MessageBox MB_ICONSTOP "Claude Code setup failed. Please run the installer again."
    Abort
  ${EndIf}
  !ifndef DO_NOT_CREATE_START_MENU_SHORTCUT
    ${IfNot} ${FileExists} "$newStartMenuLink"
      !insertmacro createMenuDirectory
      CreateShortCut "$newStartMenuLink" "$appExe" "" "$appExe" 0 "" "" "${APP_DESCRIPTION}"
      ClearErrors
      WinShell::SetLnkAUMI "$newStartMenuLink" "${APP_ID}"
    ${EndIf}
  !endif
!macroend
