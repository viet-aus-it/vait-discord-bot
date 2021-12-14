#!/bin/bash

ARGS="exec -it -e LINES=$(tput lines) -e COLUMNS=$(tput cols) discord_bot_dev"

if [ -z "$1" ]; then
	docker $ARGS bash
else
	docker $ARGS $*
fi
