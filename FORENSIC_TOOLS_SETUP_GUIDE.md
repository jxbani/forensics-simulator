# 🔬 Forensic Tools Setup Guide

## Complete Guide to Enable Real Docker Tools in the Forensic Lab

**Current Status:** Demo Mode (tools open documentation links)
**Target:** Real containerized tools running in the lab

---

## 📋 Prerequisites

✅ **Docker installed** - Version 28.5.2 detected
✅ **Docker running** - daemon active
✅ **Backend & Frontend** - running on ports 5000 & 5173

---

## 🎯 Overview - What We'll Set Up

### Tool #1: Wireshark (Network Analysis) - **EASIEST**
- **Technology:** REST API with tshark
- **Port:** 5001
- **Access:** HTTP API endpoints
- **Best for:** PCAP file analysis

### Tool #2: Volatility (Memory Forensics) - **EASY**
- **Technology:** Jupyter Lab
- **Port:** 8888
- **Access:** Web browser (Jupyter interface)
- **Best for:** Memory dump analysis

### Tool #3: Autopsy (Disk Forensics) - **MODERATE**
- **Technology:** VNC + GUI
- **Port:** 9999
- **Access:** noVNC web interface
- **Best for:** Disk image forensics

### Tool #4: FTK Imager (Forensic Imaging) - **MODERATE**
- **Technology:** VNC + GUI or CLI
- **Port:** 5002
- **Access:** noVNC or API
- **Best for:** Creating disk images

---

## 🚀 Quick Start - Tool #1: Wireshark

### Step 1: Build the Wireshark Docker Image

```bash
cd /home/jacob/forensics-simulator
docker build -t forensics-lab/wireshark:latest ./docker/wireshark
```

### Step 2: Test the Wireshark Container

```bash
# Create test directories
mkdir -p ./evidence ./output

# Run the container
docker run -d \
  --name wireshark-test \
  -p 5001:5001 \
  -v $(pwd)/evidence:/evidence:ro \
  -v $(pwd)/output:/output:rw \
  forensics-lab/wireshark:latest

# Test the API
curl http://localhost:5001/health

# Expected output:
# {"status":"healthy","service":"Wireshark Analysis API",...}
```

### Step 3: Test with Sample PCAP File

```bash
# Download a sample PCAP file (optional)
cd evidence
wget https://wiki.wireshark.org/uploads/__moin_import__/attachments/SampleCaptures/http.cap -O test.pcap
cd ..

# Test analysis via API
curl -X POST http://localhost:5001/files
# Should list your test.pcap file

curl -X POST http://localhost:5001/analyze \
  -H "Content-Type: application/json" \
  -d '{"filename":"test.pcap","limit":10}'
```

### Step 4: Stop Test Container

```bash
docker stop wireshark-test
docker rm wireshark-test
```

---

## 🚀 Quick Start - Tool #2: Volatility

### Step 1: Build the Volatility Docker Image

```bash
cd /home/jacob/forensics-simulator
docker build -t forensics-lab/volatility:latest ./docker/volatility
```

This may take 5-10 minutes (installing Python packages).

### Step 2: Test the Volatility Container

```bash
# Run the container
docker run -d \
  --name volatility-test \
  -p 8888:8888 \
  -v $(pwd)/evidence:/evidence:ro \
  -v $(pwd)/output:/output:rw \
  forensics-lab/volatility:latest

# Wait 10 seconds for Jupyter to start
sleep 10

# Access Jupyter Lab
echo "Open in browser: http://localhost:8888"
```

### Step 3: Test Jupyter Lab

- Open http://localhost:8888 in your browser
- You should see Jupyter Lab interface
- Look for "Volatility_Quickstart.ipynb" notebook
- Open it and run the first cell to verify Volatility is installed

### Step 4: Stop Test Container

```bash
docker stop volatility-test
docker rm volatility-test
```

---

## 🔧 Integration with Backend

### Current State:
- `dockerService.js` has `FORCE_MOCK_MODE = true`
- Tools open documentation instead of real containers

### Changes Needed:

