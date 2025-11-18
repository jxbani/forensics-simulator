# 🧪 Testing Real Docker Tools - Complete Guide

## ✅ Integration Status

**Backend:** Connected to Docker daemon ✅
**Frontend:** Updated to detect Docker mode ✅
**Docker Images:** All built and tested ✅
**System:** Ready for testing! ✅

---

## 🎯 What to Test

### Test 1: Verify Docker Mode Detection

**Expected Result:** Green "Docker Connected" banner should appear

1. Open browser to: **http://localhost:5173/forensic-lab**
2. Login if not already logged in
3. Look at the top of the page
4. **You should see:**
   - ✅ Green banner saying "Docker Connected"
   - Message: "Real forensic tools are available! Containers will be created when you launch tools."

**If you see a yellow "Demo Mode" banner instead:**
- Backend may not be running
- Docker daemon may not be accessible
- Check backend logs for errors

---

### Test 2: Launch Wireshark Tool

**Expected Result:** Real Docker container starts, accessible via browser

**Steps:**

1. **On the Forensic Lab page**, scroll to "Available Tools" section
2. **Find the Wireshark card** (Network protocol analyzer with 🦈 icon)
3. **Click "Launch Tool"** button
4. **Wait 3-5 seconds** for container to start
5. **Watch the browser console** (F12 → Console tab) for logs
6. **Container should appear** in "Active Tools" panel on the right
7. **Click "Open Tool"** button when it appears
8. **New tab should open** showing Wireshark API or interface

**What to check in terminal (backend):**
```bash
# In the terminal running backend, you should see:
Creating container: forensics-wireshark-user1-[timestamp] on port 5001
```

**What to check in Docker:**
```bash
# In a new terminal, run:
docker ps

# You should see a container like:
# forensics-wireshark-user1-...
# with port mapping 5001->5001
```

**If tool doesn't launch:**
- Check browser console for errors (F12)
- Check backend terminal for error messages
- Verify Docker image exists: `docker images | grep wireshark`
- Check backend logs for "Creating container" message

---

### Test 3: Launch Volatility Tool

**Expected Result:** Jupyter Lab opens in new tab

**Steps:**

1. **Click "Launch Tool"** on the Volatility card
2. **Wait 5-10 seconds** (Jupyter takes longer to start)
3. **Container appears** in Active Tools panel
4. **Click "Open Tool"**
5. **Jupyter Lab should open** at `http://localhost:8888/lab`
6. **Look for "Volatility_Quickstart.ipynb"** notebook in file browser

**Expected URL:** `http://localhost:8888/lab`

**Test in Jupyter:**
- Open a new notebook or terminal
- Run: `vol --help`
- Should see Volatility 3 help text

---

### Test 4: Launch Autopsy Tool

**Expected Result:** noVNC GUI opens with Autopsy desktop

**Steps:**

1. **Click "Launch Tool"** on the Autopsy card
2. **Wait 10-15 seconds** (GUI takes longest to start)
3. **Container appears** in Active Tools
4. **Click "Open Tool"**
5. **noVNC web interface should load** at `http://localhost:6080/vnc.html`
6. **You should see** an Ubuntu desktop environment
7. **Password (if prompted):** `forensics`

**Expected URL:** `http://localhost:6080/vnc.html`

---

### Test 5: Upload Evidence File and Launch Tool

**Expected Result:** File accessible inside container

**Steps:**

1. **Scroll to "Evidence Files" section**
2. **Click "Choose File"** and select any file (text file, image, etc.)
3. **Click "Upload"**
4. **File should appear** in the files list
5. **Launch Wireshark** or any tool
6. **Inside the tool**, check if file exists at `/evidence/[filename]`

**For Wireshark API:**
```bash
# Should list your uploaded files
curl http://localhost:5001/files
```

**For Volatility Jupyter:**
```python
# In a notebook cell
!ls -la /evidence/
```

**For Autopsy VNC:**
- Open File Manager
- Navigate to `/evidence/` directory
- Your files should be visible

---

### Test 6: Stop a Running Tool

**Expected Result:** Container stops and is removed

**Steps:**

1. **With a tool running**, go to "Active Tools" panel
2. **Click "Stop Tool"** button
3. **Confirm** the dialog
4. **Container should disappear** from Active Tools panel
5. **Backend should log:** "Container [id] stopped and removed"

**Verify in terminal:**
```bash
docker ps
# Container should be gone
```

---

### Test 7: Launch Multiple Tools Simultaneously

**Expected Result:** Multiple containers run at once, each on different ports

**Steps:**

1. **Launch Wireshark** → Should get port 5001
2. **Launch Volatility** → Should get port 8888
3. **Launch Autopsy** → Should get port 6080
4. **All three** should appear in Active Tools panel
5. **All three** should be accessible via their URLs

**Check ports:**
```bash
docker ps
# Should show 3 containers with different port mappings
```

---

### Test 8: Launch Same Tool Twice

**Expected Result:** Second instance gets incremented port

**Steps:**

1. **Launch Wireshark** → Gets port 5001
2. **Launch Wireshark again** → Should get port 5002
3. **Both should appear** in Active Tools
4. **Both should be accessible** at their respective URLs

**Check:**
```bash
docker ps
# Should show:
# forensics-wireshark-user1-... 0.0.0.0:5001->5001/tcp
# forensics-wireshark-user1-... 0.0.0.0:5002->5001/tcp
```

