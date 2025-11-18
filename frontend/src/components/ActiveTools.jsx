import React, { useState } from 'react';
import { ExternalLink, Square, Activity, Clock, CheckCircle, XCircle, RefreshCw, PlayCircle } from 'lucide-react';
import EmptyState from './EmptyState';

/**
 * ActiveTools - Component for displaying and managing active forensic tool containers
 * @param {Array} containers - List of active containers
 * @param {Function} onStopTool - Callback when stopping a tool
 * @param {Function} onRefresh - Callback to refresh container list
 */
const ActiveTools = ({ containers = [], onStopTool, onRefresh }) => {
  // Track which containers are being stopped
  const [stopping, setStopping] = useState({});

  /**
   * Get emoji icon for tool type
   * @param {string} toolName - Tool identifier
   * @returns {string} Emoji icon
   */
  const getToolEmoji = (toolName) => {
    const emojis = {
      volatility: '🧠',
      wireshark: '🦈',
      autopsy: '🔬',
      ftk: '💾'
    };
    return emojis[toolName] || '🔧';
  };

  /**
   * Get status color class
   * @param {string} status - Container status
   * @returns {string} Tailwind color class
   */
  const getStatusColor = (status) => {
    const colors = {
      running: 'text-green-600 bg-green-100',
      exited: 'text-red-600 bg-red-100',
      stopped: 'text-red-600 bg-red-100',
      paused: 'text-yellow-600 bg-yellow-100',
      restarting: 'text-blue-600 bg-blue-100'
    };
    return colors[status?.toLowerCase()] || 'text-gray-600 bg-gray-100';
  };

  /**
   * Get status icon component
   * @param {string} status - Container status
   * @returns {JSX.Element} Icon component
   */
  const getStatusIcon = (status) => {
    const iconClass = "h-4 w-4";

    switch (status?.toLowerCase()) {
      case 'running':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'exited':
      case 'stopped':
        return <XCircle className={`${iconClass} text-red-600`} />;
      case 'restarting':
        return <RefreshCw className={`${iconClass} text-blue-600 animate-spin`} />;
      default:
        return <Activity className={`${iconClass} text-gray-600`} />;
    }
  };

  /**
   * Format uptime from creation timestamp
   * @param {string} createdAt - ISO timestamp
   * @returns {string} Formatted uptime
   */
  const formatUptime = (createdAt) => {
    if (!createdAt) return 'Unknown';

    try {
      const created = new Date(createdAt);
      const now = new Date();
      const diffMs = now - created;
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const remainingMins = diffMins % 60;

      if (diffHours > 0) {
        return `${diffHours}h ${remainingMins}m`;
      } else {
        return `${diffMins}m`;
      }
    } catch (error) {
      return 'Unknown';
    }
  };

  /**
   * Handle stopping a tool container
   * @param {string} dockerId - Container ID
   */
  const handleStopTool = async (dockerId) => {
    setStopping((prev) => ({ ...prev, [dockerId]: true }));

    try {
      await onStopTool(dockerId);
    } catch (error) {
      console.error('Error stopping tool:', error);
    } finally {
      setStopping((prev) => ({ ...prev, [dockerId]: false }));
    }
  };

  /**
   * Open tool in new tab
   * @param {string} url - Access URL
   */
  const handleOpenTool = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // Empty state
  if (containers.length === 0) {
    return (
      <EmptyState
        icon={PlayCircle}
        title="No Active Tools"
        description="Launch a forensic tool to start analyzing evidence. Select a tool from the Tool Selector to get started."
        variant="default"
        size="small"
      />
    );
  }

  return (
    <div className="space-y-3">
      {/* Refresh Button */}
      {onRefresh && (
        <button
          onClick={onRefresh}
          className="w-full flex items-center justify-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh Status
        </button>
      )}

      {/* Active Containers */}
      {containers.map((container) => {
        const isStopping = stopping[container.containerId];
        const isRunning = container.status?.toLowerCase() === 'running';
        const isDemoContainer = container.dockerId?.startsWith('demo-') ||
                               container.containerId?.startsWith('demo-') ||
                               container.isDemo === true;

        return (
          <div
            key={container.containerId}
            className="border border-slate-300 rounded-lg p-4 bg-white hover:border-slate-400 transition-colors"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center">
                <span className="text-2xl mr-2">
                  {getToolEmoji(container.tool || container.toolName)}
                </span>
                <div>
                  <h4 className="text-sm font-semibold text-gray-900">
                    {(container.tool || container.toolName)?.charAt(0).toUpperCase() + (container.tool || container.toolName)?.slice(1) || 'Unknown Tool'}
                  </h4>
                  <div className="flex items-center gap-1 mt-1">
                    {getStatusIcon(container.status)}
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full ${getStatusColor(
                        container.status
                      )}`}
                    >
                      {container.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Demo Mode Warning */}
            {isDemoContainer && (
              <div className="mb-3 text-xs text-yellow-700 bg-yellow-50 p-2 rounded border border-yellow-200">
                🎭 Demo Mode: Click "View Documentation" to learn about this tool
              </div>
            )}

            {/* Container Info */}
            <div className="space-y-2 mb-3 text-xs text-gray-600">
              {/* Port */}
              {container.ports && container.ports.length > 0 && (
                <div className="flex items-center">
                  <span className="font-medium w-16">Port:</span>
                  <span>
                    {container.ports.map(p => p.public || p.PublicPort).filter(Boolean).join(', ') || 'N/A'}
                  </span>
                </div>
              )}

              {/* Uptime */}
              {container.createdAt && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span className="font-medium mr-2">Uptime:</span>
                  <span>{formatUptime(container.createdAt)}</span>
                </div>
              )}

              {/* Container ID */}
              <div className="flex items-center">
                <span className="font-medium mr-2">ID:</span>
                <code className="text-xs bg-slate-100 px-1 rounded">
                  {container.containerId?.substring(0, 12) || 'Unknown'}
                </code>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              {/* Open Tool / View Documentation Button */}
              {isRunning && (
                isDemoContainer ? (
                  container.accessUrl ? (
                    <button
                      onClick={() => handleOpenTool(container.accessUrl)}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Documentation
                    </button>
                  ) : (
                    <div className="flex-1 px-3 py-2 bg-gray-400 text-white text-sm rounded-lg text-center cursor-not-allowed">
                      Demo Mode - No URL
                    </div>
                  )
                ) : (
                  container.ports && container.ports.length > 0 && (
                    <button
                      onClick={() => {
                        const port = container.ports[0]?.public || container.ports[0]?.PublicPort;
                        if (port) {
                          handleOpenTool(`http://localhost:${port}`);
                        }
                      }}
                      className="flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      <ExternalLink className="h-4 w-4 mr-1" />
                      Open Tool
                    </button>
                  )
                )
              )}

              {/* Stop Button */}
              <button
                onClick={() => handleStopTool(container.dockerId || container.containerId)}
                disabled={isStopping || !isRunning}
                className={`${
                  isRunning ? 'flex-1' : 'w-full'
                } flex items-center justify-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  isStopping
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : isRunning
                    ? 'text-white bg-red-600 hover:bg-red-700'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isStopping ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                    Stopping...
                  </>
                ) : (
                  <>
                    <Square className="h-4 w-4 mr-1" />
                    Stop
                  </>
                )}
              </button>
            </div>

            {/* Auto-stop Warning */}
            {isRunning && !isDemoContainer && (
              <div className="mt-3 pt-3 border-t border-slate-200">
                <p className="text-xs text-yellow-700 bg-yellow-50 px-2 py-1 rounded">
                  ⏱️ Auto-stops after 2 hours of inactivity
                </p>
              </div>
            )}
          </div>
        );
      })}

      {/* Summary */}
      <div className="pt-3 border-t border-slate-200">
        <p className="text-xs text-center text-gray-600">
          {containers.length} active tool{containers.length !== 1 ? 's' : ''}
        </p>
      </div>
    </div>
  );
};

export default ActiveTools;
