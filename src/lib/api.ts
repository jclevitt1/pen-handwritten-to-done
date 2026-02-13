// Backend API client
// Mirrors iOS BackendService.swift

import { config } from './config';

const BASE_URL = config.api.baseUrl;

// Types matching DynamoDB schema
export type SourceType = 'written' | 'uploaded';
export type ProjectType = 'academic_coursework' | 'development' | 'general_professional';

export interface Project {
  user_id: string;
  project_id: string;
  name: string;
  source_type: SourceType;
  project_type?: ProjectType;
  description?: string;
  s3_uri?: string;
  s3_prefix?: string;
  language?: string;
  framework?: string;
  source_job_id?: string;
  file_count?: number;
  total_size_bytes?: number;
  created_at: string;
  updated_at: string;
  last_accessed_at?: string;
  metadata?: Record<string, unknown>;
}

export interface ProjectFile {
  id: string;      // Full S3 key
  name: string;    // Just the filename
  path: string;    // S3 key without bucket prefix
  mime_type?: string;
  size: number;
}

export interface Job {
  job_id: string;
  user_id: string;
  job_type: 'summarize' | 'create_project' | 'existing_project';
  status: 'pending' | 'processing' | 'completed' | 'failed';
  raw_file_path: string;
  project_id?: string;
  output_path?: string;
  result?: Record<string, unknown>;
  error?: string;
  created_at: string;
  completed_at?: string;
}

// Chat types
export interface ChatRequest {
  message: string;
  context_file?: string;
  auto_apply?: boolean;
}

export interface ChatEdit {
  file: string;
  content: string;
}

export interface ChatResponse {
  message: string;
  edits: ChatEdit[];
  applied: boolean;
  parse_error?: string;
  apply_error?: string;
}

// New async chat response types
export interface ChatAsyncResponse {
  status: 'working' | 'clarification_needed';
  task_id?: string;
  message?: string;
  preliminary_message?: string;
  message_id?: string;
  user_message_id?: string;
}

export interface TaskResult {
  task_id: string;
  task_type: string;
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'YIELDED';
  result?: ChatResponse;
  error?: string;
  created_at: string;
  completed_at?: string;
}

// Combined chat result for two-step flow
export interface ChatStreamResult {
  type: 'immediate' | 'async';
  // For immediate responses (clarification or direct)
  response?: ChatResponse;
  // For async responses (working)
  taskId?: string;
  preliminaryMessage?: string;
}

class ApiClient {
  private getToken: (() => Promise<string | null>) | null = null;

  // Expose base URL for error messages
  get baseUrl() {
    return BASE_URL;
  }

