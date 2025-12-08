# Admin Panel - Complete Features Guide

## 🎉 All Features Are Now Active!

The admin panel now has **full functionality** including evidence file management!

---

## 📍 How to Access Admin Panel

1. **Make yourself an admin:**
   ```bash
   cd /home/jacob/forensics-simulator/backend
   node make-admin.js your-username
   ```

2. **Logout and login again** to refresh your session

3. **Navigate to:** http://localhost:5173/admin

---

## 🎛️ Admin Panel Features

### 1️⃣ **Analytics Dashboard** (Default Tab)

**What you can see:**
- Total users, levels, tasks, and submissions
- User role distribution
- Recent activity feed
- System statistics

**Use case:** Get a quick overview of system health and user engagement

---

### 2️⃣ **User Management Tab**

**Features:**
- View all users with their stats
- Change user roles (USER, MODERATOR, ADMIN)
- See total score, correct answers, and progress for each user
- User search and filtering

**How to use:**
1. Click "Users" tab
2. View the user table
3. Use the role dropdown to change user permissions
4. Monitor user activity and progress

---

### 3️⃣ **Level Management & Evidence Files Tab** ⭐ NEW!

This is the **most powerful feature** for managing forensic training materials!

#### **Left Panel: Level Selection**
- Lists all forensic training levels
- Shows difficulty badges (Beginner, Intermediate, Advanced)
- Displays task count for each level
- Click any level to manage its evidence files

#### **Right Panel: Evidence File Management**

**Upload Evidence Files:**
1. Select a level from the left panel
2. Click "Choose File" and select your evidence file
3. Add an optional description
4. Click "Upload Evidence File"

**Supported File Types:**
- 📡 **PCAP files** (.pcap, .pcapng) - Network captures
- 💾 **Memory Dumps** (.raw, .mem, .dmp, .vmem) - Memory forensics
- 💿 **Disk Images** (.dd, .img, .e01) - Disk forensics
- 📄 **Log Files** (.log, .txt, .evtx) - System logs
- ⚙️ **Executables** (.exe, .dll, .elf) - Malware analysis
- 📋 **Documents** (.pdf, .docx, .xlsx) - Reports
- 🗜️ **Archives** (.zip, .tar, .gz, .7z) - Compressed files

**Manage Uploaded Files:**
- View all evidence files for the selected level
- See file name, type, size, and upload date
- Add descriptions to help students understand each file
- Delete files you no longer need

**Example Workflow:**
```
1. Click "Level Management" tab
2. Select "Level 1: Network Intrusion Detection"
3. Upload a PCAP file: "suspicious-traffic.pcap"
4. Add description: "Network capture showing potential DDoS attack"
5. Students can now download this file when working on Level 1!
```

---

### 4️⃣ **Activity Logs Tab**

**What you see:**
- Real-time user activity
- Answer submissions (correct/incorrect)
- Level completions
- Timestamps for all activities

**Use case:** Monitor student progress and identify struggling areas

---

## 🎯 Evidence File Features for Students

When you upload evidence files to a level, students will see them in the **Level View**:

- **📁 Evidence Files Section** appears at the top of the level page (between progress bar and tasks)
- **Beautiful card layout** with file icons and type badges
- Each file card displays:
  - 📡 File icon based on type (PCAP, memory dump, disk image, etc.)
  - File name and type badge (color-coded)
  - File size in MB
  - Description (if provided by admin)
  - Upload date
  - ⬇️ Download button
- Students can download files to analyze with forensic tools
- Perfect for hands-on training exercises
- **Responsive design** - works on desktop and mobile

---

## 💡 Best Practices

### For Evidence Files:
1. **Name files descriptively** - "network-breach-2024.pcap" not "file1.pcap"
2. **Add clear descriptions** - Explain what the file contains
3. **Upload multiple file types** - Give students diverse materials
4. **Test downloads** - Make sure files work before assigning

### For Level Management:
1. **Start with simple files** for beginner levels
2. **Increase complexity** for advanced levels
3. **Provide hints** in file descriptions
4. **Mix file types** to teach different forensic techniques

---

## 🔐 Security Features

- ✅ **Role-based access control** - Only admins can upload/delete
- ✅ **File validation** - Automatic file type detection
- ✅ **Secure storage** - Files stored safely on server
- ✅ **Audit trail** - Track who uploaded what and when

---

## 📊 File Type Badges

Evidence files are color-coded by type:

- 🔵 **PCAP** - Blue (Network captures)
- 🟣 **MEMORY_DUMP** - Purple (Memory analysis)
- 🌸 **DISK_IMAGE** - Pink (Disk forensics)
- 🟢 **LOG_FILE** - Green (System logs)
- 🔴 **EXECUTABLE** - Red (Malware samples)
- 🟠 **DOCUMENT** - Orange (Reports/docs)
- 🟡 **COMPRESSED** - Indigo (Archives)
- ⚪ **OTHER** - Gray (Other types)

---

## 🚀 Quick Start Examples

### Example 1: Upload Network Capture
```
1. Go to Admin Panel → Level Management
2. Select "Level 1: Network Analysis"
3. Upload file: capture.pcap (5 MB)
4. Description: "Suspicious traffic between 10.0.0.5 and external IPs"
5. Click Upload
6. ✅ Students can now analyze this in Wireshark!
```

### Example 2: Upload Memory Dump
```
1. Select "Level 3: Memory Forensics"
2. Upload file: infected-system.mem (2 GB)
3. Description: "Memory dump from compromised Windows 10 machine"
4. ✅ Students can analyze with Volatility!
```

### Example 3: Upload Malware Sample
```
1. Select "Level 5: Malware Analysis"
2. Upload file: suspicious.exe (500 KB)
3. Description: "Potential ransomware - analyze in sandbox only!"
4. ✅ Students can reverse engineer safely!
```

---

## 🎓 Training Level Ideas

### Beginner Levels:
- Simple PCAP files with clear attack patterns
- Clean disk images with planted evidence
- Basic log files with obvious anomalies

### Intermediate Levels:
- Multiple evidence files to correlate
- Memory dumps requiring Volatility plugins
- Encrypted archives needing password cracking

### Advanced Levels:
- Full incident response scenarios
- Multiple file types to analyze together
- Real-world malware samples (safely contained)

---

## ⚠️ Important Notes

1. **File Size Limits:**
   - PCAP: 500 MB
   - Memory Dumps: 2 GB
   - Disk Images: 10 GB
   - Other types: 100 MB

2. **Storage:**
   - Files stored in `/backend/uploads/` directory
   - Organized by type (pcap/, memory/, disk/, etc.)
   - Automatically cleaned up when deleted

3. **Access:**
   - Only authenticated users can download
   - Evidence files tied to specific levels
   - Download tracking for analytics

---

## 🐛 Troubleshooting

**"No evidence files" showing?**
- Make sure you selected a level first
- Check if any files were uploaded for that level

**Upload failing?**
- Check file size limits
- Verify file type is supported
- Ensure you're logged in as admin

**Files not downloading for students?**
- Verify file still exists on server
- Check user is authenticated
- Confirm level access permissions

---

## 📞 Need Help?

- Check browser console (F12) for errors
- Review backend logs for detailed errors
- Verify database connection is working
- Ensure file upload directory has write permissions

---

## 🎉 Summary

Your admin panel now has **complete evidence file management**:

✅ Upload forensic evidence files
✅ Organize by level and type
✅ Add descriptions for students
✅ Delete unwanted files
✅ Track upload history
✅ Color-coded file types
✅ Responsive design
✅ Full CRUD operations

**Start uploading evidence files and create amazing forensic training exercises!** 🔒🔍
