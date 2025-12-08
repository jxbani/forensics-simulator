FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install basic tools first
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Install forensic tools in separate layer
RUN apt-get update && apt-get install -y \
    dcfldd \
    ddrescue \
    && rm -rf /var/lib/apt/lists/*

# Install GUI and VNC in separate layer
RUN apt-get update && apt-get install -y \
    xfce4 \
    xfce4-terminal \
    tightvncserver \
    && rm -rf /var/lib/apt/lists/*

# Install novnc and websockify in separate layer
RUN apt-get update && apt-get install -y \
    novnc \
    websockify \
    supervisor \
    && rm -rf /var/lib/apt/lists/*

# Install Python
RUN apt-get update && apt-get install -y \
    python3 \
    python3-pip \
    && rm -rf /var/lib/apt/lists/*

# Install Python Flask
RUN pip3 install flask flask-cors

# Set up VNC
RUN mkdir -p /root/.vnc && \
    echo "forensics" | vncpasswd -f > /root/.vnc/passwd && \
    chmod 600 /root/.vnc/passwd

# Create xstartup script
RUN echo '#!/bin/bash\nxrdb $HOME/.Xresources\nstartxfce4 &' > /root/.vnc/xstartup && \
    chmod +x /root/.vnc/xstartup

# Create directories
RUN mkdir -p /evidence /output /app

# Copy imaging API
COPY imaging_api.py /app/
WORKDIR /app

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 5900 6080 5002

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
