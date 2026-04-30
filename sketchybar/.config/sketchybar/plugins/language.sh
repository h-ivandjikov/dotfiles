#!/usr/bin/env bash

LAYOUT=$(defaults read ~/Library/Preferences/com.apple.HIToolbox.plist AppleSelectedInputSources | grep "KeyboardLayout Name" | cut -d '=' -f 2 | tr -d ' ";')

LAYOUT=$(echo "$LAYOUT" | cut -c 1-3 | tr '[:lower:]' '[:upper:]')

sketchybar --set $NAME label="$LAYOUT"
