FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive
ENV USER=root

# Install Wireshark GUI, VNC, and noVNC
RUN apt-get update && apt-get install -y \
    wireshark \
    xfce4 \
    xfce4-terminal \
    tightvncserver \
    novnc \
    websockify \
    supervisor \
    net-tools \
    wget \
    && rm -rf /var/lib/apt/lists/*

# Create directories
RUN mkdir -p /root/.vnc /evidence /output

# Set VNC password
RUN echo "forensics" | vncpasswd -f > /root/.vnc/passwd && \
    chmod 600 /root/.vnc/passwd

# Create VNC startup script
RUN echo '#!/bin/bash\n\
xrdb $HOME/.Xresources\n\
startxfce4 &' > /root/.vnc/xstartup && \
    chmod +x /root/.vnc/xstartup

# Create supervisor config
RUN echo '[supervisord]\n\
nodaemon=true\n\
logfile=/var/log/supervisord.log\n\
pidfile=/var/run/supervisord.pid\n\
\n\
[program:vncserver]\n\
command=/usr/bin/vncserver :1 -geometry 1280x800 -depth 24\n\
autorestart=true\n\
stdout_logfile=/var/log/vncserver.log\n\
stderr_logfile=/var/log/vncserver.err\n\
\n\
[program:novnc]\n\
command=/usr/bin/websockify --web /usr/share/novnc 6080 localhost:5901\n\
autorestart=true\n\
stdout_logfile=/var/log/novnc.log\n\
stderr_logfile=/var/log/novnc.err' > /etc/supervisor/conf.d/supervisord.conf

EXPOSE 6080 5901

WORKDIR /evidence

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
