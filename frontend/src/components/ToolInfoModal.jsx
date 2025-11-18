import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  X, BookOpen, FileType, Lightbulb, Terminal, ExternalLink,
  CheckCircle, AlertCircle, Play, FileText, HardDrive, Network,
  Cpu, Archive, Zap, Search, Clock
} from 'lucide-react';

/**
 * Tool information database
 */
const TOOL_INFO = {
  volatility: {
    name: 'Volatility 3',
    icon: Cpu,
    tagline: 'Advanced Memory Forensics Framework',
    description: 'Volatility is the world\'s most widely used framework for extracting digital artifacts from volatile memory (RAM) samples. It provides a powerful platform for incident response and malware analysis.',
    longDescription: 'Volatility 3 is a complete rewrite of the framework, providing a more modular and extensible architecture. It supports Windows, Linux, and Mac memory analysis with a comprehensive plugin system.',
    supportedFormats: [
      { ext: '.raw', desc: 'Raw memory dump', icon: FileText },
      { ext: '.mem', desc: 'Memory dump file', icon: Cpu },
      { ext: '.dmp', desc: 'Windows dump file', icon: FileType },
      { ext: '.vmem', desc: 'VMware memory file', icon: HardDrive }
    ],
    usageSteps: [
      'Upload your memory dump file to the evidence section',
      'Select Volatility from the available tools',
      'Choose the memory dump you want to analyze',
      'Click "Launch Volatility" to start the container',
      'Access the web interface through the provided URL',
      'Run plugins using the command interface'
    ],
    commonCommands: [
      {
        command: 'windows.pslist',
        description: 'List all running processes',
        example: 'vol.py -f memory.dmp windows.pslist'
      },
      {
        command: 'windows.netscan',
        description: 'Scan for network connections and sockets',
        example: 'vol.py -f memory.dmp windows.netscan'
      },
      {
        command: 'windows.filescan',
        description: 'Scan for file objects in memory',
        example: 'vol.py -f memory.dmp windows.filescan'
      },
      {
        command: 'windows.dlllist',
        description: 'List loaded DLLs for each process',
        example: 'vol.py -f memory.dmp windows.dlllist'
      },
      {
        command: 'windows.cmdline',
        description: 'Display process command-line arguments',
        example: 'vol.py -f memory.dmp windows.cmdline'
      }
    ],
    useCases: [
      'Malware analysis and detection',
      'Incident response investigations',
      'Rootkit detection',
      'Finding evidence of data exfiltration',
      'Analyzing running processes and network connections',
      'Memory-based threat hunting'
    ],
    tips: [
      'Always start with windows.pslist to get an overview of running processes',
      'Look for suspicious process names or unusual parent-child relationships',
      'Use windows.netscan to identify unexpected network connections',
      'Compare process lists with known-good baselines',
      'Check for processes running from unusual locations (e.g., Temp directories)',
      'Use windows.malfind to detect code injection and hidden processes'
    ],
    officialDocs: 'https://volatility3.readthedocs.io/',
    videoTutorial: 'https://www.youtube.com/embed/Uk3DEgY5Yd8',
    difficulty: 'Advanced',
    estimatedTime: '30-60 minutes'
  },

  wireshark: {
    name: 'Wireshark',
    icon: Network,
    tagline: 'World\'s Most Popular Network Protocol Analyzer',
    description: 'Wireshark is a free and open-source packet analyzer used for network troubleshooting, analysis, software and protocol development, and education.',
    longDescription: 'With Wireshark, you can capture and interactively browse the traffic running on a computer network. It provides deep inspection of hundreds of protocols, live capture and offline analysis, and powerful display filters.',
    supportedFormats: [
      { ext: '.pcap', desc: 'Packet capture file', icon: Network },
      { ext: '.pcapng', desc: 'PCAP next generation', icon: Network },
      { ext: '.cap', desc: 'Capture file', icon: FileText }
    ],
    usageSteps: [
      'Upload your network capture file (.pcap or .pcapng)',
      'Select Wireshark from the available tools',
      'Choose the packet capture you want to analyze',
      'Launch Wireshark container',
      'Open the web interface',
      'Use display filters to analyze specific traffic'
    ],
    commonCommands: [
      {
        command: 'tcp.port == 80',
        description: 'Filter HTTP traffic on port 80',
        example: 'Display filter: tcp.port == 80'
      },
      {
        command: 'ip.addr == 192.168.1.100',
        description: 'Show traffic to/from specific IP',
        example: 'Display filter: ip.addr == 192.168.1.100'
      },
      {
        command: 'http.request',
        description: 'Show only HTTP requests',
        example: 'Display filter: http.request'
      },
      {
        command: 'dns',
        description: 'Show all DNS traffic',
        example: 'Display filter: dns'
      },
      {
        command: 'tcp.flags.syn == 1',
        description: 'Show TCP SYN packets (connection attempts)',
        example: 'Display filter: tcp.flags.syn == 1'
      }
    ],
    useCases: [
      'Network forensics and investigation',
      'Detecting malicious network activity',
      'Analyzing data exfiltration',
      'Investigating network intrusions',
      'Protocol analysis and troubleshooting',
      'Identifying command and control traffic'
    ],
    tips: [
      'Use display filters (not capture filters) to narrow down results',
      'Right-click packets and "Follow TCP Stream" to see full conversations',
      'Use Statistics > Protocol Hierarchy to get an overview',
      'Export objects (File > Export Objects) to extract files from traffic',
      'Use the "contains" operator to search for text in packets',
      'Apply time filters to focus on specific incident windows'
    ],
    officialDocs: 'https://www.wireshark.org/docs/',
    videoTutorial: 'https://www.youtube.com/embed/lb1Dw0elw0Q',
    difficulty: 'Intermediate',
    estimatedTime: '20-45 minutes'
  },

  autopsy: {
    name: 'Autopsy',
    icon: Search,
    tagline: 'Digital Forensics Platform',
    description: 'Autopsy is a digital forensics platform and graphical interface to The Sleuth Kit and other digital forensics tools. It is used by law enforcement, military, and corporate examiners.',
    longDescription: 'Autopsy provides a comprehensive digital investigation platform with modules for timeline analysis, keyword search, web artifacts, email analysis, and much more. It makes it easier to analyze hard drives and smartphones.',
    supportedFormats: [
      { ext: '.dd', desc: 'Disk dump image', icon: HardDrive },
      { ext: '.img', desc: 'Disk image file', icon: HardDrive },
      { ext: '.e01', desc: 'EnCase evidence file', icon: Archive },
      { ext: '.vmdk', desc: 'VMware disk image', icon: HardDrive }
    ],
    usageSteps: [
      'Upload your disk image to the evidence section',
      'Select Autopsy from the available tools',
      'Choose the disk image you want to analyze',
      'Launch Autopsy container',
      'Create a new case in Autopsy',
      'Add your disk image as a data source',
      'Run ingest modules to analyze the data',
      'Browse results and generate reports'
    ],
    commonCommands: [
      {
        command: 'Timeline Analysis',
        description: 'Create timeline of file system events',
        example: 'Tools > Timeline > Create Timeline'
      },
      {
        command: 'Keyword Search',
        description: 'Search for specific text across all files',
        example: 'Tools > Keyword Search > Add keywords'
      },
      {
        command: 'Web Artifacts',
        description: 'Extract browser history, cookies, downloads',
        example: 'Results > Web Artifacts'
      },
      {
        command: 'File Type Analysis',
        description: 'Identify files by signature, not extension',
        example: 'Results > File Types'
      },
      {
        command: 'Hash Lookup',
        description: 'Compare file hashes against known databases',
        example: 'Ingest Modules > Hash Lookup'
      }
    ],
    useCases: [
      'Disk forensics and file recovery',
      'Timeline reconstruction',
      'Deleted file recovery',
      'Browser history analysis',
      'Email forensics',
      'Mobile device analysis'
    ],
    tips: [
      'Always create a case before adding data sources',
      'Enable all relevant ingest modules for comprehensive analysis',
      'Use the timeline feature to understand sequence of events',
      'Export results regularly to preserve findings',
      'Tag important items for easy reference',
      'Use keyword lists for automated searching'
    ],
    officialDocs: 'https://www.autopsy.com/support/',
    videoTutorial: 'https://www.youtube.com/embed/GhCZfCzn2l0',
    difficulty: 'Intermediate',
    estimatedTime: '45-90 minutes'
  },

  ftk: {
    name: 'FTK Imager',
    icon: HardDrive,
    tagline: 'Forensic Disk Imaging Tool',
    description: 'FTK Imager is a data preview and imaging tool that lets you quickly assess electronic evidence to determine if further analysis is needed.',
    longDescription: 'FTK Imager can create perfect copies (forensic images) of computer data without making changes to the original evidence. It also allows you to mount evidence files as read-only and preview files and folders.',
    supportedFormats: [
      { ext: '.dd', desc: 'Raw disk dump', icon: HardDrive },
      { ext: '.img', desc: 'Disk image', icon: HardDrive },
      { ext: '.e01', desc: 'EnCase evidence', icon: Archive },
      { ext: '.001', desc: 'FTK image segment', icon: FileType }
    ],
    usageSteps: [
      'Upload the disk or image you want to work with',
      'Select FTK Imager from available tools',
      'Launch the FTK Imager container',
      'Choose "Create Disk Image" for acquisition',
      'Or "Add Evidence Item" to mount existing images',
      'Verify hash values match original evidence',
      'Export files or create reports as needed'
    ],
    commonCommands: [
      {
        command: 'Create Disk Image',
        description: 'Create forensic image of a drive',
        example: 'File > Create Disk Image > Select source'
      },
      {
        command: 'Add Evidence Item',
        description: 'Mount and examine disk images',
        example: 'File > Add Evidence Item > Image File'
      },
      {
        command: 'Verify Drive/Image',
        description: 'Calculate and verify hash values',
        example: 'File > Verify Drive/Image'
      },
      {
        command: 'Export Files',
        description: 'Extract specific files from image',
        example: 'Right-click file > Export Files'
      },
      {
        command: 'Obtain Protected Files',
        description: 'Access system files and registry',
        example: 'File > Obtain Protected Files'
      }
    ],
    useCases: [
      'Creating forensic disk images',
      'Evidence acquisition and preservation',
      'Verifying image integrity with hashes',
      'Quick file preview and triage',
      'Mounting evidence files read-only',
      'Exporting specific files for analysis'
    ],
    tips: [
      'Always verify hash values after creating an image',
      'Use write-blocking when imaging physical drives',
      'Create multiple image formats for compatibility',
      'Document your imaging process thoroughly',
      'Store original evidence and images separately',
      'Use compression for storage efficiency (AD1 format)'
    ],
    officialDocs: 'https://www.exterro.com/ftk-imager',
    videoTutorial: 'https://www.youtube.com/embed/Ua7S6ZaC09w',
    difficulty: 'Beginner',
    estimatedTime: '15-30 minutes'
  }
};

