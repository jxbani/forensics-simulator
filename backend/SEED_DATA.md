# Seed Data Documentation

## Overview

The seed script populates the database with **5 comprehensive forensics training levels** containing **59 total tasks** across various digital forensics topics.

## Levels Overview

### Level 1: Introduction to Digital Forensics
- **Difficulty:** BEGINNER
- **Tasks:** 10
- **Total Points:** 130
- **Topics Covered:**
  - Digital crime scene management
  - Chain of custody procedures
  - ACPO principles
  - Forensic imaging
  - Write-blockers
  - Hash verification (SHA-256)
  - Order of volatility
  - Basic acquisition commands

**Key Learning Objectives:**
- Understanding fundamental forensics principles
- Evidence handling and documentation
- Forensic acquisition basics
- Data integrity verification

---

### Level 2: File System Forensics
- **Difficulty:** INTERMEDIATE
- **Tasks:** 12
- **Total Points:** 195
- **Topics Covered:**
  - Master File Table (MFT) analysis
  - File carving techniques
  - Timeline analysis (MAC times)
  - Slack space examination
  - NTFS attributes ($DATA, $MFT)
  - Alternate Data Streams (ADS)
  - File signatures/magic numbers
  - The Sleuth Kit (TSK) tools

**Key Learning Objectives:**
- NTFS and ext4 file system structures
- Deleted file recovery
- Metadata analysis
- Timeline construction

---

### Level 3: Network Forensics and Traffic Analysis
- **Difficulty:** INTERMEDIATE
- **Tasks:** 12
- **Total Points:** 175
- **Topics Covered:**
  - Protocol analysis (HTTP, HTTPS, DNS, ARP)
  - Packet capture with tcpdump
  - Wireshark filtering
  - TCP/IP fundamentals
  - Attack pattern recognition (SYN flood)
  - Network session reconstruction
  - Common malicious ports
  - PCAP file formats

**Key Learning Objectives:**
- Network protocol understanding
- Traffic pattern analysis
- Wireshark proficiency
- Attack detection

---

### Level 4: Memory Forensics and Live Analysis
- **Difficulty:** ADVANCED
- **Tasks:** 12
- **Total Points:** 230
- **Topics Covered:**
  - Volatility framework
  - Process analysis (pslist, pstree)
  - Network connection enumeration
  - Code injection detection (Process Hollowing, DLL injection)
  - Memory acquisition
  - Registry hive analysis
  - VAD tree examination
  - Encryption key recovery

**Key Learning Objectives:**
- RAM analysis techniques
- Malware detection in memory
- Process memory examination
- Volatility plugin usage

---

### Level 5: Advanced Malware Analysis and Incident Response
- **Difficulty:** EXPERT
- **Tasks:** 15
- **Total Points:** 330
- **Topics Covered:**
  - Static vs. dynamic analysis
  - Reverse engineering (IDA Pro, Ghidra)
  - Malware packing/unpacking (UPX)
  - Sandbox analysis
  - Polymorphic malware
  - YARA rules
  - Indicators of Compromise (IoC)
  - MITRE ATT&CK framework
  - Cyber Kill Chain
  - APT analysis
  - Incident response phases
  - Persistence mechanisms

**Key Learning Objectives:**
- Advanced malware analysis
- Reverse engineering basics
- Incident response procedures
- Threat intelligence

---

## Task Type Distribution

| Task Type | Count | Description |
|-----------|-------|-------------|
| SHORT_ANSWER | 23 | Free-form text answers |
| TRUE_FALSE | 18 | Boolean questions |
| MULTIPLE_CHOICE | 10 | Multiple choice questions |
| COMMAND_LINE | 8 | Command-line syntax tasks |
| FILE_ANALYSIS | 3 | File structure analysis |
| NETWORK_ANALYSIS | 3 | Network traffic analysis |
| MEMORY_FORENSICS | 3 | Memory dump analysis |

**Total Tasks:** 59

---

## Difficulty Distribution

| Difficulty | Levels | Total Tasks | Total Points |
|------------|--------|-------------|--------------|
| BEGINNER | 1 | 10 | 130 |
| INTERMEDIATE | 2 | 24 | 370 |
| ADVANCED | 1 | 12 | 230 |
| EXPERT | 1 | 15 | 330 |

**Total Points Available:** 1,060

---

## Running the Seed Script

### Prerequisites

1. Database setup and running
2. Prisma migrations applied
3. Environment variables configured

### Commands

```bash
# Option 1: Using npm script
npm run db:seed

# Option 2: Using Prisma seed
npx prisma db seed

# Option 3: Direct execution
node prisma/seed.js
```

### What the Script Does

1. **Clears existing data** (optional):
   - UserAnswer records
   - Task records
   - Level records
   - Achievement records
   - Progress records

2. **Creates 5 levels** with detailed information:
   - Title
   - Description
   - Difficulty level
   - Order index

3. **Creates 59 tasks** across all levels:
   - Questions
   - Task types
   - Correct answers
   - Points
   - Hints
   - Order indices

4. **Displays summary**:
   - Total levels created
   - Total tasks created
   - Breakdown by difficulty
   - Task type distribution

### Expected Output

