#!/usr/bin/env bash

AEROSPACE_CONFIG="$HOME/.config/aerospace/aerospace.toml"

if grep -q "outer.top = 8" "$AEROSPACE_CONFIG"; then
    sed -i '' 's/outer.top = 8/outer.top = 48/' "$AEROSPACE_CONFIG" && /opt/homebrew/bin/sketchybar --bar hidden=toggle && osascript -e 'tell application "System Events" to tell dock preferences to set autohide menu bar to not autohide menu bar'
else
    sed -i '' 's/outer.top = 48/outer.top = 8/' "$AEROSPACE_CONFIG" && /opt/homebrew/bin/sketchybar --bar hidden=toggle && osascript -e 'tell application "System Events" to tell dock preferences to set autohide menu bar to not autohide menu bar'
fi
aerospace reload-config
