# 🎉 Forensic Tools Integration - COMPLETE!

## ✅ Integration Successful!

Your Forensics Simulator now has **REAL Docker containers** running inside the lab!

---

## 🔧 What Was Done

### 1. Docker Images Built ✅
- **Wireshark** (Network Analysis) - 877MB
- **Volatility** (Memory Forensics) - 1.45GB
- **Autopsy** (Disk Forensics) - 1.41GB

### 2. Tools Tested ✅
Each tool was individually tested and verified working:
- Wireshark API responding on port 5001
- Volatility Jupyter Lab accessible on port 8888
- Autopsy noVNC interface on port 6080

### 3. Backend Integration ✅
- Installed `dockerode` package for Docker API access
- Updated `dockerService.js` with full Docker support
- Configured automatic port management
- Implemented container lifecycle management
- Added volume mounting for evidence/output directories

### 4. Real Docker Mode Enabled ✅
- Backend now connects to Docker daemon on startup
- Containers are created, started, and managed automatically
- Tools launch with real isolation and resource management

---

## 🚀 How to Use the Forensic Lab

### Step 1: Access the Forensic Lab

**Navigate to:** http://localhost:5173/forensic-lab

### Step 2: Upload Evidence Files (Optional)

1. Click on the "Evidence Files" section
2. Choose a forensic evidence file:
   - PCAP files (.pcap, .pcapng) for Wireshark
   - Memory dumps (.mem, .raw, .dmp) for Volatility
   - Disk images (.dd, .img, .e01) for Autopsy
3. Click "Upload File"
4. Files appear in the list and are available to all tools

### Step 3: Launch a Tool

**Option A: Wireshark (Network Analysis)**
1. Click "Available Tools" section
2. Find "Wireshark" tool card
3. (Optional) Select PCAP files to analyze
4. Click "Launch Tool" button
5. Wait 3-5 seconds for container to start
6. Click "Open Tool" to access the REST API
7. Use the API endpoints to analyze network traffic

**Option B: Volatility (Memory Forensics)**
1. Click "Available Tools" section
2. Find "Volatility" tool card
3. (Optional) Select memory dump files
4. Click "Launch Tool" button
5. Wait 5-10 seconds for Jupyter to start
6. Click "Open Tool" to access Jupyter Lab
7. Open the "Volatility_Quickstart.ipynb" notebook
8. Run commands to analyze memory dumps

**Option C: Autopsy (Disk Forensics)**
1. Click "Available Tools" section
2. Find "Autopsy" tool card
3. (Optional) Select disk image files
4. Click "Launch Tool" button
5. Wait 10-15 seconds for GUI to start
6. Click "Open Tool" to access noVNC interface
7. Password: `forensics` (if prompted)
8. Launch Autopsy from the desktop
9. Create a case and analyze disk images

### Step 4: Monitor Active Tools

- Check the "Active Tools" panel on the right
- See all running containers
- View container status and port information
- Click "Open Tool" to access any running tool
- Click "Stop Tool" to shut down a container

---

## 🎯 What Happens When You Launch a Tool

### Behind the Scenes:

1. **Frontend** sends request to `/api/tools/start`
2. **Backend** receives request with tool name and user ID
3. **Docker Service**:
   - Finds available port (e.g., 8888, 8889, 8890...)
   - Creates Docker container with:
     - Tool-specific image
     - Port mapping (container port → host port)
     - Volume mounts (/evidence, /output)
     - User labels for tracking
   - Starts the container
4. **Container** launches and initializes the tool
5. **Backend** returns container info with access URL
6. **Frontend** shows "Open Tool" button
7. **User** clicks button → Opens tool in new browser tab

### Container Lifecycle:

```
Launch Tool → Container Created → Container Started → Tool Running → Open Tool → Use Tool → Stop Tool → Container Removed
```

---

## 📁 File Sharing

Evidence files and outputs are shared between containers using Docker volumes:

```
forensics-simulator/
├── evidence/          # Read-only for containers
│   ├── capture.pcap   # Network captures
│   ├── memory.mem     # Memory dumps
│   └── disk.dd        # Disk images
│
└── output/            # Read-write for containers
    ├── volatility/    # Volatility analysis results
    ├── wireshark/     # Network analysis exports
    └── autopsy/       # Forensic reports
```

### File Access in Containers:

**Wireshark Container:**
- Evidence: `/evidence/`
- Output: `/output/`

**Volatility Container:**
- Evidence: `/evidence/`
- Output: `/output/`
- Example: `!vol -f /evidence/memory.mem windows.pslist`

**Autopsy Container:**
- Evidence: `/evidence/`
- Output: `/output/`
- Use file manager to browse directories