  setTokenGetter(getter: () => Promise<string | null>) {
    this.getToken = getter;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken ? await this.getToken() : null;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${BASE_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Health check (public)
  async health() {
    return this.request<{ status: string; storage: string }>('/health');
  }

  // Projects
  async listProjects(search?: string) {
    const params = search ? `?search=${encodeURIComponent(search)}` : '';
    return this.request<{ projects: Project[] }>(`/projects${params}`);
  }

  async getProject(projectId: string) {
    return this.request<Project>(`/projects/${projectId}`);
  }

  async createProject(data: {
    name: string;
    source_type?: SourceType;
    project_type?: ProjectType;
    description?: string;
    language?: string;
    framework?: string;
  }) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify({
        ...data,
        source_type: data.source_type || 'written',
        project_type: data.project_type || 'development',
      }),
    });
  }

  async updateProject(projectId: string, data: Partial<Project>) {
    return this.request<Project>(`/projects/${projectId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteProject(projectId: string) {
    return this.request<{ deleted: boolean }>(`/projects/${projectId}`, {
      method: 'DELETE',
    });
  }

  async listProjectFiles(projectId: string) {
    return this.request<{ project_id: string; files: ProjectFile[]; file_count: number; total_size_bytes: number }>(
      `/projects/${projectId}/files`
    );
  }

  async getDownloadUrl(projectId: string, fileKey: string, mode: 'download' | 'view' = 'download') {
    return this.request<{ download_url: string; file_key: string; expires_in: number }>(
      `/projects/${projectId}/download?file_key=${encodeURIComponent(fileKey)}&mode=${mode}`
    );
  }

  async getDownloadZipUrl(projectId: string) {
    return this.request<{ download_url: string; filename: string; file_count: number; expires_in: number }>(
      `/projects/${projectId}/download-zip`
    );
  }

  // File/folder management
  async deleteFile(projectId: string, filePath: string) {
    return this.request<{ deleted: string }>(
      `/projects/${projectId}/files?file_path=${encodeURIComponent(filePath)}`,
      { method: 'DELETE' }
    );
  }

  async moveFile(projectId: string, fromPath: string, toPath: string) {
    return this.request<{ from: string; to: string }>(
      `/projects/${projectId}/files/move`,
      {
        method: 'POST',
        body: JSON.stringify({ from_path: fromPath, to_path: toPath }),
      }
    );
  }

  async createFolder(projectId: string, folderPath: string) {
    return this.request<{ created: string }>(
      `/projects/${projectId}/folders`,
      {
        method: 'POST',
        body: JSON.stringify({ path: folderPath }),
      }
    );
  }

  async deleteFolder(projectId: string, folderPath: string) {
    return this.request<{ deleted: string; files_removed: number }>(
      `/projects/${projectId}/folders?folder_path=${encodeURIComponent(folderPath)}`,
      { method: 'DELETE' }
    );
  }

  // Jobs
  async listJobs() {
    return this.request<{ jobs: Job[] }>('/jobs');
  }

  async getJob(jobId: string) {
    return this.request<Job>(`/jobs/${jobId}`);
  }

  async submitJob(data: { job_type: string; raw_file_path: string; project_id?: string }) {
    return this.request<{ job_id: string; status: string; message: string }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Upload PDF for processing
  async upload(path: string, contentBase64: string, mimeType = 'application/pdf') {
    return this.request<{ success: boolean; file_id: string; path: string; size: number }>('/upload', {
      method: 'POST',
      body: JSON.stringify({
        path,
        content_base64: contentBase64,
        mime_type: mimeType,
      }),
    });
  }

  // Upload files directly to a project (for 'uploaded' source_type)
  async uploadProjectFiles(
    projectId: string,
    files: Array<{ path: string; content_base64: string; mimeType?: string }>
  ) {
    const filesData = files.map((f) => ({
      path: f.path,
      content_base64: f.content_base64,
      mime_type: f.mimeType || 'text/plain',
    }));

    return this.request<{ uploaded: Array<{ path: string; size: number }>; count: number; total_size: number }>(
      `/projects/${projectId}/upload-files`,
      {
        method: 'POST',
        body: JSON.stringify({ files: filesData }),
      }
    );
  }

  // Get presigned URL for direct S3 upload
  async getPresignedUploadUrl(path: string, contentType: string) {
    return this.request<{
      upload_url: string;
      file_path: string;
      expires_in: number;
      bucket: string;
    }>('/presigned-upload-url', {
      method: 'POST',
      body: JSON.stringify({
        path,
        content_type: contentType,
      }),
    });
  }

  // Upload file directly to S3 using presigned URL (for large files)
  async uploadFileDirect(
    file: File,
    destinationPath: string,
    onProgress?: (percent: number) => void
  ): Promise<string> {
    // 1. Get presigned URL from backend
    const presigned = await this.getPresignedUploadUrl(
      destinationPath,
      file.type || 'application/octet-stream'
    );

    // 2. Upload directly to S3 using XMLHttpRequest for progress tracking
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      // Progress tracking
      if (onProgress) {
        xhr.upload.addEventListener('progress', (e) => {
          if (e.lengthComputable) {
            onProgress(Math.round((e.loaded / e.total) * 100));
          }
        });
      }

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(presigned.file_path);
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed - network error'));
      });

      xhr.open('PUT', presigned.upload_url);
      xhr.setRequestHeader('Content-Type', file.type || 'application/octet-stream');
      xhr.send(file);
    });
  }

  // Execute notes processing (creates project from handwritten notes)
  async executeNotes(data: {
    file_path: string;
    project_name: string;
    project_type?: string;
    project_id?: string;
  }) {
    return this.request<{
      task_id: string;
      job_id: string;
      status: string;
      project_name: string;
      message: string;
    }>('/execute', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Get task status (for polling)
  async getTask(taskId: string) {
    return this.request<TaskResult>(`/tasks/${taskId}`);
  }

  // Poll for task completion (public for ChatPanel to use)
  async pollForCompletion(taskId: string, maxAttempts = 120, intervalMs = 2000): Promise<TaskResult> {
    for (let i = 0; i < maxAttempts; i++) {
      const task = await this.getTask(taskId);
      if (task.status === 'COMPLETED' || task.status === 'FAILED') {
        return task;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error('Task timed out');
  }

  // Chat with project - returns stream result for two-step flow
  async sendChatMessageAsync(projectId: string, data: ChatRequest): Promise<ChatStreamResult> {
    const response = await this.request<ChatAsyncResponse | ChatResponse>(`/projects/${projectId}/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Check if this is an async response
    if ('status' in response) {
      const asyncResponse = response as ChatAsyncResponse;

      if (asyncResponse.status === 'clarification_needed') {
        return {
          type: 'immediate',
          response: {
            message: asyncResponse.message || 'Could you please clarify?',
            edits: [],
            applied: false,
          },
        };
      }

      if (asyncResponse.status === 'working' && asyncResponse.task_id) {
        return {
          type: 'async',
          taskId: asyncResponse.task_id,
          preliminaryMessage: asyncResponse.preliminary_message || 'Working on that...',
        };
      }
    }

    // Direct response (shouldn't happen with new backend, but handle it)
    return {
      type: 'immediate',
      response: response as ChatResponse,
    };
  }

  // Chat with project - simple version that waits for completion (backwards compatible)
  async sendChatMessage(projectId: string, data: ChatRequest): Promise<ChatResponse> {
    const streamResult = await this.sendChatMessageAsync(projectId, data);

    if (streamResult.type === 'immediate') {
      return streamResult.response!;
    }

    // Async - poll for completion
    const task = await this.pollForCompletion(streamResult.taskId!);

    if (task.status === 'FAILED') {
      throw new Error(task.error || 'Task failed');
    }

    return task.result || {
      message: 'Task completed',
      edits: [],
      applied: false,
    };
  }
}

export const api = new ApiClient();