```
🌱 Starting database seed...

🗑️  Clearing existing data...
✅ Existing data cleared

📚 Creating levels and tasks...

✅ Created Level 1: "Introduction to Digital Forensics"
   Difficulty: BEGINNER
   Tasks: 10
   Total Points: 130

✅ Created Level 2: "File System Forensics"
   Difficulty: INTERMEDIATE
   Tasks: 12
   Total Points: 195

...

📊 Seed Summary:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Total Levels Created: 5
✅ Total Tasks Created: 59
✅ Average Tasks per Level: 11.8

📈 Breakdown by Difficulty:
   BEGINNER: 1 level(s)
   INTERMEDIATE: 2 level(s)
   ADVANCED: 1 level(s)
   EXPERT: 1 level(s)

🎯 Task Types:
   SHORT_ANSWER: 23
   TRUE_FALSE: 18
   MULTIPLE_CHOICE: 10
   COMMAND_LINE: 8
   FILE_ANALYSIS: 3
   NETWORK_ANALYSIS: 3
   MEMORY_FORENSICS: 3

🎉 Database seeded successfully!
```

---

## Verification

After seeding, verify the data using Prisma Studio:

```bash
npm run prisma:studio
```

Or query the database:

```bash
# Count levels
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Level\";"

# Count tasks
npx prisma db execute --stdin <<< "SELECT COUNT(*) FROM \"Task\";"
```

---

## Sample Task Examples

### Beginner Task (Level 1)
```javascript
{
  question: 'What is the first step when arriving at a digital crime scene?',
  type: 'MULTIPLE_CHOICE',
  correctAnswer: 'Secure and isolate the scene',
  points: 10,
  hint: 'Think about preventing evidence contamination'
}
```

### Intermediate Task (Level 3)
```javascript
{
  question: 'What tcpdump command captures all traffic on interface eth0 and saves it to capture.pcap?',
  type: 'COMMAND_LINE',
  correctAnswer: 'tcpdump -i eth0 -w capture.pcap',
  points: 20,
  hint: 'Use -i for interface and -w to write to file'
}
```

### Advanced Task (Level 4)
```javascript
{
  question: 'What Volatility command lists running processes from a memory dump?',
  type: 'COMMAND_LINE',
  correctAnswer: 'volatility -f memory.dmp pslist',
  points: 20,
  hint: 'The plugin is called pslist'
}
```

### Expert Task (Level 5)
```javascript
{
  question: 'What is the MITRE ATT&CK framework used for?',
  type: 'SHORT_ANSWER',
  correctAnswer: 'A knowledge base of adversary tactics and techniques based on real-world observations',
  points: 30,
  hint: 'ATT&CK stands for Adversarial Tactics, Techniques, and Common Knowledge'
}
```

---

## Answer Validation

Answers are validated using **case-insensitive comparison**:

```javascript
answer.trim().toLowerCase() === correctAnswer.trim().toLowerCase()
```

This allows for minor variations in user input while maintaining accuracy requirements.

---

## Extending the Seed Data

To add more levels or modify existing ones:

1. Edit `prisma/seed.js`
2. Add/modify entries in the `levelsData` array
3. Follow the existing structure:

```javascript
{
  title: 'Your Level Title',
  description: 'Level description',
  difficulty: 'BEGINNER', // BEGINNER, INTERMEDIATE, ADVANCED, EXPERT
  orderIndex: 6, // Next sequential number
  tasks: [
    {
      question: 'Your question?',
      type: 'MULTIPLE_CHOICE', // See TaskType enum
      correctAnswer: 'The correct answer',
      points: 20,
      hint: 'Optional hint text',
      orderIndex: 1,
    },
    // More tasks...
  ],
}
```

4. Re-run the seed script

---

## Task Type Guidelines

### MULTIPLE_CHOICE
- Provide the exact answer text
- Can include multiple valid answers separated by "or"

### TRUE_FALSE
- Answer must be exactly "true" or "false" (lowercase)

### SHORT_ANSWER
- Accept reasonable variations
- Use key terms in the correct answer

### COMMAND_LINE
- Include exact command syntax
- Users may omit optional flags

### FILE_ANALYSIS / NETWORK_ANALYSIS / MEMORY_FORENSICS
- Technical analysis questions
- May require specific formats (e.g., hex values)

---

## Troubleshooting

### Error: "Unique constraint failed"
- The database already has data
- The script will clear existing data automatically
- If issues persist, manually clear the database

### Error: "Cannot find module"
- Ensure `@prisma/client` is installed
- Run `npm install` in the backend directory
- Generate Prisma client: `npm run prisma:generate`

### Error: "Environment variable not found: DATABASE_URL"
- Check `.env` file exists in backend directory
- Verify `DATABASE_URL` is set correctly
- Example: `DATABASE_URL="postgresql://user:pass@localhost:5432/forensics_simulator"`

---

## Integration with API

Once seeded, the data is immediately available through:

- `GET /api/levels` - List all levels
- `GET /api/levels/:id` - Get specific level
- `GET /api/levels/:id/tasks` - Get level tasks

Users can then:
- Submit answers via `POST /api/progress/submit`
- Request hints via `PUT /api/progress/hint`
- Complete levels via `POST /api/progress/complete-level`

---

## Best Practices

1. **Always seed after migrations** to ensure fresh data
2. **Test the seed script** in development before production
3. **Backup production data** before re-seeding
4. **Version control** seed data changes
5. **Document custom modifications** to seed data

---

## Future Enhancements

Potential additions to seed data:

- [ ] Additional difficulty levels
- [ ] More task types (drag-and-drop, matching)
- [ ] Multimedia content (images, videos)
- [ ] Real-world case studies
- [ ] CTF-style challenges
- [ ] Certification preparation modules
- [ ] Tool-specific training paths
- [ ] Industry-specific scenarios

---

## Related Documentation

- **API_ENDPOINTS.md** - Complete API reference
- **TESTING_GUIDE.md** - Testing instructions
- **README.md** - Project overview
- **prisma/schema.prisma** - Database schema