1. **Enable Docker Integration** - Install `dockerode` package
2. **Update dockerService.js** - Remove mock mode, add real Docker API calls
3. **Create evidence/output directories** - For file sharing
4. **Update tool configs** - Point to correct Docker images
5. **Add container management** - Start/stop/monitor containers

---

## 📁 Directory Structure

```
/home/jacob/forensics-simulator/
├── evidence/          # Shared with containers (read-only)
│   └── *.pcap        # Network captures
│   └── *.mem         # Memory dumps
│   └── *.dd          # Disk images
│
├── output/           # Shared with containers (read-write)
│   └── results/      # Analysis outputs
│
└── docker/
    ├── wireshark/    # Wireshark container files
    ├── volatility/   # Volatility container files
    ├── autopsy/      # Autopsy container files
    └── ftk/          # FTK container files
```

---

## 🎯 Next Steps

### Option A: Quick Demo (Recommended First)
1. Build Wireshark image
2. Build Volatility image
3. Test manually with `docker run` commands above
4. Verify tools work before backend integration

### Option B: Full Integration (After testing)
1. Install dockerode: `cd backend && npm install dockerode`
2. Update dockerService.js to use real Docker
3. Add container lifecycle management
4. Update frontend to show real container status

---

## 🐛 Troubleshooting

### Docker Image Build Fails
```bash
# Check Docker is running
docker ps

# Check disk space
df -h

# View build logs
docker build --no-cache -t forensics-lab/wireshark:latest ./docker/wireshark
```

### Container Won't Start
```bash
# Check container logs
docker logs wireshark-test

# Check port conflicts
netstat -tulpn | grep 5001

# Check if image exists
docker images | grep forensics-lab
```

### API Not Responding
```bash
# Check container is running
docker ps

# Check container health
docker inspect wireshark-test | grep Health -A 10

# Check container logs
docker logs wireshark-test
```

---

## 📝 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (Port 5173)                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ ForensicLab│  │ToolSelector│  │ ActiveTools│            │
│  └─────┬──────┘  └──────┬─────┘  └──────┬─────┘            │
└────────┼─────────────────┼────────────────┼─────────────────┘
         │                 │                │
         └─────────────────┼────────────────┘
                          │
┌─────────────────────────▼─────────────────────────────────┐
│                Backend (Port 5000)                         │
│  ┌──────────────────┐  ┌────────────────────┐             │
│  │ toolController   │  │  dockerService.js  │             │
│  │                  │  │                    │             │
│  │ - /tools/start   │◄─┤ - createContainer  │             │
│  │ - /tools/stop    │  │ - stopContainer    │             │
│  │ - /tools/list    │  │ - listContainers   │             │
│  └──────────────────┘  └───────────┬────────┘             │
└──────────────────────────────────────┼──────────────────────┘
                                      │
                        ┌─────────────▼──────────────┐
                        │   Docker Daemon            │
                        │                            │
┌───────────────────────┼────────────────────────────┼────────┐
│ Container: Wireshark  │ Container: Volatility      │ etc... │
│ Port: 5001            │ Port: 8888                 │        │
│ /evidence → mounted   │ /evidence → mounted        │        │
│ /output → mounted     │ /output → mounted          │        │
└───────────────────────┴────────────────────────────┴────────┘
```

---

## ✅ Success Criteria

After completing setup, you should be able to:

1. **Build images successfully**
   - `docker images | grep forensics-lab` shows all tools

2. **Start containers from backend**
   - API call to `/api/tools/start` creates real container
   - Container appears in `docker ps`

3. **Access tools through browser**
   - Wireshark API responds on http://localhost:5001
   - Volatility Jupyter opens on http://localhost:8888

4. **Share files with containers**
   - Files uploaded in lab appear in container `/evidence`
   - Analysis output saved to `/output`

5. **Stop containers**
   - API call to `/api/tools/stop` removes container
   - Container no longer in `docker ps`

---

## 🎓 Ready to Start?

Let's begin with **Tool #1: Wireshark** - it's the simplest and fastest to set up!

Run the build command to get started:
```bash
cd /home/jacob/forensics-simulator
docker build -t forensics-lab/wireshark:latest ./docker/wireshark
```

This should complete in 2-3 minutes. Let me know when it's done!
