#!/bin/bash

VPN="$(
    scutil --nc list |
        sed -nE 's/.*"(.*)".*/\1/p' |
        head -n 1
)"

if [[ -z "$VPN" ]]; then
    exit 1
fi

STATUS="$(scutil --nc status "$VPN" | head -n 1)"

if [[ "$STATUS" == "Connected" ]]; then
    scutil --nc stop "$VPN"
else
    networksetup -connectpppoeservice "$VPN"
fi

sleep 1
"$HOME/.config/sketchybar/plugins/vpn.sh"
