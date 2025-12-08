# Sample Questions from Each Level

This document shows example questions from each difficulty level to help you understand the content.

---

## Level 1: Introduction to Digital Forensics (BEGINNER)

### Example Questions:

**Q1: Multiple Choice (10 points)**
```
What is the first step when arriving at a digital crime scene?

Answer: Secure and isolate the scene
Hint: Think about preventing evidence contamination
```

**Q2: True/False (10 points)**
```
Chain of custody documentation is optional in digital forensics investigations.

Answer: false
Hint: Consider the legal admissibility of evidence
```

**Q3: Short Answer (15 points)**
```
What does the acronym "ACPO" stand for in digital forensics?

Answer: Association of Chief Police Officers
Hint: It's a UK-based organization that created forensic principles
```

**Q4: Command Line (20 points)**
```
What command would you use to create a forensic image of /dev/sda to a file named evidence.dd?

Answer: dd if=/dev/sda of=evidence.dd bs=4096
Hint: Use the dd command with input file (if) and output file (of) parameters
```

**Topics Covered:**
- Crime scene management
- Chain of custody
- ACPO principles
- Forensic imaging
- Write-blockers
- Hash verification

---

## Level 2: File System Forensics (INTERMEDIATE)

### Example Questions:

**Q1: Short Answer (15 points)**
```
What is the Master File Table (MFT) in NTFS file systems?

Answer: A database that contains information about every file and directory on an NTFS volume
Hint: It's the central metadata repository for NTFS
```

**Q2: File Analysis (25 points)**
```
What is the file signature (in hex) for a JPEG image?

Answer: FF D8 FF
Hint: It starts with FF D8
```

**Q3: Command Line (25 points)**
```
Which command creates a timeline from a disk image using The Sleuth Kit?

Answer: fls -r -m / evidence.dd > timeline.txt
Hint: Use fls with recursive (-r) and MAC time output (-m) flags
```

**Q4: Short Answer (20 points)**
```
What is an Alternate Data Stream (ADS) in NTFS?

Answer: A feature that allows files to contain multiple data streams
Hint: It can be used to hide data in NTFS file systems
```

**Topics Covered:**
- Master File Table (MFT)
- File carving
- MAC times
- Slack space
- NTFS attributes
- File signatures
- The Sleuth Kit

---

## Level 3: Network Forensics and Traffic Analysis (INTERMEDIATE)

### Example Questions:

**Q1: Multiple Choice (10 points)**
```
What protocol operates on TCP port 443?

Answer: HTTPS
Hint: It's the secure version of HTTP
```

**Q2: Network Analysis (20 points)**
```
What Wireshark display filter shows only HTTP GET requests?

Answer: http.request.method == "GET"
Hint: Use the http.request.method field
```

**Q3: Command Line (20 points)**
```
What tcpdump command captures all traffic on interface eth0 and saves it to capture.pcap?

Answer: tcpdump -i eth0 -w capture.pcap
Hint: Use -i for interface and -w to write to file
```

**Q4: Network Analysis (25 points)**
```
In a packet capture, you see multiple connections to port 4444. This port is commonly associated with what?

Answer: Metasploit default reverse shell
Hint: It's a common port for penetration testing frameworks
```

**Topics Covered:**
- Protocol analysis (HTTP, HTTPS, DNS, ARP)
- Wireshark filtering
- tcpdump
- TCP three-way handshake
- Attack detection (SYN flood)
- PCAP analysis

---

## Level 4: Memory Forensics and Live Analysis (ADVANCED)

### Example Questions:

**Q1: Short Answer (20 points)**
```
Why is memory forensics important in malware analysis?

Answer: Malware often exists only in memory and may never touch the disk
Hint: Think about fileless malware and persistence
```

**Q2: Command Line (20 points)**
```
What Volatility command lists running processes from a memory dump?

Answer: volatility -f memory.dmp pslist
Hint: The plugin is called pslist
```

**Q3: Memory Forensics (25 points)**
```
What does the "imageinfo" plugin in Volatility determine?

Answer: The operating system profile and suggested profiles for the memory image
Hint: It identifies the OS version and architecture
```

**Q4: Command Line (25 points)**
```
What command extracts a process with PID 1234 from a memory dump using Volatility?

Answer: volatility -f memory.dmp procdump -p 1234 -D output/
Hint: Use procdump with -p for PID and -D for output directory
```

**Topics Covered:**
- Volatility framework
- Process analysis
- Network connections in memory
- Code injection (Process Hollowing, DLL injection)
- Memory scraping
- VAD tree

---

## Level 5: Advanced Malware Analysis & Incident Response (EXPERT)

### Example Questions:

**Q1: Short Answer (25 points)**
```
What is the difference between static and dynamic malware analysis?

Answer: Static analyzes code without execution, dynamic analyzes behavior during execution
Hint: Think about whether the malware is running or not
```

**Q2: Short Answer (25 points)**
```
What does "packing" mean in the context of malware?

Answer: Compressing or encrypting malware code to evade detection
Hint: It obfuscates the malware's true functionality
```

**Q3: Command Line (20 points)**
```
Which command shows all strings in a binary file that are at least 8 characters long?

Answer: strings -n 8 malware.exe
Hint: Use the strings command with -n parameter
```

