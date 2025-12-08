FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

# Install desktop environment and VNC
RUN apt-get update && apt-get install -y \
    xfce4 \
    xfce4-terminal \
    tightvncserver \
    novnc \
    websockify \
    supervisor \
    net-tools \
    sleuthkit \
    autopsy \
    && rm -rf /var/lib/apt/lists/*

# Set up VNC
RUN mkdir -p /root/.vnc && \
    echo "forensics" | vncpasswd -f > /root/.vnc/passwd && \
    chmod 600 /root/.vnc/passwd

# Create xstartup script
RUN echo '#!/bin/bash\n\
xrdb $HOME/.Xresources\n\
startxfce4 &' > /root/.vnc/xstartup && \
    chmod +x /root/.vnc/xstartup

# Create directories
RUN mkdir -p /evidence /output

# Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

EXPOSE 5900 6080

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
