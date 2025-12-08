import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const levelsData = [
  {
    title: 'Initial Investigation',
    description: 'Begin your forensic investigation by analyzing initial evidence including log files, suspicious file locations, and network traffic patterns. This level covers the fundamentals of identifying malicious activity.',
    difficulty: 'BEGINNER',
    orderIndex: 1,
    tasks: [
      {
        question: `Analyze the following web server access log snippet. What is the IP address that made repeated failed login attempts?

Evidence:
192.168.1.100 - - [01/Nov/2024:10:15:23 +0000] "POST /login HTTP/1.1" 200 1234
203.0.113.45 - - [01/Nov/2024:10:16:45 +0000] "POST /login HTTP/1.1" 401 567
203.0.113.45 - - [01/Nov/2024:10:16:47 +0000] "POST /login HTTP/1.1" 401 567
203.0.113.45 - - [01/Nov/2024:10:16:49 +0000] "POST /login HTTP/1.1" 401 567
203.0.113.45 - - [01/Nov/2024:10:16:51 +0000] "POST /login HTTP/1.1" 401 567
192.168.1.105 - - [01/Nov/2024:10:17:00 +0000] "GET /dashboard HTTP/1.1" 200 2345`,
        type: 'LOG_ANALYSIS',
        correctAnswer: '203.0.113.45',
        points: 20,
        hint: 'Look for HTTP status code 401 (Unauthorized) - this indicates failed authentication attempts',
        orderIndex: 1,
      },
      {
        question: `During a forensic examination, you discover a suspicious executable file. Based on standard Windows file system structure, which of the following locations is MOST suspicious for a user-created executable?

A) C:\\Windows\\System32\\calc.exe
B) C:\\Users\\John\\AppData\\Roaming\\svchost.exe
C) C:\\Program Files\\Microsoft Office\\WINWORD.EXE
D) C:\\Windows\\explorer.exe`,
        type: 'FILE_ANALYSIS',
        correctAnswer: 'B',
        points: 25,
        hint: 'Legitimate system processes like svchost.exe should never be located in user AppData folders. This is a common malware tactic to mimic legitimate process names.',
        orderIndex: 2,
      },
      {
        question: `Examine this network traffic capture. A connection to port 4444 was established. What type of malicious activity does this commonly indicate?

Evidence (netstat output):
TCP    192.168.1.50:49234     10.20.30.40:4444      ESTABLISHED
TCP    192.168.1.50:49235     93.184.216.34:443     ESTABLISHED
TCP    192.168.1.50:49236     172.217.14.206:80     ESTABLISHED

Additional Info: Port 4444 is the default port for Metasploit's meterpreter reverse shell.`,
        type: 'NETWORK_ANALYSIS',
        correctAnswer: 'reverse shell',
        points: 30,
        hint: 'Port 4444 is commonly associated with penetration testing frameworks and remote access tools. Think about backdoor connections.',
        orderIndex: 3,
      },
      {
        question: `Based on the log analysis, how many failed login attempts did IP 203.0.113.45 make in total?`,
        type: 'SHORT_ANSWER',
        correctAnswer: '4',
        points: 15,
        hint: 'Count the number of lines with status code 401 from that IP address',
        orderIndex: 4,
      },
      {
        question: `What is the timestamp of the first failed login attempt from the suspicious IP?

Format your answer as: DD/Mon/YYYY:HH:MM:SS`,
        type: 'LOG_ANALYSIS',
        correctAnswer: '01/Nov/2024:10:16:45',
        points: 10,
        hint: 'Look at the first 401 response in the logs',
        orderIndex: 5,
      },
    ],
  },
  {
    title: 'Data Recovery',
    description: 'Master the techniques of recovering deleted files, analyzing file metadata, and reconstructing file timelines. Learn file carving and artifact analysis to uncover hidden evidence.',
    difficulty: 'BEGINNER',
    orderIndex: 2,
    tasks: [
      {
        question: `Examine the following file timeline from an NTFS file system. What was the LAST action performed on the file "financial_data.xlsx"?

Evidence (MFT Timeline):
Filename: financial_data.xlsx
Created:        2024-10-15 09:23:14
Modified:       2024-10-28 14:45:22
Accessed:       2024-10-29 08:12:05
MFT Modified:   2024-10-30 16:34:18

Actions detected:
- File created on October 15
- Content edited on October 28
- File opened (read) on October 29
- File deleted on October 30`,
        type: 'FILE_ANALYSIS',
        correctAnswer: 'deleted',
        points: 20,
        hint: 'MFT (Master File Table) Modified time changing without content modification often indicates file system operations like deletion or rename',
        orderIndex: 1,
      },
      {
        question: `You need to recover deleted image files from an SD card. Which file carving tool is specifically designed for this purpose?

A) Wireshark
B) Volatility
C) PhotoRec
D) Nmap`,
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'C',
        points: 15,
        hint: 'The tool name suggests it recovers photos. It uses file signatures to carve files from raw disk data.',
        orderIndex: 2,
      },
      {
        question: `Analyze the following file metadata. What camera model was used to take this photo?

EXIF Metadata:
=====================================
File Name: IMG_2847.jpg
File Size: 3.2 MB
Image Size: 4032x3024
Camera Make: Apple
Camera Model: iPhone 12 Pro
Date/Time Original: 2024:10:25 15:42:33
GPS Latitude: 40° 44' 54.36" N
GPS Longitude: 73° 59' 8.40" W
GPS Altitude: 10.5 m
Software: iOS 17.1.2`,
        type: 'FILE_ANALYSIS',
        correctAnswer: 'iPhone 12 Pro',
        points: 20,
        hint: 'Look for the "Camera Model" field in the EXIF metadata',
        orderIndex: 3,
      },
      {
        question: `Based on the EXIF metadata above, what are the GPS coordinates of where the photo was taken?

Format: Latitude, Longitude (decimal degrees, 2 decimal places)
Example: 40.75, -73.99`,
        type: 'SHORT_ANSWER',
        correctAnswer: '40.75, -73.99',
        points: 25,
        hint: 'Convert degrees/minutes/seconds to decimal. N is positive, W is negative. The location is in New York City (Central Park area).',
        orderIndex: 4,
      },
      {
        question: `What is the file signature (magic bytes) for a JPEG image file in hexadecimal?`,
        type: 'FILE_ANALYSIS',
        correctAnswer: 'FF D8 FF',
        points: 20,
        hint: 'JPEG files start with these three bytes. This is used by file carving tools to identify image files.',
        orderIndex: 5,
      },
      {
        question: `True or False: File carving can recover deleted files even after the file system metadata has been overwritten.`,
        type: 'TRUE_FALSE',
        correctAnswer: 'true',
        points: 15,
        hint: 'File carving searches for file signatures in raw disk data, independent of file system structures',
        orderIndex: 6,
      },
    ],
  },
  {
    title: 'Memory Analysis',
    description: 'Investigate system memory to detect malware, rootkits, and malicious processes. Learn to analyze memory dumps to identify command and control communications and hidden processes.',
    difficulty: 'INTERMEDIATE',
    orderIndex: 3,
    tasks: [
      {
        question: `You are analyzing a Windows memory dump and found a suspicious process named "svchost.exe".

Process Information:
PID: 1337
Name: svchost.exe
Path: C:\\Users\\Admin\\AppData\\Local\\Temp\\svchost.exe
Parent: explorer.exe (PID: 892)
Command Line: C:\\Users\\Admin\\AppData\\Local\\Temp\\svchost.exe -k netsvcs

Legitimate svchost.exe locations:
- C:\\Windows\\System32\\svchost.exe
- C:\\Windows\\SysWOW64\\svchost.exe

Is this process likely malicious? (Answer: yes or no)`,
        type: 'MEMORY_FORENSICS',
        correctAnswer: 'yes',
        points: 25,
        hint: 'Compare the process path to the legitimate locations. Malware often mimics system process names but runs from user directories.',
        orderIndex: 1,
      },
      {
        question: `Examine this Volatility output showing hidden processes. What rootkit technique is being used?

pslist output (shows 45 processes)
psscan output (shows 47 processes)

Processes found by psscan but NOT in pslist:
- malware.exe (PID: 2456)
- backdoor.exe (PID: 3192)

What technique is being used to hide these processes?`,
        type: 'MEMORY_FORENSICS',
        correctAnswer: 'DKOM',
        points: 30,
        hint: 'DKOM (Direct Kernel Object Manipulation) removes process entries from the active process list while keeping them running. Think about how processes can be hidden from standard enumeration.',
        orderIndex: 2,
      },
      {
        question: `Analyze the following network connections from a memory dump. Which IP address is the Command & Control (C2) server?

Network Connections (netscan output):
192.168.1.100:49823 -> 8.8.8.8:53          DNS        chrome.exe
192.168.1.100:49824 -> 93.184.216.34:443  HTTPS      chrome.exe
192.168.1.100:49825 -> 185.220.101.45:443 HTTPS      svchost.exe (suspicious)
192.168.1.100:49826 -> 172.217.14.206:80  HTTP       firefox.exe

Additional Context:
- 185.220.101.45 is flagged in threat intelligence as a known C2 server
- Connection persists even when browsers are closed
- Encrypted traffic to/from this IP every 60 seconds (beacon behavior)`,
        type: 'NETWORK_ANALYSIS',
        correctAnswer: '185.220.101.45',
        points: 30,
        hint: 'Look for the IP that shows suspicious characteristics: persistent connection, beaconing behavior, and association with the suspicious svchost.exe process',
        orderIndex: 3,
      },
      {
        question: `What Volatility plugin would you use to list all processes in a memory dump?`,
        type: 'COMMAND_LINE',
        correctAnswer: 'pslist',
        points: 15,
        hint: 'The plugin name describes its function: "ps" for processes, "list" for listing them',
        orderIndex: 4,
      },
      {
        question: `True or False: The parent process of all legitimate svchost.exe instances should be services.exe.`,
        type: 'TRUE_FALSE',
        correctAnswer: 'true',
        points: 20,
        hint: 'In Windows, services.exe is the Service Control Manager and launches all legitimate service host processes',
        orderIndex: 5,
      },
    ],
  },
  {
    title: 'Network Analysis',
    description: 'Analyze network traffic to detect data exfiltration, man-in-the-middle attacks, and command & control communications. Master packet analysis and network forensics techniques.',
    difficulty: 'ADVANCED',
    orderIndex: 4,
    tasks: [
      {
        question: `Examine this network traffic capture. Identify the data exfiltration attempt.

Traffic Summary (5-minute window):
Source: 192.168.10.50 -> Destination: 8.8.8.8:53 (DNS)
  - 450 DNS queries
  - Query examples:
    * 4d5a9000.malicious-domain.com
    * 03000000.malicious-domain.com
    * 504500.malicious-domain.com
  - Average query size: 63 bytes
  - Queries contain hex-encoded data

What technique is being used for data exfiltration?`,
        type: 'NETWORK_ANALYSIS',
        correctAnswer: 'DNS tunneling',
        points: 35,
        hint: 'The attacker is encoding data in DNS subdomain queries to exfiltrate information. Notice the hex patterns and high query volume to a suspicious domain.',
        orderIndex: 1,
      },
      {
        question: `Analyze this SSL/TLS certificate presented during a connection. What type of attack is indicated?

Certificate Details:
Subject: CN=www.paypal.com
Issuer: CN=Totally Legitimate CA, O=Not Suspicious Inc
Valid From: 2024-10-01
Valid To: 2025-10-01
Serial Number: 123456789
Signature Algorithm: sha256WithRSAEncryption

Browser Warning: "This certificate is not trusted. The issuer is unknown."

Expected Issuer: DigiCert Inc

What attack is likely occurring?`,
        type: 'NETWORK_ANALYSIS',
        correctAnswer: 'MITM',
        points: 30,
        hint: 'When you see a certificate for a legitimate site (PayPal) but issued by an unknown/suspicious CA, someone is intercepting the connection. Think Man-in-the-Middle.',
        orderIndex: 2,
      },
      {
        question: `Review these DNS queries from a compromised machine. What malware technique is being used?

DNS Queries (last 60 seconds):
- xj4k2m9qpw.com         -> NXDOMAIN
- 9m3kxp2qjw.net         -> NXDOMAIN
- k2m9xjp4qw.org         -> NXDOMAIN
- m9xj2kpq4w.biz         -> NXDOMAIN
- kp2xj9qm4w.info        -> 198.51.100.45 (SUCCESS!)

Pattern Analysis:
- Random-looking domain names
- Algorithmically generated
- High failure rate
- Eventually gets a successful response

What is this technique called?`,
        type: 'NETWORK_ANALYSIS',
        correctAnswer: 'DGA',
        points: 35,
        hint: 'DGA (Domain Generation Algorithm) is used by malware to generate many domains. The C2 server only needs to register one of them to establish communication.',
        orderIndex: 3,
      },
      {
        question: `What is the typical beacon interval (in seconds) for common malware C2 communications? (Common values: 30, 60, 120, or 300)`,
        type: 'SHORT_ANSWER',
        correctAnswer: '60',
        points: 20,
        hint: 'Most malware beacons every 1 minute to check for commands from the C2 server, balancing stealth with responsiveness',
        orderIndex: 4,
      },
      {
        question: `True or False: Encrypted HTTPS traffic can still reveal indicators of compromise through metadata analysis (packet sizes, timing, connection patterns).`,
        type: 'TRUE_FALSE',
        correctAnswer: 'true',
        points: 15,
        hint: 'Even though content is encrypted, traffic analysis can reveal patterns, beacon behavior, and anomalous connection characteristics',
        orderIndex: 5,
      },
      {
        question: `What protocol/port combination was being abused in the DNS tunneling scenario? (Format: PROTOCOL/PORT)`,
        type: 'NETWORK_ANALYSIS',
        correctAnswer: 'DNS/53',
        points: 15,
        hint: 'The question specifically mentions DNS queries. What is the standard port for DNS?',
        orderIndex: 6,
      },
    ],
  },
  {
    title: 'Report Writing',
    description: 'Master the art of documenting your findings, maintaining chain of custody, and creating comprehensive forensic reports. Learn to communicate technical findings effectively to various audiences.',
    difficulty: 'INTERMEDIATE',
    orderIndex: 5,
    tasks: [
      {
        question: `Which of the following should be the FIRST section in a formal forensic investigation report?

A) Technical Analysis and Findings
B) Executive Summary
C) Detailed Evidence Log
D) Methodology and Tools Used
E) Conclusions and Recommendations`,
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'B',
        points: 20,
        hint: 'The first section should provide a high-level overview for non-technical stakeholders (executives, lawyers) who may not read the entire report.',
        orderIndex: 1,
      },
      {
        question: `You are documenting the chain of custody for a seized hard drive. What information is MOST critical to include?

Evidence: Western Digital 1TB HDD, Serial# WD-12345ABC
Seized from: Suspect's home office desk
Date: 2024-11-01 14:30:00

Required Chain of Custody Elements - Select ALL that apply:
1. Date and time of each transfer
2. Name and signature of each person handling evidence
3. Purpose of each transfer
4. Weather conditions during seizure

List the numbers of REQUIRED elements (comma-separated):`,
        type: 'SHORT_ANSWER',
        correctAnswer: '1,2,3',
        points: 25,
        hint: 'Chain of custody must document WHO handled the evidence, WHEN, and WHY. Weather is not typically relevant unless it affected evidence integrity.',
        orderIndex: 2,
      },
      {
        question: `During your investigation, you find evidence that MIGHT indicate illegal activity, but you're not certain. What should you do?

Case: While investigating a data breach, you discover encrypted files with suspicious names like "tor_browser_config" and "offshore_accounts.xlsx" on the suspect's computer. However, you haven't decrypted or examined the contents.

What is the MOST appropriate action?`,
        type: 'SHORT_ANSWER',
        correctAnswer: 'report',
        points: 30,
        hint: 'As a forensic investigator, your role is to document and report ALL findings, even suspicions. Let legal authorities and prosecutors determine significance. Never make legal judgments yourself.',
        orderIndex: 3,
      },
      {
        question: `Complete this forensic report template with the appropriate section:

Executive Summary
Scope and Objectives
Evidence Acquisition
[_______________]  <-- What section goes here?
Analysis and Findings
Conclusions
Appendices`,
        type: 'SHORT_ANSWER',
        correctAnswer: 'Methodology',
        points: 20,
        hint: 'This section describes the tools, techniques, and procedures used during the investigation. It comes after evidence acquisition and before analysis.',
        orderIndex: 4,
      },
      {
        question: `True or False: When writing a forensic report, you should use technical jargon extensively to demonstrate your expertise.`,
        type: 'TRUE_FALSE',
        correctAnswer: 'false',
        points: 15,
        hint: 'Reports should be clear and understandable to various audiences (lawyers, judges, executives). Use plain language and explain technical terms when necessary.',
        orderIndex: 5,
      },
      {
        question: `What is the purpose of maintaining a detailed chain of custody?

A) To track billable hours
B) To prove evidence integrity and admissibility in court
C) To comply with company policy
D) To create busywork documentation`,
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'B',
        points: 20,
        hint: 'Chain of custody is a legal requirement that ensures evidence has not been tampered with and can be trusted in legal proceedings.',
        orderIndex: 6,
      },
      {
        question: `You made an error in your initial analysis and need to correct it in the final report. What should you do?

A) Delete the original finding and replace it
B) Document the error, explain what was wrong, provide corrected analysis
C) Ignore the error and hope nobody notices
D) Start the entire investigation over`,
        type: 'MULTIPLE_CHOICE',
        correctAnswer: 'B',
        points: 25,
        hint: 'Transparency is crucial. Document corrections clearly, explain the mistake, and provide the updated analysis. This maintains credibility.',
        orderIndex: 7,
      },
    ],
  },
];

