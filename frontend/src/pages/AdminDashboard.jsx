import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import adminService from '../services/adminService';
import api from '../services/api';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('analytics');
  const [analytics, setAnalytics] = useState(null);
  const [users, setUsers] = useState([]);
  const [levels, setLevels] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [uploadingEvidence, setUploadingEvidence] = useState(false);

  // Check if user has admin privileges
  useEffect(() => {
    if (!user || (user.role !== 'ADMIN' && user.role !== 'MODERATOR')) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  // Fetch data based on active tab
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  // Fetch levels on mount
  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      if (activeTab === 'analytics') {
        const data = await adminService.getAnalytics();
        setAnalytics(data.analytics);
        const activityData = await adminService.getActivityLogs({ limit: 10 });
        setActivities(activityData.activities);
      } else if (activeTab === 'users') {
        const data = await adminService.getAllUsers({ limit: 50 });
        setUsers(data.users);
      } else if (activeTab === 'activity') {
        const activityData = await adminService.getActivityLogs({ limit: 50 });
        setActivities(activityData.activities);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchLevels = async () => {
    try {
      const response = await api.get('/levels');
      setLevels(response.data.levels);
    } catch (err) {
      console.error('Error fetching levels:', err);
    }
  };

  const fetchEvidenceFiles = async (levelId) => {
    try {
      const data = await adminService.getLevelEvidenceFiles(levelId);
      setEvidenceFiles(data.evidenceFiles || []);
    } catch (err) {
      console.error('Error fetching evidence files:', err);
      setEvidenceFiles([]);
    }
  };

  const handleLevelSelect = async (level) => {
    setSelectedLevel(level);
    await fetchEvidenceFiles(level.id);
  };

  const handleEvidenceUpload = async (e) => {
    e.preventDefault();
    const fileInput = e.target.elements.evidenceFile;
    const descriptionInput = e.target.elements.description;

    if (!fileInput.files[0] || !selectedLevel) {
      alert('Please select a level and file');
      return;
    }

    setUploadingEvidence(true);
    try {
      await adminService.uploadEvidenceFile(
        selectedLevel.id,
        fileInput.files[0],
        descriptionInput.value
      );
      alert('Evidence file uploaded successfully!');
      fileInput.value = '';
      descriptionInput.value = '';
      await fetchEvidenceFiles(selectedLevel.id);
    } catch (err) {
      alert(`Failed to upload: ${err.message}`);
    } finally {
      setUploadingEvidence(false);
    }
  };

  const handleDeleteEvidence = async (evidenceId) => {
    if (!window.confirm('Are you sure you want to delete this evidence file?')) {
      return;
    }

    try {
      await adminService.deleteEvidenceFile(evidenceId);
      alert('Evidence file deleted successfully');
      await fetchEvidenceFiles(selectedLevel.id);
    } catch (err) {
      alert(`Failed to delete: ${err.message}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await adminService.updateUserRole(userId, newRole);
      fetchData(); // Refresh data
      alert('User role updated successfully');
    } catch (err) {
      alert(`Failed to update role: ${err.message}`);
    }
  };

  const handleDeleteUser = async (userId, username) => {
    if (!window.confirm(`Are you sure you want to delete user "${username}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await adminService.deleteUser(userId);
      fetchData(); // Refresh data
      alert('User deleted successfully');
    } catch (err) {
      alert(`Failed to delete user: ${err.message}`);
    }
  };

  return (
    <div className="admin-dashboard">
      {/* Header */}
      <header className="admin-header">
        <div className="admin-header-content">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Welcome, {user?.username} ({user?.role})</p>
          </div>
          <div className="admin-header-actions">
            <button onClick={() => navigate('/dashboard')} className="btn-secondary">
              Back to Main Dashboard
            </button>
            <button onClick={handleLogout} className="btn-danger">
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Tabs */}
      <div className="admin-tabs">
        <button
          className={`admin-tab ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
        <button
          className={`admin-tab ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button
          className={`admin-tab ${activeTab === 'levels' ? 'active' : ''}`}
          onClick={() => setActiveTab('levels')}
        >
          Level Editor
        </button>
        <button
          className={`admin-tab ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity Logs
        </button>
      </div>

      {/* Content */}
      <div className="admin-content">
        {error && (
          <div className="admin-error">
            Error: {error}
          </div>
        )}

        {loading ? (
          <div className="admin-loading">Loading...</div>
        ) : (
          <>
            {/* Analytics Tab */}
            {activeTab === 'analytics' && analytics && (
              <div className="analytics-container">
                <h2>System Analytics</h2>

                {/* Stats Grid */}
                <div className="stats-grid">
                  <div className="stat-card">
                    <div className="stat-icon">👥</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics.totalUsers}</div>
                      <div className="stat-label">Total Users</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📚</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics.totalLevels}</div>
                      <div className="stat-label">Total Levels</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics.totalTasks}</div>
                      <div className="stat-label">Total Tasks</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics.totalSubmissions}</div>
                      <div className="stat-label">Total Submissions</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">🎯</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics.accuracy}%</div>
                      <div className="stat-label">Accuracy Rate</div>
                    </div>
                  </div>

                  <div className="stat-card">
                    <div className="stat-icon">📁</div>
                    <div className="stat-content">
                      <div className="stat-value">{analytics.totalFiles || 0}</div>
                      <div className="stat-label">Files Uploaded</div>
                    </div>
                  </div>
                </div>

                {/* User Growth */}
                {analytics.userGrowth && analytics.userGrowth.length > 0 && (
                  <div className="analytics-section">
                    <h3>User Growth (Last 30 Days)</h3>
                    <div className="growth-chart">
                      <p>Total new users: {analytics.userGrowth.reduce((sum, day) => sum + day.count, 0)}</p>
                    </div>
                  </div>
                )}

                {/* Users by Role */}
                {analytics.usersByRole && analytics.usersByRole.length > 0 && (
                  <div className="analytics-section">
                    <h3>Users by Role</h3>
                    <div className="role-distribution">
                      {analytics.usersByRole.map((roleData) => (
                        <div key={roleData.role} className="role-stat">
                          <span className={`role-badge ${adminService.getRoleBadgeColor(roleData.role)}`}>
                            {roleData.role}
                          </span>
                          <span className="role-count">{roleData._count._all}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Activity */}
                {activities && activities.length > 0 && (
                  <div className="analytics-section">
                    <h3>Recent Activity</h3>
                    <div className="activity-list">
                      {activities.map((activity, index) => (
                        <div key={index} className="activity-item">
                          <span className="activity-type">{activity.type}</span>
                          <span className="activity-user">{activity.user}</span>
                          <span className="activity-time">
                            {adminService.formatDate(activity.timestamp)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Management Tab */}
            {activeTab === 'users' && (
              <div className="users-container">
                <div className="users-header">
                  <h2>User Management</h2>
                  <div className="users-stats">
                    <span>{users.length} users displayed</span>
                  </div>
                </div>

                <div className="users-table-container">
                  <table className="users-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Joined</th>
                        <th>Progress</th>
                        <th>Score</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((userData) => (
                        <tr key={userData.id}>
                          <td>{userData.username}</td>
                          <td>{userData.email}</td>
                          <td>
                            {user?.role === 'ADMIN' ? (
                              <select
                                value={userData.role}
                                onChange={(e) => handleRoleChange(userData.id, e.target.value)}
                                className={`role-select ${adminService.getRoleBadgeColor(userData.role)}`}
                              >
                                <option value="USER">USER</option>
                                <option value="MODERATOR">MODERATOR</option>
                                <option value="ADMIN">ADMIN</option>
                              </select>
                            ) : (
                              <span className={`role-badge ${adminService.getRoleBadgeColor(userData.role)}`}>
                                {userData.role}
                              </span>
                            )}
                          </td>
                          <td>{adminService.formatDate(userData.createdAt)}</td>
                          <td>{userData._count?.progress || 0}</td>
                          <td>{userData.totalScore || 0}</td>
                          <td>
                            {user?.role === 'ADMIN' && userData.id !== user.id && (
                              <button
                                onClick={() => handleDeleteUser(userData.id, userData.username)}
                                className="btn-delete-small"
                                title="Delete User"
                              >
                                Delete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Level Management & Evidence Files Tab */}
            {activeTab === 'levels' && (
              <div className="levels-container">
                <h2>Level Management & Evidence Files</h2>

                <div className="level-management-grid">
                  {/* Level Selector */}
                  <div className="level-selector-section">
                    <h3>Select Level</h3>
                    <div className="level-list">
                      {levels.map((level) => (
                        <div
                          key={level.id}
                          className={`level-item ${selectedLevel?.id === level.id ? 'selected' : ''}`}
                          onClick={() => handleLevelSelect(level)}
                        >
                          <div className="level-item-header">
                            <span className="level-number">Level {level.orderIndex}</span>
                            <span className={`difficulty-badge-small ${level.difficulty.toLowerCase()}`}>
                              {level.difficulty}
                            </span>
                          </div>
                          <h4>{level.title}</h4>
                          <p className="level-item-desc">{level.description.substring(0, 80)}...</p>
                          <div className="level-item-footer">
                            <span>{level.taskCount} tasks</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Evidence File Management */}
                  <div className="evidence-management-section">
                    {selectedLevel ? (
                      <>
                        <h3>Evidence Files for: {selectedLevel.title}</h3>

                        {/* Upload Form */}
                        <div className="evidence-upload-form">
                          <h4>Upload Evidence File</h4>
                          <form onSubmit={handleEvidenceUpload}>
                            <div className="form-group">
                              <label htmlFor="evidenceFile">Select File:</label>
                              <input
                                type="file"
                                id="evidenceFile"
                                name="evidenceFile"
                                className="file-input"
                                accept=".pcap,.pcapng,.raw,.mem,.dmp,.vmem,.dd,.img,.e01,.log,.txt,.evtx,.exe,.dll,.elf,.bin,.pdf,.docx,.xlsx,.zip,.tar,.gz,.7z"
                              />
                              <p className="file-hint">
                                Supported: PCAP, Memory Dumps, Disk Images, Logs, Executables, Documents, Archives
                              </p>
                            </div>
                            <div className="form-group">
                              <label htmlFor="description">Description (optional):</label>
                              <textarea
                                id="description"
                                name="description"
                                className="description-input"
                                rows="3"
                                placeholder="Describe this evidence file..."
                              />
                            </div>
                            <button
                              type="submit"
                              className="btn-upload"
                              disabled={uploadingEvidence}
                            >
                              {uploadingEvidence ? 'Uploading...' : 'Upload Evidence File'}
                            </button>
                          </form>
                        </div>

                        {/* Evidence Files List */}
                        <div className="evidence-files-list">
                          <h4>Uploaded Evidence Files ({evidenceFiles.length})</h4>
                          {evidenceFiles.length === 0 ? (
                            <p className="no-evidence">No evidence files uploaded for this level yet.</p>
                          ) : (
                            <div className="evidence-table">
                              <table>
                                <thead>
                                  <tr>
                                    <th>File Name</th>
                                    <th>Type</th>
                                    <th>Size</th>
                                    <th>Description</th>
                                    <th>Uploaded</th>
                                    <th>Actions</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {evidenceFiles.map((file) => (
                                    <tr key={file.id}>
                                      <td>{file.originalName}</td>
                                      <td>
                                        <span className={`file-type-badge ${file.fileType.toLowerCase()}`}>
                                          {file.fileType}
                                        </span>
                                      </td>
                                      <td>{adminService.formatFileSize(file.fileSize)}</td>
                                      <td>{file.description || '-'}</td>
                                      <td>{adminService.formatDate(file.uploadedAt)}</td>
                                      <td>
                                        <button
                                          onClick={() => handleDeleteEvidence(file.id)}
                                          className="btn-delete-small"
                                        >
                                          Delete
                                        </button>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          )}
                        </div>
                      </>
                    ) : (
                      <div className="no-level-selected">
                        <p>← Select a level to manage evidence files</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Activity Logs Tab */}
            {activeTab === 'activity' && (
              <div className="activity-container">
                <h2>Recent Activity</h2>
                {activities && activities.length > 0 ? (
                  <div className="activity-table">
                    <table>
                      <thead>
                        <tr>
                          <th>Type</th>
                          <th>User</th>
                          <th>Details</th>
                          <th>Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activities.map((activity, index) => (
                          <tr key={index}>
                            <td>
                              <span className={`activity-type-badge ${activity.type.toLowerCase()}`}>
                                {activity.type.replace('_', ' ')}
                              </span>
                            </td>
                            <td>{activity.user}</td>
                            <td>
                              {activity.details && (
                                <div className="activity-details">
                                  {activity.details.level && <span>Level: {activity.details.level}</span>}
                                  {activity.details.correct !== undefined && (
                                    <span className={activity.details.correct ? 'correct' : 'incorrect'}>
                                      {activity.details.correct ? '✓ Correct' : '✗ Incorrect'}
                                    </span>
                                  )}
                                </div>
                              )}
                            </td>
                            <td>{adminService.formatDate(activity.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p>No recent activity</p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
