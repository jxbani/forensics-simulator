import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Microscope, AlertCircle, RefreshCw, CheckCircle2, XCircle,
  Server, Play, Square, ExternalLink, Loader2, Shield, Clock,
  AlertTriangle, ChevronDown, ChevronUp, BookOpen, Zap
} from 'lucide-react';
import ToolSelector from '../components/ToolSelector';
import FileUpload from '../components/FileUpload';
import ActiveTools from '../components/ActiveTools';
import toolService from '../services/toolService';
import fileService from '../services/fileService';

/**
 * ForensicLab - Main page for forensic analysis tools
 * Complete implementation with all functionality working
 */
const ForensicLab = () => {
  // Core data state
  const [availableTools, setAvailableTools] = useState([]);
  const [activeContainers, setActiveContainers] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  // Loading and error states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Docker status
  const [dockerStatus, setDockerStatus] = useState(null);
  const [dockerMode, setDockerMode] = useState('checking');
  const [checkingDocker, setCheckingDocker] = useState(false);

  // UI state
  const [showGettingStarted, setShowGettingStarted] = useState(true);
  const [showSetup, setShowSetup] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  /**
   * Load all data on mount
   */
  useEffect(() => {
    loadAllData();
  }, []);

  /**
   * Auto-refresh active containers every 10 seconds
   */
  useEffect(() => {
    const interval = setInterval(() => {
      loadActiveContainers();
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  /**
   * Load all data from APIs
   */
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await Promise.all([
        loadAvailableTools(),
        loadActiveContainers(),
        loadUploadedFiles(),
        checkDockerStatus()
      ]);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load forensic lab data. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Load available tools from API
   */
  const loadAvailableTools = useCallback(async () => {
    try {
      const response = await toolService.getAvailableTools();

      if (response.success) {
        setAvailableTools(response.tools || []);
      } else {
        throw new Error(response.error || 'Failed to load tools');
      }
    } catch (err) {
      console.error('Error loading available tools:', err);
      throw err;
    }
  }, []);

  /**
   * Load active containers from API
   */
  const loadActiveContainers = useCallback(async () => {
    try {
      const response = await toolService.listActiveContainers();

      if (response.success) {
        setActiveContainers(response.containers || []);
        setLastUpdated(new Date());
      }
    } catch (err) {
      console.error('Error loading active containers:', err);
      // Don't throw - this is background refresh
    }
  }, []);

  /**
   * Load uploaded files from API
   */
  const loadUploadedFiles = useCallback(async () => {
    try {
      const files = await fileService.getFileList();
      setUploadedFiles(files || []);
    } catch (err) {
      console.error('Error loading uploaded files:', err);
      throw err;
    }
  }, []);

  /**
   * Check Docker status
   */
  const checkDockerStatus = useCallback(async () => {
    try {
      const response = await toolService.checkDockerStatus();
      setDockerStatus(response);
      setDockerMode(response.mode || (response.connected ? 'real' : 'unavailable'));
    } catch (err) {
      console.error('Docker status check failed:', err);
      setDockerStatus({
        connected: false,
        message: 'Docker is not available',
        error: err.message
      });
      setDockerMode('unavailable');
    }
  }, []);

  /**
   * Handle refresh button click
   */
  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await loadAllData();
    } finally {
      setTimeout(() => setRefreshing(false), 500);
    }
  }, [loadAllData]);

  /**
   * Handle starting a tool
   * TOOL LAUNCH TESTING CHECKLIST:
   *
   * □ Backend running (npm start in backend/)
   * □ Docker available (docker ps works)
   * □ Images built (docker images | grep forensics-lab)
   * □ Auth token valid (check localStorage)
   * □ API endpoint correct (check VITE_API_URL)
   *
   * EXPECTED FLOW:
   * 1. User clicks "Launch Tool"
   * 2. POST /api/tools/start is called
   * 3. Backend creates Docker container
   * 4. Container data returned with accessUrl
   * 5. Container appears in Active Tools
   * 6. "Open Tool" opens new tab
   *
   * MOCK MODE (Docker unavailable):
   * - Demo mode banner shows
   * - Tools launch but return mock URLs
   * - Active Tools shows "Demo Mode"
   * - No actual containers created
   */
  const handleStartTool = useCallback(async (toolId, selectedFiles = []) => {
    try {
      setError(null);
      const result = await toolService.startTool(toolId, selectedFiles);

      await loadActiveContainers();

      // Open documentation in new tab
      if (result.container?.accessUrl) {
        setTimeout(() => {
          window.open(result.container.accessUrl, '_blank');
        }, 1000);
      }

      return result.container;
    } catch (err) {
      console.error('Failed to start demo tool:', err);
      setError(`Failed to start ${toolId}: ${err.message}`);
      throw err;
    }
  }, [loadActiveContainers]);

  /**
   * Handle stopping a tool
   */
  const handleStopTool = useCallback(async (containerId) => {
    setError(null);

    if (!confirm('Are you sure you want to stop this tool?')) {
      return;
    }

    try {
      const response = await toolService.stopTool(containerId);

      if (response.success) {
        // Refresh active containers
        await loadActiveContainers();
      } else {
        throw new Error(response.error || 'Failed to stop tool');
      }
    } catch (err) {
      console.error('Error stopping tool:', err);
      setError(`Failed to stop tool: ${err.message}`);
      throw err;
    }
  }, [loadActiveContainers]);

  /**
   * Handle file upload
   */
  const handleFileUpload = useCallback(async (file) => {
    try {
      await fileService.uploadFile(file);

      // Reload files
      await loadUploadedFiles();
    } catch (err) {
      console.error('Upload failed in ForensicLab:', err);
      setError(`Failed to upload file: ${err.message}`);
      throw err; // Re-throw so FileUpload can handle it
    }
  }, [loadUploadedFiles]);

  /**
   * Handle file delete
   */
  const handleFileDelete = useCallback(async (filename) => {
    setError(null);

    if (!confirm(`Are you sure you want to delete ${filename}?`)) {
      return;
    }

    try {
      await fileService.deleteFile(filename);

      // Refresh uploaded files
      await loadUploadedFiles();
    } catch (err) {
      console.error('Error deleting file:', err);
      setError(`Failed to delete file: ${err.message}`);
    }
  }, [loadUploadedFiles]);

  /**
   * Handle Docker status re-check
   */
  const handleCheckDocker = useCallback(async () => {
    setCheckingDocker(true);
    try {
      await checkDockerStatus();
    } finally {
      setCheckingDocker(false);
    }
  }, [checkDockerStatus]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
          <p className="text-white text-lg">Loading Forensic Lab...</p>
        </div>
      </div>
    );
  }

  const isDockerRunning = dockerStatus?.connected === true;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                <Microscope className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Forensic Lab</h1>
                <p className="text-slate-300 text-sm">Analyze evidence with professional tools</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              {/* Last Updated */}
              {lastUpdated && (
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Clock className="w-4 h-4" />
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                </div>
              )}

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                title="Refresh data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>

              {/* Navigation */}
              <nav className="flex items-center gap-3">
                <Link
                  to="/dashboard"
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  to="/forensic-lab"
                  className="px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg font-medium border border-blue-500/30"
                >
                  Forensic Lab
                </Link>
                <Link
                  to="/leaderboard"
                  className="px-4 py-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg font-medium transition-all"
                >
                  Leaderboard
                </Link>
              </nav>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Demo Mode Banner - Only show when Docker is not available */}
        {dockerMode !== 'real' && (
          <div className="bg-yellow-600 text-black p-4 rounded-lg mb-6 border-2 border-yellow-500">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🎭</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Demo Mode Active</h3>
                <p className="text-sm">
                  Tools are simulated for demonstration. Launching a tool will open its documentation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Real Docker Mode Banner - Show when Docker is connected */}
        {dockerMode === 'real' && (
          <div className="bg-green-600 text-white p-4 rounded-lg mb-6 border-2 border-green-500">
            <div className="flex items-center gap-3">
              <span className="text-2xl">✅</span>
              <div className="flex-1">
                <h3 className="font-bold text-lg">Docker Connected</h3>
                <p className="text-sm">
                  Real forensic tools are available! Containers will be created when you launch tools.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8 flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-200 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="text-red-300 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        )}

        {/* Debug Tools (Development Only) */}
        {import.meta.env.DEV && (
          <div className="bg-purple-900 bg-opacity-30 border border-purple-600 p-4 rounded-lg mb-6">
            <h3 className="text-purple-400 font-bold mb-2">🔧 Debug Tools</h3>
            <div className="space-y-2">
              <button
                onClick={async () => {
                  try {
                    await handleStartTool('volatility', []);
                  } catch (err) {
                    console.error('❌ Tool launch failed:', err);
                  }
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm"
              >
                Test Launch Volatility
              </button>

              <button
                onClick={async () => {
                  const status = await toolService.checkDockerStatus();
                  alert(JSON.stringify(status, null, 2));
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm ml-2"
              >
                Check Docker Status
              </button>

              <button
                onClick={async () => {
                  const containers = await toolService.listActiveContainers();
                  alert(`Found ${containers.length} containers`);
                }}
                className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm ml-2"
              >
                List Containers
              </button>

              <button
                onClick={() => {
                  alert(
                    'To debug tool launch:\n\n' +
                    '1. Open browser DevTools (F12)\n' +
                    '2. Go to Console tab\n' +
                    '3. Try launching a tool\n' +
                    '4. Watch for logs starting with "==="\n' +
                    '5. Check Network tab for API calls\n' +
                    '6. Look for any red errors\n\n' +
                    'Common issues:\n' +
                    '- Backend not running: Start with "npm start"\n' +
                    '- Docker not available: See demo mode banner\n' +
                    '- Images not built: Run "docker-compose build"'
                  );
                }}
                className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm ml-2"
              >
                🐛 Debug Help
              </button>
            </div>

            <div className="mt-3 text-xs text-purple-200">
              <div>Backend: {import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}</div>
              <div>Docker Mode: {dockerMode}</div>
              <div>Available Tools: {availableTools.length}</div>
              <div>Active Containers: {activeContainers.length}</div>
            </div>
          </div>
        )}

        {/* Getting Started Guide */}
        <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 mb-8 overflow-hidden">
          <button
            onClick={() => setShowGettingStarted(!showGettingStarted)}
            className="w-full p-6 flex items-center justify-between hover:bg-white/5 transition-all"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="w-6 h-6 text-blue-400" />
              <div className="text-left">
                <h2 className="text-xl font-bold text-white">Getting Started</h2>
                <p className="text-slate-400 text-sm">Learn how to use the Forensic Lab</p>
              </div>
            </div>
            {showGettingStarted ? (
              <ChevronUp className="w-5 h-5 text-slate-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-slate-400" />
            )}
          </button>

          {showGettingStarted && (
            <div className="p-6 pt-0 border-t border-white/10">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-blue-400 font-bold">1</span>
                  </div>
                  <h3 className="font-semibold text-white">Upload Evidence</h3>
                  <p className="text-sm text-slate-400">
                    Upload forensic evidence files (memory dumps, disk images, network captures)
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-blue-400 font-bold">2</span>
                  </div>
                  <h3 className="font-semibold text-white">Select Tool</h3>
                  <p className="text-sm text-slate-400">
                    Choose an analysis tool and select which files to analyze
                  </p>
                </div>
                <div className="space-y-2">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center mb-3">
                    <span className="text-blue-400 font-bold">3</span>
                  </div>
                  <h3 className="font-semibold text-white">Analyze</h3>
                  <p className="text-sm text-slate-400">
                    Launch the tool and access it through your browser to perform analysis
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Tools and Files */}
          <div className="lg:col-span-2 space-y-8">
            {/* Available Tools */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Zap className="w-7 h-7 text-blue-400" />
                  Available Tools
                </h2>
                <p className="text-slate-400">Select a tool and files to begin analysis</p>
              </div>

              <ToolSelector
                tools={availableTools}
                files={uploadedFiles}
                onStartTool={handleStartTool}
                disabled={false}
                dockerMode={dockerMode}
              />
            </div>

            {/* File Upload */}
            <div>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Server className="w-7 h-7 text-blue-400" />
                  Evidence Files
                </h2>
                <p className="text-slate-400">Upload and manage forensic evidence</p>
              </div>

              <FileUpload
                files={uploadedFiles}
                onUpload={handleFileUpload}
                onDelete={handleFileDelete}
              />
            </div>
          </div>

          {/* Right Column - Active Tools (Sticky) */}
          <div className="lg:col-span-1">
            <div className="lg:sticky lg:top-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-2">
                  <Play className="w-7 h-7 text-green-400" />
                  Active Tools
                </h2>
                <p className="text-slate-400">Running analysis containers</p>
              </div>

              <ActiveTools
                containers={activeContainers}
                onStopTool={handleStopTool}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForensicLab;
