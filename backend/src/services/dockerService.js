import Docker from 'dockerode';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set to false to enable real Docker containers
const FORCE_MOCK_MODE = false;

const TOOL_CONFIGS = {
  volatility: {
    image: 'forensics-lab/volatility:latest',
    port: 8888,
    path: '/lab',
    name: 'Volatility Memory Analysis',
    description: 'Memory forensics framework with Jupyter Lab',
    demoUrl: 'https://volatility3.readthedocs.io/'
  },
  wireshark: {
    image: 'forensics-lab/wireshark:latest',
    port: 5001,
    path: '',
    name: 'Wireshark Network Analysis',
    description: 'Network protocol analyzer with REST API',
    demoUrl: 'https://www.wireshark.org/docs/'
  },
  autopsy: {
    image: 'forensics-lab/autopsy:latest',
    port: 6080,
    path: '/vnc.html',
    name: 'Autopsy Digital Forensics',
    description: 'Digital forensics platform with GUI',
    demoUrl: 'https://www.autopsy.com/docs/'
  },
  'wireshark-gui': {
    image: 'forensics-lab/wireshark-gui:latest',
    port: 6080,
    path: '/vnc.html',
    name: 'Wireshark GUI',
    description: 'Full Wireshark interface with graphical user interface',
    demoUrl: 'https://www.wireshark.org/'
  }
};

/**
 * Docker Service for managing forensic tool containers
 * Now supports both real Docker and demo mode
 */
class DockerService {
  constructor() {
    this.docker = null;
    this.dockerAvailable = false;
    this.mockMode = FORCE_MOCK_MODE;
    this.mockContainers = new Map();

    // Paths for volume mounting
    this.evidenceDir = path.resolve(process.cwd(), '..', 'evidence');
    this.outputDir = path.resolve(process.cwd(), '..', 'output');
  }

  /**
   * Initialize Docker connection
   * @returns {Promise<void>}
   */
  async initDocker() {
    if (this.mockMode) {
      console.log('🎭 Docker Service: Running in DEMO MODE');
      return;
    }

    try {
      this.docker = new Docker({ socketPath: '/var/run/docker.sock' });
      await this.docker.ping();
      this.dockerAvailable = true;
      console.log('✅ Docker Service: Connected to Docker daemon');
    } catch (error) {
      console.warn('⚠️  Docker Service: Docker not available, falling back to demo mode');
      console.warn('Error:', error.message);
      this.mockMode = true;
      this.dockerAvailable = false;
    }
  }

  /**
   * Check Docker daemon connection status
   * @returns {Promise<boolean>} Connection status
   */
  async checkDockerConnection() {
    if (this.mockMode) {
      return true; // Demo mode always "works"
    }

    if (!this.docker) {
      await this.initDocker();
    }

    try {
      await this.docker.ping();
      return true;
    } catch (error) {
      console.error('Docker ping failed:', error.message);
      this.mockMode = true;
      return false;
    }
  }

  /**
   * Create a tool container for a user
   * @param {number} userId - User ID
   * @param {string} toolName - Name of the forensic tool
   * @param {Array<string>} evidenceFiles - Array of evidence file paths
   * @returns {Promise<Object>} Container information
   */
  async createToolContainer(userId, toolName, evidenceFiles = []) {
    const config = TOOL_CONFIGS[toolName];
    if (!config) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    // Demo mode - return mock container
    if (this.mockMode) {
      return this._createMockContainer(userId, toolName, config);
    }

    // Real Docker mode
    try {
      const containerName = `forensics-${toolName}-user${userId}-${Date.now()}`;
      const hostPort = await this._findAvailablePort(config.port);

      // Create container configuration
      const containerConfig = {
        Image: config.image,
        name: containerName,
        ExposedPorts: {
          [`${config.port}/tcp`]: {}
        },
        HostConfig: {
          PortBindings: {
            [`${config.port}/tcp`]: [{ HostPort: String(hostPort) }]
          },
          Binds: [
            `${this.evidenceDir}:/evidence:ro`,
            `${this.outputDir}:/output:rw`
          ],
          AutoRemove: false
        },
        Labels: {
          'forensics.user': String(userId),
          'forensics.tool': toolName,
          'forensics.created': new Date().toISOString()
        }
      };

      // Add shared memory size for Autopsy
      if (toolName === 'autopsy') {
        containerConfig.HostConfig.ShmSize = 2 * 1024 * 1024 * 1024; // 2GB
      }

      console.log(`Creating container: ${containerName} on port ${hostPort}`);

      // Create and start container
      const container = await this.docker.createContainer(containerConfig);
      await container.start();

      const containerInfo = await container.inspect();
      const accessUrl = `http://localhost:${hostPort}${config.path}`;

      return {
        containerId: containerName,
        dockerId: containerInfo.Id,
        userId: userId,
        toolName: toolName,
        port: hostPort,
        status: 'running',
        createdAt: new Date(),
        accessUrl: accessUrl,
        message: `${config.name} is starting up. Click "Open Tool" to access it.`,
        isDemo: false
      };

    } catch (error) {
      console.error(`Failed to create ${toolName} container:`, error.message);
      throw new Error(`Failed to create container: ${error.message}`);
    }
  }

