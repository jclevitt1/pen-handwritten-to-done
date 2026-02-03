// Backend API client
// Mirrors iOS BackendService.swift

import { config } from './config';

const BASE_URL = config.api.baseUrl;

// Types matching DynamoDB schema
export interface Project {
  user_id: string;
  project_id: string;
  name: string;
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

  async createProject(data: { name: string; description?: string; language?: string; framework?: string }) {
    return this.request<Project>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
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

  async getDownloadUrl(projectId: string, fileKey: string) {
    return this.request<{ download_url: string; file_key: string; expires_in: number }>(
      `/projects/${projectId}/download?file_key=${encodeURIComponent(fileKey)}`
    );
  }

  async getDownloadZipUrl(projectId: string) {
    return this.request<{ download_url: string; filename: string; file_count: number; expires_in: number }>(
      `/projects/${projectId}/download-zip`
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

  // Upload
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

  // Get task status (for polling)
  async getTask(taskId: string) {
    return this.request<TaskResult>(`/tasks/${taskId}`);
  }

  // Poll for task completion
  private async pollForCompletion(taskId: string, maxAttempts = 120, intervalMs = 2000): Promise<TaskResult> {
    for (let i = 0; i < maxAttempts; i++) {
      const task = await this.getTask(taskId);
      if (task.status === 'COMPLETED' || task.status === 'FAILED') {
        return task;
      }
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
    throw new Error('Task timed out');
  }

  // Chat with project (handles async flow)
  async sendChatMessage(projectId: string, data: ChatRequest): Promise<ChatResponse> {
    const response = await this.request<ChatAsyncResponse | ChatResponse>(`/projects/${projectId}/chat`, {
      method: 'POST',
      body: JSON.stringify(data),
    });

    // Check if this is an async response
    if ('status' in response) {
      const asyncResponse = response as ChatAsyncResponse;

      if (asyncResponse.status === 'clarification_needed') {
        // Return clarification as a message with no edits
        return {
          message: asyncResponse.message || 'Could you please clarify?',
          edits: [],
          applied: false,
        };
      }

      if (asyncResponse.status === 'working' && asyncResponse.task_id) {
        // Poll for completion
        const task = await this.pollForCompletion(asyncResponse.task_id);

        if (task.status === 'FAILED') {
          throw new Error(task.error || 'Task failed');
        }

        // Return the result from the completed task
        return task.result || {
          message: 'Task completed',
          edits: [],
          applied: false,
        };
      }
    }

    // Direct response (shouldn't happen with new backend, but handle it)
    return response as ChatResponse;
  }
}

export const api = new ApiClient();
