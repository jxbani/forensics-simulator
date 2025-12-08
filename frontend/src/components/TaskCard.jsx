import { useState } from 'react';
import progressService from '../services/progressService';
import FileUpload from './FileUpload';
import FileList from './FileList';
import './TaskCard.css';

const TaskCard = ({ task, onAnswerSubmitted, disabled }) => {
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [hint, setHint] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [showFileUpload, setShowFileUpload] = useState(false);

  const isAnswered = task.userAnswer !== null && task.userAnswer !== undefined;
  const isCorrect = task.userAnswer?.isCorrect;

  // Determine if this task type should support file uploads
  const supportsFileUpload = ['FILE_ANALYSIS', 'NETWORK_ANALYSIS', 'MEMORY_FORENSICS', 'DISK_FORENSICS'].includes(task.type);

  const handleFileUploadSuccess = (result) => {
    // Optionally refresh file list or show success message
    // Success handling can be added here if needed
  };

  const handleFileDeleted = (file) => {
    // Handle file deletion
    // Deletion handling can be added here if needed
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!answer.trim() || loading || isAnswered) {
      return;
    }

    setLoading(true);

    try {
      const result = await progressService.submitAnswer(task.id, answer);
      onAnswerSubmitted(result);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGetHint = async () => {
    if (showHint || isAnswered) return;

    setLoading(true);

    try {
      const hintData = await progressService.getHint(task.id);
      setHint(hintData);
      setShowHint(true);
    } catch (error) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const getTaskTypeIcon = (type) => {
    const icons = {
      MULTIPLE_CHOICE: '☑️',
      TRUE_FALSE: '✓✗',
      SHORT_ANSWER: '✍️',
      FILE_ANALYSIS: '📁',
      COMMAND_LINE: '💻',
      NETWORK_ANALYSIS: '🌐',
      MEMORY_FORENSICS: '🧠',
      DISK_FORENSICS: '💾',
      LOG_ANALYSIS: '📋',
    };
    return icons[type] || '📝';
  };

  return (
    <div className={`task-card ${isAnswered ? (isCorrect ? 'correct' : 'incorrect') : ''} ${disabled ? 'disabled' : ''}`}>
      {/* Task Header */}
      <div className="task-header">
        <div className="task-type">
          <span className="task-icon">{getTaskTypeIcon(task.type)}</span>
          <span className="task-type-text">{task.type.replace(/_/g, ' ')}</span>
        </div>
        <div className="task-points">{task.points} pts</div>
      </div>

      {/* Question */}
      <div className="task-question">
        <h3>Question:</h3>
        <p>{task.question}</p>
      </div>

      {/* Answer Section */}
      {!isAnswered ? (
        <form onSubmit={handleSubmit} className="answer-form">
          <label htmlFor={`answer-${task.id}`}>Your Answer:</label>
          <input
            id={`answer-${task.id}`}
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Enter your answer..."
            disabled={loading || disabled}
            className="answer-input"
          />

          <div className="task-actions">
            {task.hint && !showHint && (
              <button
                type="button"
                onClick={handleGetHint}
                disabled={loading || disabled}
                className="btn btn-hint"
              >
                💡 Get Hint
              </button>
            )}

            <button
              type="submit"
              disabled={!answer.trim() || loading || disabled}
              className="btn btn-submit"
            >
              {loading ? 'Submitting...' : 'Submit Answer'}
            </button>
          </div>

          {/* Hint Display */}
          {showHint && hint && (
            <div className="hint-box">
              <div className="hint-header">
                <span>💡 Hint</span>
                {hint.pointPenalty > 0 && (
                  <span className="penalty">-{hint.pointPenalty} pts</span>
                )}
              </div>
              <p>{hint.hint}</p>
              {hint.message && <p className="hint-message">{hint.message}</p>}
            </div>
          )}

          {/* File Upload Section */}
          {supportsFileUpload && (
            <div className="file-upload-section">
              <button
                type="button"
                onClick={() => setShowFileUpload(!showFileUpload)}
                className="btn btn-file-toggle"
                disabled={disabled}
              >
                📎 {showFileUpload ? 'Hide' : 'Upload'} Evidence Files
              </button>

              {showFileUpload && (
                <>
                  <FileUpload
                    taskId={task.id}
                    onUploadSuccess={handleFileUploadSuccess}
                    maxSize={500 * 1024 * 1024} // 500MB
                  />
                  <FileList
                    taskId={task.id}
                    onFileDeleted={handleFileDeleted}
                  />
                </>
              )}
            </div>
          )}
        </form>
      ) : (
        /* Answered State */
        <div className="answer-result">
          <div className={`result-badge ${isCorrect ? 'success' : 'error'}`}>
            {isCorrect ? '✓ Correct!' : '✗ Incorrect'}
          </div>

          <div className="submitted-answer">
            <strong>Your Answer:</strong>
            <p>{task.userAnswer.answer}</p>
          </div>

          {task.userAnswer.hintsUsed > 0 && (
            <div className="hints-used">
              💡 Hints used: {task.userAnswer.hintsUsed}
            </div>
          )}

          <div className="points-earned">
            <strong>Points Earned:</strong> {isCorrect ? task.points : 0}
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskCard;
