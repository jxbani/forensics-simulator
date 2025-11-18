FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install tshark
RUN apt-get update && apt-get install -y \
    tshark \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python packages
RUN pip3 install flask flask-cors pyshark

# Create app directory
WORKDIR /app

# Copy API application
COPY wireshark_api.py .

# Create directories
RUN mkdir -p /evidence /output

EXPOSE 5001

CMD ["python3", "wireshark_api.py"]
