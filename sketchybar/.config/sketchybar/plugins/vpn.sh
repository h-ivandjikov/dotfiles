#!/bin/bash

VPN="$(
    scutil --nc list |
        sed -nE 's/.*"(.*)".*/\1/p' |
        head -n 1
)"

STATUS="$(scutil --nc status "$VPN" | head -n 1)"

if [[ "$STATUS" == "Connected" ]]; then
    sketchybar --set vpn \
        icon="󰖂" \
        label="$VPN" \
        icon.color=0xff9ece6a \
        drawing=on
else
    sketchybar --set vpn \
        icon="󰖪" \
        label="VPN" \
        icon.color=0xff565f89 \
        drawing=on
fi