**Q4: Short Answer (30 points)**
```
What is the MITRE ATT&CK framework used for?

Answer: A knowledge base of adversary tactics and techniques based on real-world observations
Hint: ATT&CK stands for Adversarial Tactics, Techniques, and Common Knowledge
```

**Q5: Command Line (20 points)**
```
What command calculates the SHA-256 hash of a file named malware.exe in Linux?

Answer: sha256sum malware.exe
Hint: The command name includes the hash algorithm
```

**Q6: Short Answer (30 points)**
```
What registry key is commonly used by malware for persistence on Windows?

Answer: HKEY_LOCAL_MACHINE\Software\Microsoft\Windows\CurrentVersion\Run
Hint: It auto-runs programs at startup
```

**Topics Covered:**
- Static vs. dynamic analysis
- Reverse engineering (IDA Pro, Ghidra)
- Malware packing/unpacking
- Sandboxing
- Polymorphic malware
- YARA rules
- IoC (Indicators of Compromise)
- MITRE ATT&CK
- Cyber Kill Chain
- APT analysis
- Incident response

---

## Answer Validation

All answers use **case-insensitive matching**:

```javascript
// Example answer variations that would be accepted:
"HTTPS" ✅
"https" ✅
"Https" ✅

"Secure and isolate the scene" ✅
"secure and isolate the scene" ✅
"SECURE AND ISOLATE THE SCENE" ✅
```

---

## Points Distribution

| Difficulty | Avg Points/Task | Total Points |
|------------|----------------|--------------|
| BEGINNER | 13 | 130 |
| INTERMEDIATE | 15-16 | 370 |
| ADVANCED | 19 | 230 |
| EXPERT | 22 | 330 |

**Total Available Points:** 1,060

---

## Task Type Examples

### MULTIPLE_CHOICE
Users select from predefined options (implementation dependent)

### TRUE_FALSE
Answer must be exactly `true` or `false`

### SHORT_ANSWER
Free-form text that matches the expected answer

### COMMAND_LINE
Exact command syntax required (some variation allowed)

### FILE_ANALYSIS
Technical analysis of file structures and formats

### NETWORK_ANALYSIS
Network traffic analysis and interpretation

### MEMORY_FORENSICS
RAM analysis and volatile data examination

---

## Hints System

Each task includes a hint that:
- Provides guidance without revealing the answer
- Can be requested via `PUT /api/progress/hint`
- May incur a 20% point penalty
- Helps students learn rather than just guess

Example:
```javascript
{
  question: "What protocol operates on TCP port 443?",
  hint: "It's the secure version of HTTP",
  // User can deduce HTTPS from the hint
}
```

---

## Difficulty Progression

### BEGINNER (Level 1)
- Foundational concepts
- Terminology
- Basic procedures
- Simple commands

### INTERMEDIATE (Levels 2-3)
- Tool usage
- Analysis techniques
- Command syntax
- Technical understanding

### ADVANCED (Level 4)
- Complex tools (Volatility)
- Multi-step procedures
- Advanced concepts
- In-depth analysis

### EXPERT (Level 5)
- Sophisticated techniques
- Framework knowledge
- Real-world scenarios
- Incident response

---

## Learning Objectives

### Level 1: Introduction
Students will understand:
- Forensic investigation principles
- Evidence handling procedures
- Basic acquisition techniques
- Data integrity verification

### Level 2: File Systems
Students will be able to:
- Analyze NTFS structures
- Recover deleted files
- Create timelines
- Identify file signatures

### Level 3: Network Forensics
Students will be able to:
- Capture network traffic
- Filter and analyze packets
- Identify attack patterns
- Reconstruct network sessions

### Level 4: Memory Forensics
Students will be able to:
- Analyze memory dumps
- Detect malware in RAM
- Extract process information
- Identify code injection

### Level 5: Malware & IR
Students will be able to:
- Perform malware analysis
- Use reverse engineering tools
- Follow incident response procedures
- Apply threat intelligence frameworks

---

## Real-World Scenarios

Each level includes tasks based on:
- Industry-standard tools (Volatility, Wireshark, Sleuth Kit)
- Actual forensic procedures
- Common investigation scenarios
- Professional certifications (GCFE, GCFA, GREM)

---

## Testing Your Knowledge

Try answering these without looking at the answers:

1. What is the first ACPO principle?
2. What does MFT stand for?
3. What port does DNS use by default?
4. What is the Volatility plugin for listing processes?
5. What does APT stand for?

<details>
<summary>Answers</summary>

1. No action should change data held on a computer or storage media
2. Master File Table
3. UDP port 53
4. pslist
5. Advanced Persistent Threat
</details>

---

## Additional Resources

After completing these levels, students should explore:
- **SANS Digital Forensics courses**
- **Autopsy** - Open source digital forensics platform
- **SIFT Workstation** - Forensic toolkit
- **Real CTF challenges** - Practice platforms
- **Industry certifications** - GCFE, GCFA, GREM, EnCE

---

## Feedback and Improvement

The seed data can be extended with:
- More difficulty levels
- Additional task types
- Multimedia content
- Interactive simulations
- Real case studies
- Tool-specific training

See `SEED_DATA.md` for modification guidelines.
