import React, { useState, useEffect } from 'react';
import {
  ChevronDown,
  ChevronUp,
  Upload,
  Microscope,
  Play,
  Save,
  CheckCircle2,
  FileText,
  Network,
  HardDrive,
  Cpu,
  Info,
  ExternalLink,
  Video,
  FileType,
  Clock,
  Gauge,
  Download,
  Square,
  BookOpen
} from 'lucide-react';

/**
 * GettingStartedGuide - Collapsible guide for new users of the Forensic Lab
 * Provides step-by-step instructions, tips, and resources
 */
const GettingStartedGuide = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [showOnStartup, setShowOnStartup] = useState(true);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Load preferences from localStorage
  useEffect(() => {
    const savedShowOnStartup = localStorage.getItem('forensicLab_showGuideOnStartup');
    const savedCompletedSteps = localStorage.getItem('forensicLab_completedSteps');
    const savedIsOpen = localStorage.getItem('forensicLab_guideIsOpen');

    if (savedShowOnStartup !== null) {
      setShowOnStartup(savedShowOnStartup === 'true');
    }
    if (savedCompletedSteps) {
      setCompletedSteps(JSON.parse(savedCompletedSteps));
    }
    if (savedIsOpen !== null) {
      setIsOpen(savedIsOpen === 'true');
    }
  }, []);

  // Save show on startup preference
  const handleShowOnStartupChange = (checked) => {
    setShowOnStartup(checked);
    localStorage.setItem('forensicLab_showGuideOnStartup', checked.toString());
  };

  // Toggle guide open/close
  const toggleGuide = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    localStorage.setItem('forensicLab_guideIsOpen', newIsOpen.toString());
  };

  // Mark step as completed
  const toggleStepComplete = (stepNumber) => {
    const newCompletedSteps = completedSteps.includes(stepNumber)
      ? completedSteps.filter(s => s !== stepNumber)
      : [...completedSteps, stepNumber];

    setCompletedSteps(newCompletedSteps);
    localStorage.setItem('forensicLab_completedSteps', JSON.stringify(newCompletedSteps));
  };

  // Step data
  const steps = [
    {
      number: 1,
      title: 'Upload Evidence Files',
      icon: Upload,
      color: 'blue',
      description: 'Start by uploading your forensic evidence files to the platform.',
      details: [
        {
          subtitle: 'Supported File Types',
          icon: FileType,
          items: [
            'Network captures: .pcap, .pcapng, .cap',
            'Memory dumps: .mem, .dmp, .raw, .img',
            'Disk images: .dd, .e01, .aff, .vmdk',
            'Generic files: Any file type for basic analysis'
          ]
        },
        {
          subtitle: 'How to Upload',
          icon: Upload,
          items: [
            'Drag and drop files into the upload area',
            'Click "Browse" to select files from your computer',
            'Files are automatically hashed with SHA256 for integrity',
            'Upload multiple files simultaneously'
          ]
        },
        {
          subtitle: 'File Size Limits',
          icon: Gauge,
          items: [
            'Maximum file size: 10 GB per file',
            'Total storage: 100 GB per user',
            'Large files may take longer to upload',
            'Consider compressing disk images before upload'
          ]
        }
      ]
    },
    {
      number: 2,
      title: 'Select a Forensic Tool',
      icon: Microscope,
      color: 'purple',
      description: 'Choose the appropriate forensic tool based on your evidence type.',
      details: [
        {
          subtitle: 'Wireshark - Network Analysis',
          icon: Network,
          items: [
            'Analyze network packet captures (PCAP files)',
            'Protocol analysis and traffic inspection',
            'Filter and search network communications',
            'Export analysis results and statistics'
          ]
        },
        {
          subtitle: 'Volatility - Memory Forensics',
          icon: Cpu,
          items: [
            'Analyze memory dumps from Windows, Linux, Mac',
            'Extract running processes and network connections',
            'Identify malware and suspicious activity',
            'Timeline analysis and artifact extraction'
          ]
        },
        {
          subtitle: 'Autopsy - Disk Forensics',
          icon: HardDrive,
          items: [
            'Comprehensive disk image analysis',
            'File system timeline creation',
            'Keyword search and file carving',
            'Generate detailed forensic reports'
          ]
        },
        {
          subtitle: 'Network Miner - Traffic Analysis',
          icon: Network,
          items: [
            'Extract files and credentials from PCAP',
            'Host and session analysis',
            'DNS and HTTP traffic parsing',
            'No installation required - runs in browser'
          ]
        }
      ]
    },
    {
      number: 3,
      title: 'Launch and Analyze',
      icon: Play,
      color: 'green',
      description: 'Start your forensic tool container and begin your analysis.',
      details: [
        {
          subtitle: 'Launching Containers',
          icon: Play,
          items: [
            'Select your evidence files when launching a tool',
            'Containers start in 10-30 seconds',
            'Each tool runs in an isolated Docker environment',
            'Access tools through the provided URL'
          ]
        },
        {
          subtitle: 'What to Expect',
          icon: Info,
          items: [
            'Tools open in a new browser tab/window',
            'Full GUI access through web browser',
            'Your evidence files are pre-loaded',
            'Changes are saved within the container session'
          ]
        },
        {
          subtitle: 'Basic Navigation',
          icon: Microscope,
          items: [
            'Use tool-specific menus and interfaces',
            'Right-click for context menus',
            'Keyboard shortcuts work as expected',
            'Save your work frequently within the tool'
          ]
        },
        {
          subtitle: 'Container Management',
          icon: Clock,
          items: [
            'Containers auto-cleanup after 2 hours of inactivity',
            'Monitor resource usage in the Active Tools panel',
            'Restart containers if needed from the panel',
            'Stop containers when analysis is complete'
          ]
        }
      ]
    },
    {
      number: 4,
      title: 'Save Your Findings',
      icon: Save,
      color: 'indigo',
      description: 'Export your analysis results and manage your forensic findings.',
      details: [
        {
          subtitle: 'Saving Results',
          icon: Save,
          items: [
            'Use each tool\'s built-in export features',
            'Save reports in PDF, HTML, or CSV formats',
            'Export filtered packet captures or artifacts',
            'Take screenshots of important findings'
          ]
        },
        {
          subtitle: 'Downloading Reports',
          icon: Download,
          items: [
            'Download files directly from the tool interface',
            'Results are saved to your browser downloads',
            'Keep a local copy of all analysis artifacts',
            'Name files clearly for later reference'
          ]
        },
        {
          subtitle: 'Managing Containers',
          icon: Square,
          items: [
            'Stop containers from the Active Tools panel',
            'Stopping a container ends the session',
            'Unsaved work in the tool will be lost',
            'Evidence files remain safely stored'
          ]
        },
        {
          subtitle: 'Best Practices',
          icon: CheckCircle2,
          items: [
            'Document your analysis methodology',
            'Save interim results frequently',
            'Maintain chain of custody for evidence',
            'Review and validate your findings'
          ]
        }
      ]
    }
  ];

  // Color schemes for each step
  const colorSchemes = {
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-600 dark:text-blue-400',
      badgeBg: 'bg-blue-100 dark:bg-blue-900/50',
      checkBg: 'bg-blue-500',
      hoverBg: 'hover:bg-blue-100 dark:hover:bg-blue-900/30'
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-600 dark:text-purple-400',
      badgeBg: 'bg-purple-100 dark:bg-purple-900/50',
      checkBg: 'bg-purple-500',
      hoverBg: 'hover:bg-purple-100 dark:hover:bg-purple-900/30'
    },
    green: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-600 dark:text-green-400',
      badgeBg: 'bg-green-100 dark:bg-green-900/50',
      checkBg: 'bg-green-500',
      hoverBg: 'hover:bg-green-100 dark:hover:bg-green-900/30'
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-900/20',
      border: 'border-indigo-200 dark:border-indigo-800',
      text: 'text-indigo-600 dark:text-indigo-400',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-900/50',
      checkBg: 'bg-indigo-500',
      hoverBg: 'hover:bg-indigo-100 dark:hover:bg-indigo-900/30'
    }
  };

  return (
    <div className="mb-6">
      {/* Header - Always Visible */}
      <button
        onClick={toggleGuide}
        className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:from-blue-100 hover:to-indigo-100 dark:hover:from-blue-900/30 dark:hover:to-indigo-900/30 transition-all duration-200 shadow-sm"
      >
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 rounded-lg p-2">
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <div className="text-left">
            <span className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
              Getting Started Guide
            </span>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              {completedSteps.length === steps.length
                ? 'All steps completed! 🎉'
                : `${completedSteps.length} of ${steps.length} steps completed`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {completedSteps.length === steps.length && (
            <CheckCircle2 className="w-6 h-6 text-green-500 animate-bounce" />
          )}
          {isOpen ? (
            <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          )}
        </div>
      </button>

      {/* Collapsible Content */}
      {isOpen && (
        <div className="mt-2 bg-white dark:bg-gray-800 border border-blue-200 dark:border-blue-800 rounded-lg shadow-lg overflow-hidden animate-in slide-in-from-top duration-300">
          <div className="p-6">
            {/* Introduction */}
            <div className="mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                Welcome to the Forensic Analysis Lab! Follow these steps to get started with your digital forensics investigation.
                Click on any step to mark it as completed.
              </p>

              {/* Video Tutorial Placeholder */}
              <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4 flex items-start gap-3">
                <div className="flex-shrink-0 bg-purple-100 dark:bg-purple-900/50 rounded-lg p-2">
                  <Video className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">
                    Video Tutorial Available
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Watch a 5-minute walkthrough of the Forensic Lab features
                  </p>
                  <button className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1 transition-colors">
                    <Play className="w-4 h-4" />
                    Watch Tutorial
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-6">
              {steps.map((step) => {
                const colors = colorSchemes[step.color];
                const isCompleted = completedSteps.includes(step.number);
                const StepIcon = step.icon;

                return (
                  <div
                    key={step.number}
                    className={`${colors.bg} ${colors.border} border rounded-lg overflow-hidden transition-all duration-200`}
                  >
                    {/* Step Header */}
                    <button
                      onClick={() => toggleStepComplete(step.number)}
                      className={`w-full p-4 flex items-start gap-4 ${colors.hoverBg} transition-colors`}
                    >
                      {/* Step Number/Check Badge */}
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className={`w-10 h-10 ${colors.checkBg} rounded-full flex items-center justify-center`}>
                            <CheckCircle2 className="w-6 h-6 text-white" />
                          </div>
                        ) : (
                          <div className={`w-10 h-10 ${colors.badgeBg} rounded-full flex items-center justify-center border-2 ${colors.border}`}>
                            <span className={`text-xl font-bold ${colors.text}`}>
                              {step.number}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Step Content */}
                      <div className="flex-1 text-left">
                        <div className="flex items-center gap-2 mb-1">
                          <StepIcon className={`w-5 h-5 ${colors.text}`} />
                          <h3 className={`text-lg font-semibold ${colors.text}`}>
                            {step.title}
                          </h3>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {step.description}
                        </p>
                      </div>

                      {/* Completion Indicator */}
                      {isCompleted && (
                        <div className="flex-shrink-0 text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
                          Completed
                        </div>
                      )}
                    </button>

                    {/* Step Details */}
                    <div className="p-4 pt-0 space-y-4">
                      {step.details.map((detail, idx) => {
                        const DetailIcon = detail.icon;
                        return (
                          <div key={idx} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-3">
                              <DetailIcon className={`w-4 h-4 ${colors.text}`} />
                              <h4 className="font-semibold text-gray-900 dark:text-gray-100">
                                {detail.subtitle}
                              </h4>
                            </div>
                            <ul className="space-y-2">
                              {detail.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="flex items-start gap-2 text-sm">
                                  <div className={`w-1.5 h-1.5 ${colors.checkBg} rounded-full mt-1.5 flex-shrink-0`}></div>
                                  <span className="text-gray-700 dark:text-gray-300">{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Documentation Links */}
            <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Additional Resources
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <a
                  href="#"
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <BookOpen className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    Full Documentation
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <Info className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    Tool User Guides
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <Video className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    Video Tutorials
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
                <a
                  href="#"
                  className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group"
                >
                  <FileText className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                    Best Practices
                  </span>
                  <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
                </a>
              </div>
            </div>

            {/* Footer with Preferences */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={showOnStartup}
                  onChange={(e) => handleShowOnStartupChange(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                  Show this guide on startup
                </span>
              </label>

              <button
                onClick={toggleGuide}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
              >
                Close Guide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GettingStartedGuide;
