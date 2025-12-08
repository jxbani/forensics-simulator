import React, { useState } from 'react';
import { Play, Info, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const ToolSelector = ({ tools = [], uploadedFiles = [], onStartTool, dockerMode }) => {
  const [selectedTool, setSelectedTool] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [starting, setStarting] = useState(null);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Safety checks
  if (!Array.isArray(tools)) {
    console.error('ToolSelector: tools is not an array:', tools);
    return (
      <div className="bg-red-600 text-white p-4 rounded-lg">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        <span>Error: Invalid tools data</span>
      </div>
    );
  }

  if (!Array.isArray(uploadedFiles)) {
    console.error('ToolSelector: uploadedFiles is not an array:', uploadedFiles);
  }

  const handleStartTool = async (toolId) => {
    if (!onStartTool) {
      console.error('ToolSelector: onStartTool prop is missing!');
      setError('Tool launch not configured');
      return;
    }

    try {
      setError(null);
      setSuccess(null);
      setStarting(toolId);

      const result = await onStartTool(toolId, selectedFiles);

      setSuccess(`${toolId} started successfully!`);
      setSelectedFiles([]);
      setSelectedTool(null);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error('ToolSelector: Start tool failed:', err);
      setError(err.message || 'Failed to start tool');
    } finally {
      setStarting(null);
    }
  };

  const toggleFileSelection = (filename) => {
    setSelectedFiles(prev =>
      prev.includes(filename)
        ? prev.filter(f => f !== filename)
        : [...prev, filename]
    );
  };

  const getCompatibleFiles = (tool) => {
    // Safety checks
    if (!Array.isArray(uploadedFiles)) return [];
    if (!tool || !Array.isArray(tool.supportedFiles)) return [];

    return uploadedFiles.filter(file => {
      if (!file || !file.filename) return false;
      return tool.supportedFiles.some(ext =>
        file.filename.toLowerCase().endsWith(ext)
      );
    });
  };

  if (tools.length === 0) {
    return (
      <div className="text-center py-8 text-slate-400">
        <AlertCircle className="w-12 h-12 mx-auto mb-3 text-slate-600" />
        <p>No forensic tools available</p>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-4">
        {/* Success/Error Messages */}
        {error && (
          <div className="bg-red-600 text-white p-3 rounded-lg flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            <span>{error}</span>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-white hover:text-gray-200"
            >
              ✕
            </button>
          </div>
        )}

        {success && (
          <div className="bg-green-600 text-white p-3 rounded-lg flex items-center gap-2">
            <CheckCircle className="w-5 h-5" />
            <span>{success}</span>
          </div>
        )}

        {/* Tool Cards */}
        {tools.map(tool => {
          // Safety check for tool object
          if (!tool || !tool.id) {
            console.error('ToolSelector: Invalid tool object:', tool);
            return null;
          }

          const compatibleFiles = getCompatibleFiles(tool);
          const isSelected = selectedTool === tool.id;
          const isStarting = starting === tool.id;

          return (
            <div
              key={tool.id}
              className={`p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-blue-500 bg-blue-900 bg-opacity-20'
                  : 'border-slate-600 bg-slate-700 hover:border-slate-500'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-3xl">{tool.icon || '🔧'}</span>
                    <div>
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {tool.name || 'Unknown Tool'}
                        {dockerMode === 'mock' && (
                          <span className="px-2 py-1 bg-yellow-600 text-black text-xs font-bold rounded">
                            DEMO
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-400">{tool.description || 'No description'}</p>
                    </div>
                  </div>

                  {tool.supportedFiles && tool.supportedFiles.length > 0 && (
                    <div className="mt-3 text-sm">
                      <span className="text-slate-400">Supported files: </span>
                      <span className="text-blue-400">
                        {tool.supportedFiles.join(', ')}
                      </span>
                    </div>
                  )}

                  {compatibleFiles.length > 0 && (
                    <div className="mt-2 text-sm text-green-400">
                      ✓ {compatibleFiles.length} compatible file(s) uploaded
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setSelectedTool(isSelected ? null : tool.id)}
                  disabled={isStarting}
                  className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-600 text-white rounded transition-colors flex items-center gap-2"
                >
                  <Info className="w-4 h-4" />
                  {isSelected ? 'Hide' : 'Select'}
                </button>
              </div>

              {/* File Selection & Launch */}
              {isSelected && (
                <div className="mt-4 p-4 bg-slate-800 rounded border border-slate-600">
                  {compatibleFiles.length > 0 ? (
                    <>
                      <h4 className="text-white font-semibold mb-2">
                        Select evidence files (optional):
                      </h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto mb-4">
                        {compatibleFiles.map(file => (
                          <label
                            key={file.filename}
                            className="flex items-center gap-2 p-2 hover:bg-slate-700 rounded cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file.filename)}
                              onChange={() => toggleFileSelection(file.filename)}
                              className="w-4 h-4"
                            />
                            <span className="text-white text-sm">{file.filename}</span>
                            {file.size && (
                              <span className="text-slate-400 text-xs ml-auto">
                                {(file.size / 1024 / 1024).toFixed(2)} MB
                              </span>
                            )}
                          </label>
                        ))}
                      </div>
                    </>
                  ) : (
                    <div className="mb-4 text-sm text-slate-300">
                      No compatible files uploaded. You can launch the tool without files.
                    </div>
                  )}

                  <button
                    onClick={() => handleStartTool(tool.id)}
                    disabled={isStarting}
                    className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-slate-600 text-white rounded transition-colors flex items-center justify-center gap-2 font-semibold"
                  >
                    {isStarting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Starting {tool.name || 'tool'}...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5" />
                        Launch {tool.name || 'Tool'}
                      </>
                    )}
                  </button>

                  <p className="mt-2 text-xs text-slate-400 text-center">
                    Tool will open in a new tab when ready
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  } catch (err) {
    console.error('ToolSelector render error:', err);
    return (
      <div className="bg-red-600 text-white p-4 rounded-lg">
        <AlertCircle className="w-5 h-5 inline mr-2" />
        <p>Error loading tools. Please refresh the page.</p>
        <p className="text-sm mt-2">{err.message}</p>
      </div>
    );
  }
};

export default ToolSelector;
