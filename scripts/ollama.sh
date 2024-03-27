ARCH=$(uname -m)
SERVICE_NAME="ollama"

is_service_running() {
    if pgrep -f "$SERVICE_NAME" > /dev/null ; then
        return 0  # Service is running
    else
        return 1 
    fi
}

if [ "$ARCH" = "x86_64" ]; then
    # Intel architecture
    URL="https://github.com/ollama/ollama/releases/download/v0.1.28/ollama-darwin"
elif [ "$ARCH" = "arm64" ]; then
    # ARM architecture (M1/M2 chip)
    URL="https://github.com/ollama/ollama/releases/download/v0.1.28/ollama-darwin" # no issue if it is duplicated
else
    echo "Unsupported architecture: $ARCH"
    exit 1
fi

if is_service_running ; then
    echo "Service ($SERVICE_NAME) is already running."
else
    if [ ! -f "./$SERVICE_NAME" ]; then
        echo "Service not found, downloading..."
        curl -L $URL -o api
        mv api ollama
    fi

    chmod +x "$SERVICE_NAME"

    echo "Starting the service..."
    cd ~/.hask/
    ./"$SERVICE_NAME" serve &
fi