async function main() {
  console.log('Starting database seeding...');

  try {
    // Clear existing data
    console.log('Clearing existing data...');
    await prisma.achievement.deleteMany({});
    await prisma.userAnswer.deleteMany({});
    await prisma.progress.deleteMany({});
    await prisma.task.deleteMany({});
    await prisma.level.deleteMany({});
    await prisma.user.deleteMany({});

    console.log('Creating levels and tasks...');

    for (const levelData of levelsData) {
      const { tasks, ...levelInfo } = levelData;

      const level = await prisma.level.create({
        data: {
          ...levelInfo,
          tasks: {
            create: tasks,
          },
        },
        include: {
          tasks: true,
        },
      });

      console.log(`✓ Created level: ${level.title} with ${level.tasks.length} tasks`);
    }

    // Get statistics
    const levelCount = await prisma.level.count();
    const taskCount = await prisma.task.count();
    const totalPoints = await prisma.task.aggregate({
      _sum: {
        points: true,
      },
    });

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================');
    console.log(`Total Levels: ${levelCount}`);
    console.log(`Total Tasks: ${taskCount}`);
    console.log(`Total Points Available: ${totalPoints._sum.points}`);
    console.log('========================================\n');

    // Display level summary
    const levels = await prisma.level.findMany({
      include: {
        tasks: true,
      },
      orderBy: {
        orderIndex: 'asc',
      },
    });

    console.log('Level Summary:');
    console.log('----------------------------------------');
    levels.forEach((level) => {
      const levelPoints = level.tasks.reduce((sum, task) => sum + task.points, 0);
      console.log(`${level.orderIndex}. ${level.title}`);
      console.log(`   Difficulty: ${level.difficulty}`);
      console.log(`   Tasks: ${level.tasks.length}`);
      console.log(`   Points: ${levelPoints}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
