# Real-Time Updates Enhancement Guide

## Current Implementation
The dashboard uses **polling** (refreshes every 30 seconds) to update points and rank.

## Advanced Implementation: WebSocket Support

Your backend already has WebSocket support configured in `backend/src/config/socket.js`.

### Step 1: Create WebSocket Hook

Create `frontend/src/hooks/useSocket.js`:

```jsx
import { useEffect, useRef } from 'react';
import io from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

export const useSocket = (userId, onProgressUpdate) => {
  const socketRef = useRef(null);

  useEffect(() => {
    if (!userId) return;

    // Get authentication token
    const token = localStorage.getItem('token');
    if (!token) return;

    // Connect to WebSocket
    socketRef.current = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'],
    });

    const socket = socketRef.current;

    // Listen for connection
    socket.on('connect', () => {
      console.log('✓ WebSocket connected');

      // Subscribe to progress updates
      socket.emit('progress:subscribe');
    });

    // Listen for progress updates
    socket.on('progress:updated', (data) => {
      console.log('Progress updated:', data);
      if (onProgressUpdate) {
        onProgressUpdate(data);
      }
    });

    // Handle errors
    socket.on('connect_error', (error) => {
      console.error('WebSocket connection error:', error);
    });

    // Cleanup on unmount
    return () => {
      socket.emit('progress:unsubscribe');
      socket.disconnect();
    };
  }, [userId, onProgressUpdate]);

  return socketRef.current;
};
```

### Step 2: Update Dashboard to Use WebSocket

Update `frontend/src/pages/Dashboard.jsx`:

```jsx
import { useSocket } from '../hooks/useSocket';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [levels, setLevels] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initial data fetch
  useEffect(() => {
    fetchDashboardData();
  }, []);

  // WebSocket real-time updates
  useSocket(user?.id, (progressData) => {
    // Real-time update when user completes a task
    fetchDashboardData(); // Refresh all data
  });

  // ... rest of component
};
```

### Step 3: Install Socket.IO Client

```bash
cd frontend
npm install socket.io-client
```

### Step 4: Trigger WebSocket Events (Backend)

Update `backend/src/controllers/progressController.js` after task submission:

```javascript
// In submitAnswer function, after updating progress
if (isCorrect && req.io) {
  // Emit progress update to user
  req.io.to(`user:${req.user.id}`).emit('progress:updated', {
    userId: req.user.id,
    taskId,
    pointsEarned,
    newTotalScore: /* calculate total */
  });
}
```

## Comparison: Polling vs WebSocket

### Polling (Current - 30s refresh)
**Pros:**
- ✓ Simple to implement (already done)
- ✓ Works everywhere
- ✓ No additional dependencies

**Cons:**
- ✗ Updates delayed up to 30 seconds
- ✗ More server requests (every 30s per user)

### WebSocket (Advanced)
**Pros:**
- ✓ Instant updates (< 1 second)
- ✓ Lower server load
- ✓ Better user experience

**Cons:**
- ✗ Requires socket.io-client library
- ✗ Slightly more complex
- ✗ Requires backend WebSocket support (already configured)

## Recommendation

**For your current needs:** The 30-second polling is sufficient and already implemented.

**For production/scale:** Upgrade to WebSocket for instant updates and better performance.

## Files Modified

✓ `/home/jacob/forensics-simulator/frontend/src/pages/Dashboard.jsx`
  - Added leaderboard service import
  - Updated fetchDashboardData to fetch rank
  - Fixed points display logic
  - Added 30-second auto-refresh

## Next Steps

1. **Test the current fixes** - Both issues should be resolved
2. **Monitor performance** - 30s polling is fine for most use cases
3. **Consider WebSocket** - If you need instant updates or scale to 100+ concurrent users