  /**
   * Create a mock container for demo mode
   * @private
   */
  _createMockContainer(userId, toolName, config) {
    const mockContainer = {
      containerId: `demo-${toolName}-${Date.now()}`,
      dockerId: `demo-docker-${Date.now()}`,
      userId: userId,
      toolName: toolName,
      port: config.port,
      status: 'running',
      createdAt: new Date(),
      accessUrl: config.demoUrl,
      message: '🎭 Demo Mode: Click "Open Tool" to view documentation',
      isDemo: true
    };

    this.mockContainers.set(mockContainer.dockerId, mockContainer);
    return mockContainer;
  }

  /**
   * Find an available port for the container
   * @private
   */
  async _findAvailablePort(preferredPort) {
    if (this.mockMode) {
      return preferredPort;
    }

    // Start with preferred port and increment if taken
    let port = preferredPort;
    const maxAttempts = 100;

    for (let i = 0; i < maxAttempts; i++) {
      const inUse = await this._isPortInUse(port);
      if (!inUse) {
        return port;
      }
      port++;
    }

    throw new Error(`Could not find available port near ${preferredPort}`);
  }

  /**
   * Check if a port is in use by a container
   * @private
   */
  async _isPortInUse(port) {
    try {
      const containers = await this.docker.listContainers();
      return containers.some(container => {
        return container.Ports.some(p => p.PublicPort === port);
      });
    } catch (error) {
      return false;
    }
  }

  /**
   * Stop a running tool container
   * @param {string} dockerId - Docker container ID
   * @returns {Promise<Object>} Operation result
   */
  async stopToolContainer(dockerId) {
    // Demo mode
    if (dockerId.startsWith('demo-') || this.mockMode) {
      const deleted = this.mockContainers.delete(dockerId);
      return {
        success: true,
        message: deleted ? 'Demo container stopped' : 'Container not found'
      };
    }

    // Real Docker mode
    try {
      const container = this.docker.getContainer(dockerId);
      await container.stop({ t: 10 }); // 10 second graceful shutdown
      await container.remove();

      console.log(`Container ${dockerId} stopped and removed`);

      return {
        success: true,
        message: 'Container stopped successfully'
      };
    } catch (error) {
      console.error(`Failed to stop container ${dockerId}:`, error.message);

      // If container doesn't exist, still return success
      if (error.statusCode === 404) {
        return {
          success: true,
          message: 'Container not found (may have already been removed)'
        };
      }

      throw new Error(`Failed to stop container: ${error.message}`);
    }
  }