---

## 🔍 What to Look For

### ✅ Success Indicators:

1. **Green "Docker Connected" banner** appears on Forensic Lab page
2. **Containers appear in Active Tools** within 5-15 seconds of launch
3. **"Open Tool" button works** and opens tool in new tab
4. **Tools are functional:**
   - Wireshark: API responds to requests
   - Volatility: Jupyter Lab loads and vol commands work
   - Autopsy: Desktop GUI appears in browser
5. **Containers visible in `docker ps`**
6. **Backend logs show container creation messages**
7. **Stop button removes containers** from both UI and `docker ps`
8. **Evidence files accessible** inside containers at `/evidence/`

---

### ❌ Failure Indicators:

1. **Yellow "Demo Mode" banner** appears instead of green
2. **Containers don't appear** in Active Tools after launching
3. **"Open Tool" opens documentation** instead of actual tool
4. **`docker ps` shows no containers** after launching
5. **Backend logs show errors** about Docker connection
6. **Tools can't access `/evidence/` directory**
7. **Ports already in use** errors in backend logs

---

## 🐛 Troubleshooting

### Issue: Yellow Demo Mode Banner Shows

**Cause:** Backend not connected to Docker

**Solutions:**
1. Check if backend is running: `ps aux | grep node`
2. Restart backend: Stop it (Ctrl+C) and run `npm run dev` in backend/
3. Check backend logs for "✅ Docker Service: Connected to Docker daemon"
4. Verify Docker daemon: `docker ps` should work
5. Check `/var/run/docker.sock` permissions

---

### Issue: Tool Launches But Nothing Happens

**Cause:** Container starting but frontend not refreshing

**Solutions:**
1. Wait longer (Autopsy can take 15-20 seconds)
2. Manually refresh the Active Tools: Click refresh button
3. Check browser console (F12) for JavaScript errors
4. Check backend terminal for container creation logs
5. Run `docker ps` to see if container actually started

---

### Issue: Can't Access Tool URL

**Cause:** Container started but service not ready yet

**Solutions:**
1. Wait 30 seconds and try again (services need time to initialize)
2. Check container logs: `docker logs [container-id]`
3. Verify port is correct: `docker ps` shows port mapping
4. Try accessing directly: `curl http://localhost:5001/health` for Wireshark
5. Check firewall/network settings

---

### Issue: Evidence Files Not Visible in Container

**Cause:** Volume mount failed or wrong path

**Solutions:**
1. Verify evidence directory exists:
   ```bash
   ls -la /home/jacob/forensics-simulator/evidence
   ```
2. Check if files are actually uploaded (should be in backend/uploads/)
3. Inside container, check: `ls -la /evidence/`
4. Verify volume mount in `docker inspect [container-id]`
5. Check file permissions: `chmod 755 evidence/`

---

### Issue: Port Already in Use

**Cause:** Previous container still running or other service using port

**Solutions:**
1. Check what's using the port: `netstat -tulpn | grep 5001`
2. Stop old containers: `docker stop $(docker ps -q --filter "label=forensics.tool")`
3. System should auto-increment port (5001 → 5002 → 5003)
4. If auto-increment fails, check backend logs for error details

---

## 📊 Expected Backend Logs

When launching a tool, you should see:

```
Creating container: forensics-wireshark-user1-1731772800000 on port 5001
```

When stopping a tool:
```
Container abc123def456 stopped and removed
```

On backend startup:
```
✅ Docker Service: Connected to Docker daemon
```

---

## 🎯 Quick Test Checklist

Run through this quickly to verify everything works:

- [ ] Navigate to http://localhost:5173/forensic-lab
- [ ] See green "Docker Connected" banner
- [ ] Launch Wireshark tool
- [ ] Container appears in Active Tools within 5 seconds
- [ ] Click "Open Tool" → API/interface loads in new tab
- [ ] Run `docker ps` → See container running
- [ ] Stop tool from UI
- [ ] Container disappears from Active Tools
- [ ] Run `docker ps` → Container gone
- [ ] Upload a test file
- [ ] Launch tool again
- [ ] Verify file exists at `/evidence/[filename]` inside tool

---

## 📞 Getting Help

If you encounter issues:

1. **Check browser console** (F12 → Console) for frontend errors
2. **Check backend terminal** for Docker service errors
3. **Run `docker ps`** to see actual container status
4. **Check container logs**: `docker logs [container-id]`
5. **Verify images exist**: `docker images | grep forensics-lab`
6. **Test Docker manually**:
   ```bash
   docker run -d -p 5001:5001 forensics-lab/wireshark:latest
   curl http://localhost:5001/health
   docker stop [container-id]
   ```

---

## 🎉 Success Criteria

The integration is working correctly if:

✅ Green banner shows "Docker Connected"
✅ Tools launch and containers appear in Active Tools
✅ `docker ps` shows running containers with forensics-* names
✅ Tool interfaces open in new tabs and are functional
✅ Evidence files are accessible at `/evidence/` inside containers
✅ Stop button removes containers from UI and Docker
✅ Multiple tools can run simultaneously
✅ Auto port increment works for duplicate tools

---

## 🚀 Ready to Test!

**Open your browser to:** http://localhost:5173/forensic-lab

**Start with:** Test 1 (Verify Docker Mode Detection)

**Have fun exploring real forensic tools!** 🔒🔍
