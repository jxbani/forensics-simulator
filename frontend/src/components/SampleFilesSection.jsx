import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Download, FileText, Network, Cpu, HardDrive, ChevronDown, ChevronUp,
  Info, Clock, FileWarning, Shield, Eye, BookOpen, ExternalLink, Zap
} from 'lucide-react';

/**
 * Sample forensic evidence files database
 */
const SAMPLE_FILES = {
  network: [
    {
      id: 'http-traffic',
      name: 'http_traffic.pcap',
      description: 'HTTP web traffic with potential data exfiltration',
      size: '500 KB',
      fileType: 'Network Capture',
      difficulty: 'Beginner',
      estimatedTime: '15-20 minutes',
      icon: Network,
      whatYouWillFind: [
        'Normal web browsing patterns',
        'Suspicious POST requests to unknown domains',
        'Unencrypted credentials in HTTP traffic',
        'Potential data exfiltration attempts'
      ],
      recommendedTool: 'Wireshark',
      downloadUrl: 'https://wiki.wireshark.org/SampleCaptures?action=AttachFile&do=get&target=http.cap',
      analysisGuideUrl: 'https://www.wireshark.org/docs/wsug_html_chunked/ChapterWork.html'
    },
    {
      id: 'malware-c2',
      name: 'malware_c2.pcap',
      description: 'Command & Control communication patterns',
      size: '1.2 MB',
      fileType: 'Network Capture',
      difficulty: 'Intermediate',
      estimatedTime: '30-45 minutes',
      icon: Network,
      whatYouWillFind: [
        'Beacon traffic at regular intervals',
        'Encrypted command and control channels',
        'DNS tunneling attempts',
        'Suspicious TLS/SSL certificates',
        'Unusual port usage'
      ],
      recommendedTool: 'Wireshark',
      downloadUrl: 'https://www.malware-traffic-analysis.net/training-exercises.html',
      analysisGuideUrl: 'https://www.malware-traffic-analysis.net/'
    },
    {
      id: 'dns-exfiltration',
      name: 'dns_exfiltration.pcap',
      description: 'DNS-based data exfiltration example',
      size: '800 KB',
      fileType: 'Network Capture',
      difficulty: 'Advanced',
      estimatedTime: '45-60 minutes',
      icon: Network,
      whatYouWillFind: [
        'DNS queries with encoded data in subdomains',
        'Unusually long DNS query strings',
        'High volume of DNS requests to single domain',
        'Non-standard DNS record types'
      ],
      recommendedTool: 'Wireshark',
      downloadUrl: 'https://digitalcorpora.org/corpora/network-packet-dumps',
      analysisGuideUrl: 'https://digitalcorpora.org/'
    }
  ],
  memory: [
    {
      id: 'infected-system',
      name: 'infected_system.raw',
      description: 'Memory dump from infected Windows 10 system',
      size: '256 MB',
      fileType: 'Memory Dump',
      difficulty: 'Intermediate',
      estimatedTime: '45-60 minutes',
      icon: Cpu,
      whatYouWillFind: [
        'Malicious processes running in memory',
        'Code injection evidence',
        'Hidden or rootkit processes',
        'Suspicious network connections',
        'Malware artifacts in process memory'
      ],
      recommendedTool: 'Volatility',
      downloadUrl: 'https://github.com/volatilityfoundation/volatility/wiki/Memory-Samples',
      analysisGuideUrl: 'https://volatility3.readthedocs.io/'
    },
    {
      id: 'ransomware-mem',
      name: 'ransomware.mem',
      description: 'System memory captured during ransomware execution',
      size: '512 MB',
      fileType: 'Memory Dump',
      difficulty: 'Advanced',
      estimatedTime: '60-90 minutes',
      icon: Cpu,
      whatYouWillFind: [
        'Active encryption processes',
        'Ransom note in memory',
        'File system manipulation evidence',
        'Persistence mechanisms',
        'Command-line arguments revealing attack pattern'
      ],
      recommendedTool: 'Volatility',
      downloadUrl: 'https://github.com/volatilityfoundation/volatility/wiki/Memory-Samples',
      analysisGuideUrl: 'https://www.sans.org/reading-room/whitepapers/forensics/memory-forensics-36537'
    }
  ],
  disk: [
    {
      id: 'evidence-disk',
      name: 'evidence_disk.dd',
      description: 'Disk image with deleted files and browser artifacts',
      size: '1 GB',
      fileType: 'Disk Image',
      difficulty: 'Beginner',
      estimatedTime: '30-45 minutes',
      icon: HardDrive,
      whatYouWillFind: [
        'Deleted documents recoverable via file carving',
        'Browser history and cache files',
        'Recently accessed files',
        'File system timeline',
        'User account artifacts'
      ],
      recommendedTool: 'Autopsy',
      downloadUrl: 'https://www.cfreds.nist.gov/',
      analysisGuideUrl: 'https://www.autopsy.com/support/'
    },
    {
      id: 'usb-drive',
      name: 'usb_drive.e01',
      description: 'USB drive forensic image (EnCase format)',
      size: '256 MB',
      fileType: 'Disk Image',
      difficulty: 'Intermediate',
      estimatedTime: '30-45 minutes',
      icon: HardDrive,
      whatYouWillFind: [
        'Hidden files and alternate data streams',
        'File carving opportunities',
        'Deleted file recovery examples',
        'Timestamp analysis',
        'Partition analysis'
      ],
      recommendedTool: 'FTK Imager',
      downloadUrl: 'https://digitalcorpora.org/corpora/disk-images',
      analysisGuideUrl: 'https://www.exterro.com/ftk-imager'
    },
    {
      id: 'windows-system',
      name: 'windows_system.img',
      description: 'Windows system disk with malware artifacts',
      size: '2 GB',
      fileType: 'Disk Image',
      difficulty: 'Advanced',
      estimatedTime: '90-120 minutes',
      icon: HardDrive,
      whatYouWillFind: [
        'Windows registry hives with malware entries',
        'Scheduled tasks for persistence',
        'Prefetch files showing execution history',
        'Event logs with security events',
        'Suspicious executable files'
      ],
      recommendedTool: 'Autopsy',
      downloadUrl: 'https://www.cfreds.nist.gov/data_leakage_case/data-leakage-case.html',
      analysisGuideUrl: 'https://www.sans.org/blog/digital-forensics-sample-images/'
    }
  ]
};