---

## 🔧 Technical Details

### Tool Configurations:

| Tool | Image | Port | Access Method | Path |
|------|-------|------|---------------|------|
| **Wireshark** | `forensics-lab/wireshark:latest` | 5001+ | HTTP REST API | `/` |
| **Volatility** | `forensics-lab/volatility:latest` | 8888+ | Jupyter Lab | `/lab` |
| **Autopsy** | `forensics-lab/autopsy:latest` | 6080+ | noVNC | `/vnc.html` |

**Note:** The `+` means the port will increment if the default is taken (e.g., 5001, 5002, 5003...)

### Container Labels:

Each container is labeled for tracking:
```json
{
  "forensics.user": "123",
  "forensics.tool": "volatility",
  "forensics.created": "2025-11-16T15:30:00.000Z"
}
```

### Auto-Cleanup:

Idle containers (running > 1 hour) are automatically cleaned up to save resources.

---

## 🐛 Troubleshooting

### Tool Won't Launch

**Check Docker is running:**
```bash
docker ps
```

**Check backend logs:**
```bash
# Look for errors in the terminal running backend
```

**Check if images exist:**
```bash
docker images | grep forensics-lab
```

### Container Starts But Can't Access

**Wait longer:**
- Wireshark: 3-5 seconds
- Volatility: 5-10 seconds (Jupyter takes time to start)
- Autopsy: 10-15 seconds (GUI initialization)

**Check container logs:**
```bash
docker ps  # Get container ID
docker logs <container-id>
```

### Port Already in Use

The system automatically finds available ports. If you see this error, it means all ports in the range are taken. Stop some containers:
```bash
docker ps | grep forensics
docker stop <container-id>
```

### Permission Denied

Make sure evidence and output directories exist:
```bash
cd /home/jacob/forensics-simulator
mkdir -p evidence output
chmod 755 evidence output
```

---

## 📊 System Status

### Currently Running:

```
✅ Backend API: http://localhost:5000
✅ Frontend UI: http://localhost:5173
✅ Docker Daemon: Connected
✅ Evidence Directory: /home/jacob/forensics-simulator/evidence
✅ Output Directory: /home/jacob/forensics-simulator/output
```

### Available Tools:

```
✅ Wireshark - Network Analysis (REST API)
✅ Volatility - Memory Forensics (Jupyter Lab)
✅ Autopsy - Disk Forensics (noVNC GUI)
```

---

## 🎓 Example Workflows

### Workflow 1: Network Forensics

1. Upload PCAP file (`suspicious-traffic.pcap`)
2. Launch Wireshark tool
3. Access API at `http://localhost:5001`
4. Use endpoints:
   - `GET /health` - Check service status
   - `GET /files` - List evidence files
   - `POST /analyze` - Analyze PCAP file
   - `POST /statistics` - Get network statistics

### Workflow 2: Memory Analysis

1. Upload memory dump (`compromised-system.mem`)
2. Launch Volatility tool
3. Access Jupyter Lab at `http://localhost:8888/lab`
4. Open Volatility_Quickstart.ipynb
5. Run analysis commands:
   ```python
   !vol -f /evidence/compromised-system.mem windows.pslist
   !vol -f /evidence/compromised-system.mem windows.netscan
   !vol -f /evidence/compromised-system.mem windows.filescan
   ```

### Workflow 3: Disk Forensics

1. Upload disk image (`evidence-disk.dd`)
2. Launch Autopsy tool
3. Access GUI at `http://localhost:6080/vnc.html`
4. Create new case in Autopsy
5. Add data source → Disk Image
6. Browse to `/evidence/evidence-disk.dd`
7. Analyze files, registry, timeline

---

## 🎉 Success Metrics

Your integration is successful if:

- ✅ Tools launch from the UI without errors
- ✅ Containers appear in `docker ps` when running
- ✅ Tool interfaces are accessible in the browser
- ✅ Evidence files are visible inside containers
- ✅ Analysis results can be saved to /output
- ✅ Containers can be stopped from the UI
- ✅ Stopped containers are removed from `docker ps`

---

## 📞 Additional Resources

- **Setup Guide:** `FORENSIC_TOOLS_SETUP_GUIDE.md`
- **Admin Features:** `ADMIN_FEATURES_GUIDE.md`
- **Evidence Files Display:** `EVIDENCE_FILES_DISPLAY.md`

---

## 🚀 You're Ready!

**Everything is set up and working!**

1. Go to http://localhost:5173/forensic-lab
2. Launch a tool
3. Start analyzing forensic evidence!

**Happy Forensic Analysis! 🔒🔍**
