import React, { useState, useRef } from 'react';
import { Upload, File, Trash2, HardDrive, Network, Cpu, AlertCircle } from 'lucide-react';

const FileUpload = ({ files, onUpload, onDelete }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const getFileIcon = (type) => {
    switch (type) {
      case 'network_capture':
        return <Network className="w-5 h-5 text-blue-400" />;
      case 'memory_dump':
        return <Cpu className="w-5 h-5 text-purple-400" />;
      case 'disk_image':
        return <HardDrive className="w-5 h-5 text-green-400" />;
      default:
        return <File className="w-5 h-5 text-gray-400" />;
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleFileUpload(e.target.files[0]);
    }
  };

  const handleFileUpload = async (file) => {
    if (!onUpload) {
      console.error('onUpload prop is not provided!');
      setError('Upload handler not configured');
      return;
    }

    try {
      setError(null);
      setUploading(true);
      setUploadProgress(0);

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          const next = prev + 10;
          return Math.min(next, 90);
        });
      }, 200);

      await onUpload(file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 1000);
    } catch (err) {
      console.error('Upload error in FileUpload:', err);
      setUploading(false);
      setUploadProgress(0);
      setError(err.message || 'Upload failed');
    }
  };

  const handleBrowseClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    } else {
      console.error('File input ref is null!');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-900 bg-opacity-20'
            : 'border-slate-600 hover:border-slate-500'
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
        <p className="text-white mb-2">
          Drag and drop evidence files here, or{' '}
          <button
            onClick={handleBrowseClick}
            className="text-blue-400 hover:text-blue-300 underline cursor-pointer"
            type="button"
          >
            browse
          </button>
        </p>
        <p className="text-slate-400 text-sm">
          Supported: .pcap, .mem, .raw, .dd, .img, .e01 (Max 10GB)
        </p>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          onChange={handleFileSelect}
          accept=".pcap,.pcapng,.raw,.mem,.dmp,.dd,.img,.iso,.e01,.ex01,.aff,.afd,.vmdk,.vdi,.zip,.tar,.gz"
        />
      </div>

      {/* Error Display */}
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

      {/* Upload Progress */}
      {uploading && (
        <div className="bg-slate-700 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white text-sm">Uploading...</span>
            <span className="text-blue-400 text-sm">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-600 rounded-full h-2">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* File List */}
      <div className="space-y-2">
        {files.length === 0 ? (
          <div className="text-center py-8 text-slate-400">
            No evidence files uploaded yet
          </div>
        ) : (
          files.map((file, index) => (
            <div
              key={index}
              className="bg-slate-700 p-4 rounded-lg flex items-center justify-between hover:bg-slate-600 transition-colors"
            >
              <div className="flex items-center gap-3 flex-1">
                {getFileIcon(file.type)}
                <div className="flex-1 min-w-0">
                  <p className="text-white font-medium truncate">{file.filename}</p>
                  <div className="flex gap-4 text-xs text-slate-400 mt-1">
                    <span>{formatFileSize(file.size)}</span>
                    <span>•</span>
                    <span>{file.type?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDelete(file.filename)}
                className="ml-4 p-2 text-red-400 hover:text-red-300 hover:bg-red-900 hover:bg-opacity-30 rounded transition-colors"
                title="Delete file"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Debug Info (remove in production) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-900 bg-opacity-20 border border-yellow-600 p-3 rounded text-xs text-yellow-200">
          <div>DEBUG INFO:</div>
          <div>Files: {files.length}</div>
          <div>Uploading: {uploading ? 'Yes' : 'No'}</div>
          <div>onUpload: {onUpload ? 'Defined' : 'MISSING'}</div>
          <div>onDelete: {onDelete ? 'Defined' : 'MISSING'}</div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
