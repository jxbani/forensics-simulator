import express from 'express';
import dockerService from '../services/dockerService.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/start', async (req, res) => {
  try {
    const { toolName, evidenceFiles } = req.body;
    const userId = req.user.id;

    if (!toolName) {
      return res.status(400).json({ error: 'Tool name is required' });
    }

    const validTools = ['volatility', 'wireshark', 'autopsy', 'ftk'];
    if (!validTools.includes(toolName)) {
      return res.status(400).json({ error: 'Invalid tool name' });
    }

    const container = await dockerService.createToolContainer(
      userId,
      toolName,
      evidenceFiles || []
    );

    res.json({
      success: true,
      container: {
        containerId: container.containerId,
        toolName: container.toolName,
        accessUrl: container.accessUrl,
        port: container.port,
        status: container.status,
        message: container.message
      }
    });
  } catch (error) {
    console.error('Error starting tool:', error);
    res.status(500).json({
      error: error.message,
      details: 'Check server logs for more information'
    });
  }
});

router.post('/stop/:dockerId', async (req, res) => {
  try {
    const { dockerId } = req.params;
    const userId = req.user.id;

    // Verify container belongs to user (skip for demo containers)
    if (!dockerId.startsWith('demo-') && !dockerId.startsWith('mock-')) {
      const containers = await dockerService.listUserContainers(userId);
      const container = containers.find(c => c.dockerId === dockerId);

      if (!container) {
        return res.status(404).json({ error: 'Container not found or access denied' });
      }
    }

    const result = await dockerService.stopToolContainer(dockerId);
    res.json(result);
  } catch (error) {
    console.error('Error stopping tool:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', async (req, res) => {
  try {
    const userId = req.user.id;
    const containers = await dockerService.listUserContainers(userId);

    res.json({ containers });
  } catch (error) {
    console.error('Error listing containers:', error);
    res.json({ containers: [] });
  }
});

router.get('/status/:dockerId', async (req, res) => {
  try {
    const { dockerId } = req.params;
    const userId = req.user.id;

    const containers = await dockerService.listUserContainers(userId);
    const container = containers.find(c => c.dockerId === dockerId);

    if (!container && !dockerId.startsWith('demo-') && !dockerId.startsWith('mock-')) {
      return res.status(404).json({ error: 'Container not found' });
    }

    const status = await dockerService.getContainerStatus(dockerId);
    const logs = await dockerService.getContainerLogs(dockerId, 50);

    res.json({ status, logs });
  } catch (error) {
    console.error('Error getting status:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/available', async (req, res) => {
  const tools = [
    {
      id: 'volatility',
      name: 'Volatility 3',
      description: 'Memory forensics and analysis framework',
      icon: '🧠',
      supportedFiles: ['.raw', '.mem', '.dmp'],
      interface: 'jupyter',
      documentation: 'https://volatility3.readthedocs.io/'
    },
    {
      id: 'wireshark',
      name: 'Wireshark',
      description: 'Network protocol analyzer',
      icon: '🦈',
      supportedFiles: ['.pcap', '.pcapng'],
      interface: 'web',
      documentation: 'https://www.wireshark.org/docs/'
    },
    {
      id: 'autopsy',
      name: 'Autopsy',
      description: 'Digital forensics platform',
      icon: '🔍',
      supportedFiles: ['.dd', '.img', '.e01'],
      interface: 'vnc',
      documentation: 'https://www.autopsy.com/docs/'
    },
    {
      id: 'ftk',
      name: 'FTK Imager',
      description: 'Forensic imaging tool',
      icon: '💾',
      supportedFiles: ['.dd', '.img', '.iso'],
      interface: 'vnc',
      documentation: 'https://www.exterro.com/ftk-imager'
    }
  ];

  res.json({ tools });
});

router.get('/docker-status', async (req, res) => {
  try {
    await dockerService.checkDockerConnection();
    res.json({
      connected: true,
      mode: dockerService.mockMode ? 'mock' : 'real',
      message: dockerService.mockMode
        ? 'Running in demo mode (Docker not available)'
        : 'Docker is running'
    });
  } catch (error) {
    res.status(503).json({
      connected: false,
      mode: 'unavailable',
      message: error.message
    });
  }
});

export default router;