/**
 * SampleFileCard - Individual sample file card component
 */
const SampleFileCard = ({ file }) => {
  const Icon = file.icon;

  // Get difficulty color
  const getDifficultyColor = (difficulty) => {
    const colors = {
      Beginner: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      Intermediate: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      Advanced: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return colors[difficulty] || colors.Intermediate;
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 hover:shadow-lg transition-all duration-200 hover:border-indigo-300 dark:hover:border-indigo-600">
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0 p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
          <Icon className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {file.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs text-gray-600 dark:text-gray-400">{file.size}</span>
            <span className="text-xs text-gray-400 dark:text-gray-500">•</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${getDifficultyColor(file.difficulty)}`}>
              {file.difficulty}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
        {file.description}
      </p>

      {/* File Type Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded font-medium">
          {file.fileType}
        </span>
        <span className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {file.estimatedTime}
        </span>
      </div>

      {/* What You'll Find */}
      <div className="mb-4">
        <div className="flex items-center gap-1 mb-2">
          <Eye className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
          <h5 className="text-xs font-semibold text-gray-900 dark:text-gray-100">
            What you'll find:
          </h5>
        </div>
        <ul className="space-y-1">
          {file.whatYouWillFind.slice(0, 3).map((item, index) => (
            <li key={index} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1">
              <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
              <span>{item}</span>
            </li>
          ))}
          {file.whatYouWillFind.length > 3 && (
            <li className="text-xs text-gray-500 dark:text-gray-500 italic">
              +{file.whatYouWillFind.length - 3} more findings...
            </li>
          )}
        </ul>
      </div>

      {/* Recommended Tool */}
      <div className="flex items-center gap-1 mb-4 p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
        <Zap className="w-3 h-3 text-blue-600 dark:text-blue-400" />
        <span className="text-xs text-blue-800 dark:text-blue-300">
          Best with: <strong>{file.recommendedTool}</strong>
        </span>
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <a
          href={file.downloadUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </a>
        {file.analysisGuideUrl && (
          <a
            href={file.analysisGuideUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-3 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
            title="View Analysis Guide"
          >
            <BookOpen className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  );
};

SampleFileCard.propTypes = {
  file: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    size: PropTypes.string.isRequired,
    fileType: PropTypes.string.isRequired,
    difficulty: PropTypes.string.isRequired,
    estimatedTime: PropTypes.string.isRequired,
    icon: PropTypes.elementType.isRequired,
    whatYouWillFind: PropTypes.arrayOf(PropTypes.string).isRequired,
    recommendedTool: PropTypes.string.isRequired,
    downloadUrl: PropTypes.string.isRequired,
    analysisGuideUrl: PropTypes.string
  }).isRequired
};

/**
 * SampleFilesSection - Expandable section with sample forensic evidence files
 */
const SampleFilesSection = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Get filtered files based on category
  const getFilteredFiles = () => {
    if (selectedCategory === 'all') {
      return [
        ...SAMPLE_FILES.network,
        ...SAMPLE_FILES.memory,
        ...SAMPLE_FILES.disk
      ];
    }
    return SAMPLE_FILES[selectedCategory] || [];
  };

  const filteredFiles = getFilteredFiles();

  // Calculate totals
  const totalFiles = Object.values(SAMPLE_FILES).reduce((sum, arr) => sum + arr.length, 0);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
      {/* Header - Always Visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
      >
        <div className="flex items-center gap-4">
          <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl">
            <Download className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
              Download Sample Evidence Files
              <span className="text-sm px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400 rounded-full font-medium">
                {totalFiles} samples
              </span>
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Practice your forensic analysis skills with real-world sample files
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isExpanded && (
            <span className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">
              Click to explore
            </span>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          )}
        </div>
      </button>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-6 pb-6 animate-slide-in-from-bottom-2">
          {/* Info Banner */}
          <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                  About These Samples
                </h3>
                <p className="text-sm text-blue-800 dark:text-blue-200">
                  These sample files are sourced from public forensics datasets and educational resources.
                  They contain realistic forensic evidence for training and testing purposes.
                  Use them to practice your analysis skills before working with real evidence.
                </p>
              </div>
            </div>
          </div>

          {/* Category Filter */}
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'all'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              All Files ({totalFiles})
            </button>
            <button
              onClick={() => setSelectedCategory('network')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'network'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Network className="w-4 h-4 inline mr-1" />
              Network ({SAMPLE_FILES.network.length})
            </button>
            <button
              onClick={() => setSelectedCategory('memory')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'memory'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Cpu className="w-4 h-4 inline mr-1" />
              Memory ({SAMPLE_FILES.memory.length})
            </button>
            <button
              onClick={() => setSelectedCategory('disk')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === 'disk'
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <HardDrive className="w-4 h-4 inline mr-1" />
              Disk ({SAMPLE_FILES.disk.length})
            </button>
          </div>

          {/* Sample Files Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFiles.map((file) => (
              <SampleFileCard key={file.id} file={file} />
            ))}
          </div>

          {/* Educational Resources Footer */}
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-200 dark:border-gray-600">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              Additional Learning Resources
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <a
                href="https://www.sans.org/blog/digital-forensics-sample-images/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">SANS Forensics</span>
              </a>
              <a
                href="https://digitalcorpora.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Digital Corpora</span>
              </a>
              <a
                href="https://wiki.wireshark.org/SampleCaptures"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-600 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span className="text-sm text-gray-700 dark:text-gray-300">Wireshark Samples</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SampleFilesSection;
