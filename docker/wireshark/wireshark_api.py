#!/usr/bin/env python3
"""
Wireshark Network Analysis API
Provides REST endpoints for analyzing network capture files using tshark
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import json
import os
import logging
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configuration
EVIDENCE_DIR = '/evidence'
OUTPUT_DIR = '/output'
TSHARK_TIMEOUT = 60  # seconds
MAX_PACKETS = 1000  # Maximum packets to return in analyze endpoint


def run_tshark_command(command, timeout=TSHARK_TIMEOUT):
    """
    Execute a tshark command with timeout and error handling

    Args:
        command (list): Command and arguments as list
        timeout (int): Timeout in seconds

    Returns:
        tuple: (success, stdout, stderr)
    """
    try:
        logger.info(f"Executing command: {' '.join(command)}")

        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=timeout,
            text=True
        )

        if result.returncode != 0:
            logger.error(f"Command failed with return code {result.returncode}: {result.stderr}")
            return False, None, result.stderr

        return True, result.stdout, None

    except subprocess.TimeoutExpired:
        logger.error(f"Command timed out after {timeout} seconds")
        return False, None, f"Command timed out after {timeout} seconds"
    except Exception as e:
        logger.error(f"Error executing command: {str(e)}")
        return False, None, str(e)


def validate_file_path(filename):
    """
    Validate and construct safe file path

    Args:
        filename (str): Filename to validate

    Returns:
        tuple: (valid, filepath, error_message)
    """
    # Security: Prevent path traversal
    if not filename or '..' in filename or filename.startswith('/'):
        return False, None, "Invalid filename"

    # Construct full path
    filepath = os.path.join(EVIDENCE_DIR, filename)

    # Check if file exists
    if not os.path.exists(filepath):
        return False, None, f"File not found: {filename}"

    # Check if it's actually a file
    if not os.path.isfile(filepath):
        return False, None, f"Not a file: {filename}"

    return True, filepath, None


@app.route('/', methods=['GET'])
def welcome():
    """
    Welcome endpoint - shows available API endpoints
    """
    return jsonify({
        'service': 'Wireshark Network Analysis API',
        'status': 'running',
        'endpoints': {
            '/health': 'GET - Service health check',
            '/files': 'GET - List available PCAP files',
            '/analyze': 'POST - Analyze PCAP file (requires: filename, optional: filters, limit)',
            '/statistics': 'POST - Get network statistics (requires: filename)',
            '/protocols': 'POST - Get protocol hierarchy (requires: filename)'
        },
        'documentation': 'Send POST requests with JSON body to analysis endpoints'
    }), 200


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Returns service status and tshark version
    """
    try:
        # Check tshark is available
        result = subprocess.run(
            ['tshark', '--version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
            text=True
        )

        version = result.stdout.split('\n')[0] if result.stdout else 'Unknown'

        return jsonify({
            'status': 'healthy',
            'service': 'Wireshark Analysis API',
            'tshark_version': version,
            'evidence_dir': EVIDENCE_DIR,
            'output_dir': OUTPUT_DIR
        }), 200

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


@app.route('/analyze', methods=['POST'])
def analyze_pcap():
    """
    Analyze pcap file with tshark and return packet data

    Request body:
        filename (str): Name of pcap file in evidence directory
        filters (str, optional): Display filter (Wireshark syntax)
        limit (int, optional): Max packets to return (default: 1000)

    Returns:
        JSON array of packet data
    """
    try:
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body required'
            }), 400

        filename = data.get('filename')
        filters = data.get('filters', '')
        limit = min(int(data.get('limit', MAX_PACKETS)), MAX_PACKETS)

        if not filename:
            return jsonify({
                'success': False,
                'error': 'filename is required'
            }), 400

        # Validate file path
        valid, filepath, error = validate_file_path(filename)
        if not valid:
            return jsonify({
                'success': False,
                'error': error
            }), 404

        # Build tshark command
        command = ['tshark', '-r', filepath, '-T', 'json', '-c', str(limit)]

        # Add display filter if provided
        if filters:
            command.extend(['-Y', filters])

        # Execute command
        success, stdout, stderr = run_tshark_command(command)

        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to analyze pcap',
                'details': stderr
            }), 500

        # Parse JSON output
        try:
            packets = json.loads(stdout) if stdout else []
        except json.JSONDecodeError:
            packets = []

        return jsonify({
            'success': True,
            'filename': filename,
            'filters': filters,
            'packet_count': len(packets),
            'packets': packets
        }), 200

    except Exception as e:
        logger.error(f"Error in analyze endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/statistics', methods=['POST'])
def get_statistics():
    """
    Get pcap statistics including TCP and UDP conversations

    Request body:
        filename (str): Name of pcap file in evidence directory

    Returns:
        Statistics text including conversation data
    """
    try:
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body required'
            }), 400

        filename = data.get('filename')

        if not filename:
            return jsonify({
                'success': False,
                'error': 'filename is required'
            }), 400

        # Validate file path
        valid, filepath, error = validate_file_path(filename)
        if not valid:
            return jsonify({
                'success': False,
                'error': error
            }), 404

        # Build tshark command for statistics
        command = [
            'tshark', '-r', filepath, '-q',
            '-z', 'conv,tcp',
            '-z', 'conv,udp'
        ]

        # Execute command
        success, stdout, stderr = run_tshark_command(command)

        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to get statistics',
                'details': stderr
            }), 500

        return jsonify({
            'success': True,
            'filename': filename,
            'statistics': stdout
        }), 200

    except Exception as e:
        logger.error(f"Error in statistics endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/protocols', methods=['POST'])
def get_protocols():
    """
    Get protocol hierarchy statistics from pcap file

    Request body:
        filename (str): Name of pcap file in evidence directory

    Returns:
        Protocol hierarchy text
    """
    try:
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body required'
            }), 400

        filename = data.get('filename')

        if not filename:
            return jsonify({
                'success': False,
                'error': 'filename is required'
            }), 400

        # Validate file path
        valid, filepath, error = validate_file_path(filename)
        if not valid:
            return jsonify({
                'success': False,
                'error': error
            }), 404

        # Build tshark command for protocol hierarchy
        command = [
            'tshark', '-r', filepath, '-q',
            '-z', 'io,phs'
        ]

        # Execute command
        success, stdout, stderr = run_tshark_command(command)

        if not success:
            return jsonify({
                'success': False,
                'error': 'Failed to get protocol hierarchy',
                'details': stderr
            }), 500

        return jsonify({
            'success': True,
            'filename': filename,
            'protocols': stdout
        }), 200

    except Exception as e:
        logger.error(f"Error in protocols endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/files', methods=['GET'])
def list_files():
    """
    List available pcap files in evidence directory

    Returns:
        Array of file information objects
    """
    try:
        files = []

        # Check if evidence directory exists
        if not os.path.exists(EVIDENCE_DIR):
            return jsonify({
                'success': True,
                'files': [],
                'count': 0
            }), 200

        # List all files in evidence directory
        for filename in os.listdir(EVIDENCE_DIR):
            filepath = os.path.join(EVIDENCE_DIR, filename)

            # Skip directories
            if not os.path.isfile(filepath):
                continue

            # Get file stats
            stat = os.stat(filepath)

            files.append({
                'filename': filename,
                'size': stat.st_size,
                'modified': stat.st_mtime
            })

        return jsonify({
            'success': True,
            'files': files,
            'count': len(files)
        }), 200

    except Exception as e:
        logger.error(f"Error listing files: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.errorhandler(404)
def not_found(error):
    """Handle 404 errors"""
    return jsonify({
        'success': False,
        'error': 'Endpoint not found'
    }), 404


@app.errorhandler(500)
def internal_error(error):
    """Handle 500 errors"""
    return jsonify({
        'success': False,
        'error': 'Internal server error'
    }), 500


if __name__ == '__main__':
    logger.info("Starting Wireshark Analysis API")
    logger.info(f"Evidence directory: {EVIDENCE_DIR}")
    logger.info(f"Output directory: {OUTPUT_DIR}")

    # Ensure directories exist
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run Flask application
    app.run(
        host='0.0.0.0',
        port=5001,
        debug=False
    )
