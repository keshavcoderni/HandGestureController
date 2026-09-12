#!/bin/sh
APP_BASE_NAME=`basename "$0"`
DIRNAME=`dirname "$0"`
[ -z "$DIRNAME" ] && DIRNAME=.
APP_HOME=`cd "$DIRNAME" && pwd`
DEFAULT_JVM_OPTS='"-Xmx64m" "-Xms64m"'
exec gradle "$@"
