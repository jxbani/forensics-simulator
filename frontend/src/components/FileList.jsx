import { useState, useEffect } from 'react';
import fileService from '../services/fileService';
import './FileList.css';

const FileList = ({ taskId = null, onFileDeleted }) => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    fetchFiles();
  }, [taskId]);

  const fetchFiles = async () => {
    try {
      setLoading(true);
      setError(null);

      const options = taskId ? { taskId, limit: 10 } : { limit: 10 };
      const data = await fileService.getUserFiles(options);
      setFiles(data.files || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (file) => {
    try {
      await fileService.downloadFile(file.id, file.originalName);
    } catch (err) {
      alert(`Failed to download file: ${err.message}`);
    }
  };

  const handleDelete = async (file) => {
    if (!confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      return;
    }

    try {
      setDeleting(file.id);
      await fileService.deleteFile(file.id);

      // Update local state
      setFiles(files.filter(f => f.id !== file.id));

      if (onFileDeleted) {
        onFileDeleted(file);
      }
    } catch (err) {
      alert(`Failed to delete file: ${err.message}`);
    } finally {
      setDeleting(null);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="file-list-loading">
        <div className="loading-spinner"></div>
        <p>Loading files...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="file-list-error">
        <p>Error loading files: {error}</p>
        <button onClick={fetchFiles} className="btn btn-secondary">
          Retry
        </button>
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list-empty">
        <p>No files uploaded yet</p>
      </div>
    );
  }

  return (
    <div className="file-list-container">
      <h3 className="file-list-title">Uploaded Files</h3>
      <div className="file-list">
        {files.map((file) => (
          <div key={file.id} className="file-list-item">
            <div className="file-list-icon">
              {fileService.getFileTypeIcon(file.fileType)}
            </div>

            <div className="file-list-info">
              <p className="file-list-name">{file.originalName}</p>
              <div className="file-list-meta">
                <span className="file-list-type">{file.fileType}</span>
                <span className="file-list-separator">•</span>
                <span className="file-list-size">
                  {fileService.formatFileSize(file.fileSize)}
                </span>
                <span className="file-list-separator">•</span>
                <span className="file-list-date">
                  {formatDate(file.uploadedAt)}
                </span>
              </div>
            </div>

            <div className="file-list-actions">
              <button
                onClick={() => handleDownload(file)}
                className="file-action-btn download-btn"
                title="Download"
              >
                ⬇️
              </button>
              <button
                onClick={() => handleDelete(file)}
                className="file-action-btn delete-btn"
                disabled={deleting === file.id}
                title="Delete"
              >
                {deleting === file.id ? '⏳' : '🗑️'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileList;
