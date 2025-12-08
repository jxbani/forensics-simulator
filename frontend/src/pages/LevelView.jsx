import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import levelService from '../services/levelService';
import progressService from '../services/progressService';
import { downloadEvidenceFile } from '../services/api';
import TaskCard from '../components/TaskCard';
import './LevelView.css';

const LevelView = () => {
  const { levelId } = useParams();
  const navigate = useNavigate();

  const [level, setLevel] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [completing, setCompleting] = useState(false);

  useEffect(() => {
    fetchLevelData();
  }, [levelId]);

  const fetchLevelData = async () => {
    try {
      setLoading(true);
      setError(null);

      const data = await levelService.getLevelTasks(levelId);
      setLevel(data.level);
      setTasks(data.tasks || []);

      // Find first unanswered task
      const firstUnanswered = data.tasks.findIndex(t => !t.userAnswer);
      if (firstUnanswered !== -1) {
        setCurrentTaskIndex(firstUnanswered);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error fetching level data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerSubmitted = (result) => {
    // Refresh level data to get updated user answers
    fetchLevelData();
  };

  const handleCompleteLevel = async () => {
    const allAnswered = tasks.every(t => t.userAnswer);

    if (!allAnswered) {
      alert('Please answer all tasks before completing the level.');
      return;
    }

    if (!confirm('Are you sure you want to complete this level?')) {
      return;
    }

    setCompleting(true);

    try {
      const result = await progressService.completeLevel(levelId);

      alert(
        `Level Completed!\n\n` +
        `Score: ${result.progress.score}\n` +
        `Accuracy: ${result.stats.accuracy}\n` +
        `Achievements: ${result.achievementsEarned.length}`
      );

      navigate('/dashboard');
    } catch (err) {
      alert(err.message);
    } finally {
      setCompleting(false);
    }
  };

  const calculateProgress = () => {
    if (!tasks.length) return 0;
    const answered = tasks.filter(t => t.userAnswer).length;
    return Math.round((answered / tasks.length) * 100);
  };

  const getCorrectAnswers = () => {
    return tasks.filter(t => t.userAnswer?.isCorrect).length;
  };

  const getTotalPoints = () => {
    return tasks.reduce((sum, t) => {
      if (t.userAnswer?.isCorrect) {
        return sum + t.points;
      }
      return sum;
    }, 0);
  };

  const goToTask = (index) => {
    if (index >= 0 && index < tasks.length) {
      setCurrentTaskIndex(index);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading level...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Error Loading Level</h2>
        <p>{error}</p>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const currentTask = tasks[currentTaskIndex];
  const allAnswered = tasks.every(t => t.userAnswer);

  return (
    <div className="level-view">
      {/* Header */}
      <header className="level-header">
        <button onClick={() => navigate('/dashboard')} className="back-button">
          ← Back to Dashboard
        </button>

        <div className="level-info">
          <h1>{level?.title}</h1>
          <div className="level-meta">
            <span>Level {level?.orderIndex}</span>
            <span>•</span>
            <span>{tasks.length} Tasks</span>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="level-progress-section">
        <div className="progress-stats">
          <div className="stat">
            <span className="stat-label">Progress:</span>
            <span className="stat-value">{calculateProgress()}%</span>
          </div>
          <div className="stat">
            <span className="stat-label">Correct:</span>
            <span className="stat-value">{getCorrectAnswers()}/{tasks.length}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Points:</span>
            <span className="stat-value">{getTotalPoints()}</span>
          </div>
        </div>

        <div className="progress-bar-container">
          <div
            className="progress-bar"
            style={{ width: `${calculateProgress()}%` }}
          />
        </div>
      </div>

      {/* Evidence Files Section */}
      {level?.evidenceFiles && level.evidenceFiles.length > 0 && (
        <div className="evidence-files-section">
          <h2>📁 Evidence Files</h2>
          <p className="evidence-description">
            Download and analyze these files to complete the tasks below
          </p>

          <div className="evidence-files-grid">
            {level.evidenceFiles.map((file) => (
              <div key={file.id} className="evidence-file-card">
                <div className="evidence-file-header">
                  <div className="evidence-file-icon">
                    {file.fileType === 'PCAP' && '📡'}
                    {file.fileType === 'MEMORY_DUMP' && '💾'}
                    {file.fileType === 'DISK_IMAGE' && '💿'}
                    {file.fileType === 'LOG_FILE' && '📄'}
                    {file.fileType === 'EXECUTABLE' && '⚙️'}
                    {file.fileType === 'DOCUMENT' && '📋'}
                    {file.fileType === 'COMPRESSED' && '🗜️'}
                    {file.fileType === 'OTHER' && '📎'}
                  </div>
                  <span className={`evidence-type-badge ${file.fileType.toLowerCase()}`}>
                    {file.fileType.replace('_', ' ')}
                  </span>
                </div>

                <div className="evidence-file-info">
                  <h4 className="evidence-file-name">{file.originalName}</h4>
                  <p className="evidence-file-size">
                    Size: {(file.fileSize / (1024 * 1024)).toFixed(2)} MB
                  </p>
                  {file.description && (
                    <p className="evidence-file-description">{file.description}</p>
                  )}
                  <p className="evidence-file-date">
                    Uploaded: {new Date(file.uploadedAt).toLocaleDateString()}
                  </p>
                </div>

                <button
                  onClick={() => downloadEvidenceFile(file.id)}
                  className="btn btn-download"
                >
                  ⬇️ Download
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="level-content">
        {/* Task Navigation Sidebar */}
        <aside className="task-navigation">
          <h3>Tasks</h3>
          <div className="task-list">
            {tasks.map((task, index) => (
              <button
                key={task.id}
                onClick={() => goToTask(index)}
                className={`task-nav-item ${index === currentTaskIndex ? 'active' : ''} ${
                  task.userAnswer ? (task.userAnswer.isCorrect ? 'correct' : 'incorrect') : ''
                }`}
              >
                <span className="task-number">Task {index + 1}</span>
                {task.userAnswer && (
                  <span className="task-status">
                    {task.userAnswer.isCorrect ? '✓' : '✗'}
                  </span>
                )}
              </button>
            ))}
          </div>

          {allAnswered && (
            <button
              onClick={handleCompleteLevel}
              disabled={completing}
              className="btn btn-complete"
            >
              {completing ? 'Completing...' : 'Complete Level'}
            </button>
          )}
        </aside>

        {/* Current Task */}
        <main className="task-display">
          <div className="task-header-info">
            <h2>Task {currentTaskIndex + 1} of {tasks.length}</h2>
          </div>

          {currentTask && (
            <TaskCard
              task={currentTask}
              onAnswerSubmitted={handleAnswerSubmitted}
              disabled={false}
            />
          )}

          {/* Navigation Buttons */}
          <div className="task-navigation-buttons">
            <button
              onClick={() => goToTask(currentTaskIndex - 1)}
              disabled={currentTaskIndex === 0}
              className="btn btn-secondary"
            >
              ← Previous
            </button>

            <span className="task-counter">
              {currentTaskIndex + 1} / {tasks.length}
            </span>

            <button
              onClick={() => goToTask(currentTaskIndex + 1)}
              disabled={currentTaskIndex === tasks.length - 1}
              className="btn btn-secondary"
            >
              Next →
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LevelView;