  /**
   * List all active containers for a user
   * @param {number} userId - User ID
   * @returns {Promise<Array>} Array of container information
   */
  async listUserContainers(userId) {
    // Demo mode
    if (this.mockMode) {
      const containers = Array.from(this.mockContainers.values())
        .filter(c => c.userId === userId)
        .map(c => ({
          dockerId: c.dockerId,
          toolName: c.toolName,
          containerId: c.containerId,
          status: 'running',
          created: Math.floor(c.createdAt.getTime() / 1000),
          ports: [{ PublicPort: c.port }],
          isDemo: true,
          accessUrl: c.accessUrl
        }));

      return containers;
    }

    // Real Docker mode
    try {
      const allContainers = await this.docker.listContainers({
        all: false, // Only running containers
        filters: {
          label: [`forensics.user=${userId}`]
        }
      });

      const containers = [];

      for (const containerInfo of allContainers) {
        const toolName = containerInfo.Labels['forensics.tool'];
        const config = TOOL_CONFIGS[toolName];

        if (!config) continue;

        const publicPort = containerInfo.Ports.find(p => p.PrivatePort === config.port)?.PublicPort || config.port;
        const accessUrl = `http://localhost:${publicPort}${config.path}`;

        containers.push({
          dockerId: containerInfo.Id,
          toolName: toolName,
          containerId: containerInfo.Names[0].replace('/', ''),
          status: containerInfo.State,
          created: containerInfo.Created,
          ports: containerInfo.Ports,
          isDemo: false,
          accessUrl: accessUrl
        });
      }

      return containers;
    } catch (error) {
      console.error('Failed to list containers:', error.message);
      return [];
    }
  }

  /**
   * Get the status of a specific container
   * @param {string} dockerId - Docker container ID
   * @returns {Promise<Object>} Container status information
   */
  async getContainerStatus(dockerId) {
    // Demo mode
    if (dockerId.startsWith('demo-') || this.mockMode) {
      const container = this.mockContainers.get(dockerId);
      if (!container) {
        return { status: 'not_found', running: false };
      }

      return {
        status: 'running',
        running: true,
        startedAt: container.createdAt.toISOString(),
        finishedAt: null,
        exitCode: 0,
        userId: container.userId,
        isDemo: true
      };
    }

    // Real Docker mode
    try {
      const container = this.docker.getContainer(dockerId);
      const info = await container.inspect();

      return {
        status: info.State.Status,
        running: info.State.Running,
        startedAt: info.State.StartedAt,
        finishedAt: info.State.FinishedAt,
        exitCode: info.State.ExitCode,
        userId: parseInt(info.Config.Labels['forensics.user'] || 0),
        isDemo: false
      };
    } catch (error) {
      if (error.statusCode === 404) {
        return { status: 'not_found', running: false };
      }
      throw error;
    }
  }

  /**
   * Get container logs
   * @param {string} dockerId - Docker container ID
   * @param {number} tail - Number of log lines to return
   * @returns {Promise<string>} Container logs
   */
  async getContainerLogs(dockerId, tail = 50) {
    // Demo mode
    if (dockerId.startsWith('demo-') || this.mockMode) {
      return `[DEMO MODE] Container logs for ${dockerId}\nThis is a simulated container for demonstration purposes\n🎭 Demo Mode Active - Tools are simulated`;
    }

    // Real Docker mode
    try {
      const container = this.docker.getContainer(dockerId);
      const logs = await container.logs({
        stdout: true,
        stderr: true,
        tail: tail,
        timestamps: true
      });

      return logs.toString('utf8');
    } catch (error) {
      console.error(`Failed to get logs for ${dockerId}:`, error.message);
      return `Error retrieving logs: ${error.message}`;
    }
  }

  /**
   * Clean up idle containers
   * @returns {Promise<Object>} Cleanup statistics
   */
  async cleanupIdleContainers() {
    if (this.mockMode) {
      return { cleaned: 0, total: this.mockContainers.size };
    }

    try {
      const containers = await this.docker.listContainers({
        all: false,
        filters: {
          label: ['forensics.tool']
        }
      });

      let cleaned = 0;
      const idleThreshold = 3600 * 1000; // 1 hour

      for (const containerInfo of containers) {
        const created = containerInfo.Created * 1000;
        const age = Date.now() - created;

        if (age > idleThreshold) {
          try {
            const container = this.docker.getContainer(containerInfo.Id);
            await container.stop({ t: 10 });
            await container.remove();
            cleaned++;
            console.log(`Cleaned up idle container: ${containerInfo.Names[0]}`);
          } catch (error) {
            console.error(`Failed to clean up ${containerInfo.Id}:`, error.message);
          }
        }
      }

      return { cleaned, total: containers.length };
    } catch (error) {
      console.error('Cleanup failed:', error.message);
      return { cleaned: 0, total: 0, error: error.message };
    }
  }
}

// Create and initialize service
const dockerService = new DockerService();
dockerService.initDocker();

export default dockerService;
