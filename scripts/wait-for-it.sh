
#!/bin/sh
# wait-for-it.sh - Wait for a service to be ready

TIMEOUT=15
QUIET=0
HOST=""
PORT=""

while [ $# -gt 0 ]; do
  case "$1" in
    *:* )
      HOST=$(printf "%s\n" "$1"| cut -d : -f 1)
      PORT=$(printf "%s\n" "$1"| cut -d : -f 2)
      shift 1
      ;;
    -t )
      TIMEOUT="$2"
      shift 2
      ;;
    -q | --quiet )
      QUIET=1
      shift 1
      ;;
    * )
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

if [ -z "$HOST" ] || [ -z "$PORT" ]; then
  echo "Usage: $0 host:port [-t timeout] [-q]"
  exit 1
fi

wait_for() {
  for i in $(seq $TIMEOUT -1 0); do
    nc -z "$HOST" "$PORT" > /dev/null 2>&1
    result=$?
    if [ $result -eq 0 ] ; then
      if [ $QUIET -eq 0 ]; then
        echo "Service $HOST:$PORT is available after $((TIMEOUT - i)) seconds."
      fi
      exit 0
    fi
    if [ $i -gt 0 ]; then
      if [ $QUIET -eq 0 ]; then
        echo "Waiting for $HOST:$PORT... ($i seconds left)"
      fi
      sleep 1
    fi
  done
  echo "Service $HOST:$PORT is unavailable after $TIMEOUT seconds."
  exit 1
}

wait_for
