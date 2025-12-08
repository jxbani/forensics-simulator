#!/usr/bin/env python3
"""
Forensic Imaging API
Provides REST endpoints for creating and verifying forensic disk images
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import subprocess
import hashlib
import os
import threading
import uuid
import logging
from datetime import datetime

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

# Job tracking
imaging_jobs = {}
job_lock = threading.Lock()


class ImagingJob:
    """Represents a forensic imaging job"""
    def __init__(self, job_id, source, destination, method):
        self.job_id = job_id
        self.source = source
        self.destination = destination
        self.method = method
        self.status = 'pending'
        self.progress = 0
        self.error = None
        self.started_at = None
        self.completed_at = None
        self.hash_value = None

    def to_dict(self):
        """Convert job to dictionary for JSON response"""
        return {
            'job_id': self.job_id,
            'source': self.source,
            'destination': self.destination,
            'method': self.method,
            'status': self.status,
            'progress': self.progress,
            'error': self.error,
            'started_at': self.started_at,
            'completed_at': self.completed_at,
            'hash': self.hash_value
        }


def calculate_file_hash(filepath):
    """
    Calculate SHA256 hash of a file

    Args:
        filepath (str): Path to file

    Returns:
        str: SHA256 hash in hexadecimal
    """
    sha256_hash = hashlib.sha256()

    try:
        with open(filepath, "rb") as f:
            # Read and update hash in chunks for large files
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)

        return sha256_hash.hexdigest()
    except Exception as e:
        logger.error(f"Error calculating hash: {str(e)}")
        raise


def run_imaging_job(job):
    """
    Execute a forensic imaging job in background thread

    Args:
        job (ImagingJob): Job to execute
    """
    try:
        job.status = 'running'
        job.started_at = datetime.now().isoformat()
        logger.info(f"Starting imaging job {job.job_id}: {job.source} -> {job.destination}")

        # Build command based on method
        if job.method == 'dcfldd':
            # Use dcfldd for imaging with hashing
            command = [
                'dcfldd',
                f'if={job.source}',
                f'of={job.destination}',
                'hash=sha256',
                'hashwindow=1G',
                'hashlog=/tmp/hash.log',
                'bs=4M',
                'conv=noerror,sync',
                'status=on'
            ]
        elif job.method == 'ewf':
            # Use ewfacquire for E01 format
            command = [
                'ewfacquire',
                '-t', job.destination,
                '-u',  # unattended mode
                '-C', 'case',
                '-D', 'description',
                '-E', 'evidence',
                '-e', 'examiner',
                '-m', 'fixed',
                '-M', 'logical',
                '-N', 'notes',
                '-c', 'deflate',
                '-f', 'encase6',
                job.source
            ]
        else:
            raise ValueError(f"Unknown imaging method: {job.method}")

        # Execute command
        logger.info(f"Executing: {' '.join(command)}")
        result = subprocess.run(
            command,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            timeout=7200  # 2 hour timeout
        )

        if result.returncode != 0:
            raise Exception(f"Imaging failed: {result.stderr}")

        # Calculate hash of output file
        logger.info(f"Calculating hash for {job.destination}")
        job.hash_value = calculate_file_hash(job.destination)

        job.status = 'completed'
        job.progress = 100
        job.completed_at = datetime.now().isoformat()
        logger.info(f"Job {job.job_id} completed successfully. Hash: {job.hash_value}")

    except subprocess.TimeoutExpired:
        job.status = 'failed'
        job.error = 'Imaging operation timed out after 2 hours'
        logger.error(f"Job {job.job_id} timed out")
    except Exception as e:
        job.status = 'failed'
        job.error = str(e)
        logger.error(f"Job {job.job_id} failed: {str(e)}")


@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    Returns service status and available tools
    """
    try:
        # Check dcfldd version
        dcfldd_result = subprocess.run(
            ['dcfldd', '--version'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
            text=True
        )
        dcfldd_version = 'Available' if dcfldd_result.returncode == 0 else 'Not available'

        # Check ewfacquire version
        ewf_result = subprocess.run(
            ['ewfacquire', '-V'],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            timeout=5,
            text=True
        )
        ewf_version = ewf_result.stdout.split('\n')[0] if ewf_result.returncode == 0 else 'Not available'

        return jsonify({
            'status': 'healthy',
            'service': 'Forensic Imaging API',
            'tools': {
                'dcfldd': dcfldd_version,
                'ewfacquire': ewf_version
            },
            'evidence_dir': EVIDENCE_DIR,
            'output_dir': OUTPUT_DIR,
            'active_jobs': len([j for j in imaging_jobs.values() if j.status == 'running'])
        }), 200

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return jsonify({
            'status': 'unhealthy',
            'error': str(e)
        }), 500


@app.route('/create-image', methods=['POST'])
def create_image():
    """
    Create a forensic image from source to destination

    Request body:
        source (str): Source device or file path
        destination (str): Destination file path in output directory
        method (str): Imaging method ('dcfldd' or 'ewf')

    Returns:
        Job information with job_id for tracking
    """
    try:
        # Parse request
        data = request.get_json()
        if not data:
            return jsonify({
                'success': False,
                'error': 'Request body required'
            }), 400

        source = data.get('source')
        destination = data.get('destination')
        method = data.get('method', 'dcfldd')

        # Validate inputs
        if not source or not destination:
            return jsonify({
                'success': False,
                'error': 'source and destination are required'
            }), 400

        if method not in ['dcfldd', 'ewf']:
            return jsonify({
                'success': False,
                'error': 'method must be either "dcfldd" or "ewf"'
            }), 400

        # Validate source path (security check)
        if '..' in source or not os.path.exists(source):
            return jsonify({
                'success': False,
                'error': 'Invalid source path'
            }), 400

        # Construct full destination path
        dest_path = os.path.join(OUTPUT_DIR, destination)

        # Generate job ID
        job_id = str(uuid.uuid4())

        # Create job
        job = ImagingJob(job_id, source, dest_path, method)

        # Store job
        with job_lock:
            imaging_jobs[job_id] = job

        # Start imaging in background thread
        thread = threading.Thread(target=run_imaging_job, args=(job,))
        thread.daemon = True
        thread.start()

        logger.info(f"Created imaging job {job_id}")

        return jsonify({
            'success': True,
            'job_id': job_id,
            'message': 'Imaging job started',
            'job': job.to_dict()
        }), 202  # Accepted

    except Exception as e:
        logger.error(f"Error creating image: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/job-status/<job_id>', methods=['GET'])
def get_job_status(job_id):
    """
    Get status of an imaging job

    Args:
        job_id (str): Job ID to query

    Returns:
        Job status and details
    """
    try:
        with job_lock:
            job = imaging_jobs.get(job_id)

        if not job:
            return jsonify({
                'success': False,
                'error': 'Job not found'
            }), 404

        return jsonify({
            'success': True,
            'job': job.to_dict()
        }), 200

    except Exception as e:
        logger.error(f"Error getting job status: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/verify-image', methods=['POST'])
def verify_image():
    """
    Calculate SHA256 hash of an image file for verification

    Request body:
        filename (str): Filename in output directory

    Returns:
        SHA256 hash of the file
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

        # Security: Prevent path traversal
        if '..' in filename or filename.startswith('/'):
            return jsonify({
                'success': False,
                'error': 'Invalid filename'
            }), 400

        # Construct full path
        filepath = os.path.join(OUTPUT_DIR, filename)

        # Check if file exists
        if not os.path.exists(filepath):
            return jsonify({
                'success': False,
                'error': f'File not found: {filename}'
            }), 404

        # Calculate hash
        logger.info(f"Calculating hash for {filepath}")
        hash_value = calculate_file_hash(filepath)

        return jsonify({
            'success': True,
            'filename': filename,
            'sha256': hash_value,
            'algorithm': 'SHA256',
            'verified_at': datetime.now().isoformat()
        }), 200

    except Exception as e:
        logger.error(f"Error verifying image: {str(e)}")
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500


@app.route('/jobs', methods=['GET'])
def list_jobs():
    """
    List all imaging jobs

    Returns:
        Array of all jobs
    """
    try:
        with job_lock:
            jobs = [job.to_dict() for job in imaging_jobs.values()]

        return jsonify({
            'success': True,
            'jobs': jobs,
            'count': len(jobs)
        }), 200

    except Exception as e:
        logger.error(f"Error listing jobs: {str(e)}")
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
    logger.info("Starting Forensic Imaging API")
    logger.info(f"Evidence directory: {EVIDENCE_DIR}")
    logger.info(f"Output directory: {OUTPUT_DIR}")

    # Ensure directories exist
    os.makedirs(EVIDENCE_DIR, exist_ok=True)
    os.makedirs(OUTPUT_DIR, exist_ok=True)

    # Run Flask application
    app.run(
        host='0.0.0.0',
        port=5002,
        debug=False
    )
