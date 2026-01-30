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
  key: string;
  name: string;
  size: number;
  last_modified: string;
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
}

export const api = new ApiClient();