/**
 * ToolInfoModal - Detailed information modal for forensic tools
 */
const ToolInfoModal = ({ toolId, isOpen, onClose }) => {
  // Get tool info
  const toolInfo = TOOL_INFO[toolId];

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Don't render if not open or no tool info
  if (!isOpen || !toolInfo) return null;

  const Icon = toolInfo.icon;

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400',
      Intermediate: 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400',
      Advanced: 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[difficulty] || colors.Intermediate;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      {/* Modal Content */}
      <div
        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl animate-zoom-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                <Icon className="w-10 h-10 text-white" />
              </div>
              <div>
                <h2 id="modal-title" className="text-3xl font-bold text-white mb-1">
                  {toolInfo.name}
                </h2>
                <p className="text-indigo-100 text-lg">{toolInfo.tagline}</p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              aria-label="Close modal"
            >
              <X className="w-6 h-6 text-white" />
            </button>
          </div>

          {/* Metadata */}
          <div className="flex gap-3 mt-4">
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(toolInfo.difficulty)}`}>
              {toolInfo.difficulty}
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white">
              <Clock className="w-3 h-3 inline mr-1" />
              {toolInfo.estimatedTime}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <section>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <BookOpen className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Overview
            </h3>
            <p className="text-gray-700 dark:text-gray-300 mb-2">{toolInfo.description}</p>
            <p className="text-gray-600 dark:text-gray-400 text-sm">{toolInfo.longDescription}</p>
          </section>

          {/* Supported Formats */}
          <section>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <FileType className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Supported File Formats
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {toolInfo.supportedFormats.map((format, index) => {
                const FormatIcon = format.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                  >
                    <FormatIcon className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <div>
                      <div className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
                        {format.ext}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">{format.desc}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Usage Steps */}
          <section>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <Play className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Step-by-Step Usage Guide
            </h3>
            <ol className="space-y-2">
              {toolInfo.usageSteps.map((step, index) => (
                <li key={index} className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-6 h-6 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </span>
                  <span className="text-gray-700 dark:text-gray-300 pt-0.5">{step}</span>
                </li>
              ))}
            </ol>
          </section>

          {/* Common Commands */}
          <section>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <Terminal className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Common Commands & Features
            </h3>
            <div className="space-y-3">
              {toolInfo.commonCommands.map((cmd, index) => (
                <div
                  key={index}
                  className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600"
                >
                  <div className="flex items-start justify-between mb-2">
                    <code className="text-sm font-mono font-semibold text-indigo-600 dark:text-indigo-400">
                      {cmd.command}
                    </code>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">{cmd.description}</p>
                  {cmd.example && (
                    <div className="mt-2 p-2 bg-gray-800 dark:bg-gray-900 rounded">
                      <code className="text-xs text-green-400 font-mono">{cmd.example}</code>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Use Cases */}
          <section>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <Zap className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Common Use Cases
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {toolInfo.useCases.map((useCase, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-900/20 rounded-lg"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{useCase}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Tips */}
          <section>
            <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
              <Lightbulb className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Tips & Best Practices
            </h3>
            <div className="space-y-2">
              {toolInfo.tips.map((tip, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-600 dark:text-yellow-400 mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{tip}</span>
                </div>
              ))}
            </div>
          </section>

          {/* Video Tutorial */}
          {toolInfo.videoTutorial && (
            <section>
              <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
                <Play className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                Video Tutorial
              </h3>
              <div className="aspect-video rounded-lg overflow-hidden bg-gray-900">
                <iframe
                  width="100%"
                  height="100%"
                  src={toolInfo.videoTutorial}
                  title={`${toolInfo.name} Tutorial`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            </section>
          )}

          {/* Documentation Link */}
          <section>
            <a
              href={toolInfo.officialDocs}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full p-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold transition-colors"
            >
              <ExternalLink className="w-5 h-5" />
              View Official Documentation
            </a>
          </section>
        </div>
      </div>
    </div>
  );
};

ToolInfoModal.propTypes = {
  toolId: PropTypes.string.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

export default ToolInfoModal;
