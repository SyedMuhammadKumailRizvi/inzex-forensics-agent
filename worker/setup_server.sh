#!/bin/bash
# setup_server.sh
# Run this on a fresh AMD Developer Cloud Instance to fully configure the Inzex Engine backend.

set -e

echo "[*] Updating system packages..."
sudo apt-get update -y && sudo apt-get upgrade -y

echo "[*] Installing dependencies (git, wget, python3-pip, docker)..."
sudo apt-get install -y git wget python3-pip python3-venv docker.io screen

echo "[*] Pulling the ROCm vLLM Docker image..."
# AMD instances use the rocm/vllm image for hardware acceleration
sudo docker pull rocm/vllm-dev:latest

echo "[*] Creating workspace directory..."
mkdir -p ~/inzex-backend
cd ~/inzex-backend

echo "[*] Cloning Volatility 3..."
if [ ! -d "volatility3" ]; then
    git clone https://github.com/volatilityfoundation/volatility3.git
fi

# Symlink vol.py so inzex_engine.py can find it in the current directory
if [ ! -f "vol.py" ]; then
    ln -s volatility3/vol.py vol.py
fi

echo "[*] Downloading cloudflared (for exposing the port)..."
if ! command -v cloudflared &> /dev/null; then
    curl -L --output cloudflared.deb https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb
    sudo dpkg -i cloudflared.deb
    rm cloudflared.deb
fi

echo "[============================================================]"
echo "[+] Host Setup Complete!"
echo ""
echo "To start the backend, run the following Docker command to launch the ROCm container:"
echo ""
echo "sudo docker run -it --name rocm --rm \\"
echo "  --network=host \\"
echo "  --device=/dev/kfd --device=/dev/dri \\"
echo "  --ipc=host \\"
echo "  --group-add=video \\"
echo "  -v \$(pwd):/app \\"
echo "  -w /app \\"
echo "  rocm/vllm-dev:latest /bin/bash"
echo ""
echo "Once inside the container, install the requirements and run your server:"
echo "pip install -r /app/requirements.txt"
echo "uvicorn inzex_engine:app --host 0.0.0.0 --port 8000"
echo "[============================================================]"
