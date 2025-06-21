/**
 * GitHub Integration Service for Frontend
 * Menangani koneksi dengan GitHub API dan verifikasi akun developer
 */

export interface GitHubUser {
  login: string;
  id: number;
  name: string | null;
  email: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  updated_at: string;
  avatar_url: string;
  html_url: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  created_at: string;
  updated_at: string;
  pushed_at: string;
}

export interface GitHubVerificationData {
  verified: boolean;
  githubHandle: string;
  publicRepos: number;
  followers: number;
  totalContributions: number;
  accountAgeMonths: number;
  consistencyScore: number;
  trustScore: number;
  lastActivity: string;
  topLanguages: string[];
  error?: string;
}

export interface GitHubOAuthConfig {
  clientId: string;
  redirectUri: string;
  scope: string;
}

export class GitHubIntegrationService {
  private static instance: GitHubIntegrationService;
  private accessToken: string | null = null;
  private authenticated: boolean = false;

  private constructor() {}

  static getInstance(): GitHubIntegrationService {
    if (!GitHubIntegrationService.instance) {
      GitHubIntegrationService.instance = new GitHubIntegrationService();
    }
    return GitHubIntegrationService.instance;
  }

  /**
   * OAuth Authentication Flow
   */
  async startOAuthFlow(config: GitHubOAuthConfig): Promise<string> {
    const state = this.generateState();
    const authUrl = new URL('https://github.com/login/oauth/authorize');
    
    authUrl.searchParams.append('client_id', config.clientId);
    authUrl.searchParams.append('redirect_uri', config.redirectUri);
    authUrl.searchParams.append('scope', config.scope);
    authUrl.searchParams.append('state', state);
    
    // Store state for verification
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('github_oauth_state', state);
    }
    
    return authUrl.toString();
  }

  async handleOAuthCallback(code: string, state: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Verify state
      if (typeof window !== 'undefined') {
        const storedState = sessionStorage.getItem('github_oauth_state');
        if (storedState !== state) {
          return { success: false, error: 'Invalid state parameter' };
        }
        sessionStorage.removeItem('github_oauth_state');
      }

      // Exchange code for access token
      // Note: In production, this should be done on the backend for security
      const tokenResponse = await this.exchangeCodeForToken(code);
      
      if (tokenResponse.access_token) {
        this.accessToken = tokenResponse.access_token;
        this.authenticated = true;
        
        // Store token securely (consider using more secure storage)
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('github_access_token', this.accessToken);
        }
        
        return { success: true };
      }
      
      return { success: false, error: 'Failed to get access token' };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'OAuth callback failed' 
      };
    }
  }

  /**
   * GitHub API Methods
   */
  async getUser(username?: string): Promise<GitHubUser | null> {
    try {
      const url = username ? `https://api.github.com/users/${username}` : 'https://api.github.com/user';
      const headers = this.getApiHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub user:', error);
      return null;
    }
  }

  async getUserRepos(username: string, page: number = 1, perPage: number = 30): Promise<GitHubRepo[]> {
    try {
      const url = `https://api.github.com/users/${username}/repos?page=${page}&per_page=${perPage}&sort=updated`;
      const headers = this.getApiHeaders();
      
      const response = await fetch(url, { headers });
      
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching GitHub repos:', error);
      return [];
    }
  }

  async getUserContributions(username: string): Promise<number> {
    try {
      // GitHub doesn't provide direct API for contribution count
      // This is a simplified approach - in production, you might need to:
      // 1. Use GitHub GraphQL API
      // 2. Scrape the contributions graph
      // 3. Use third-party services
      
      // For now, we'll estimate based on repos and activity
      const repos = await this.getUserRepos(username, 1, 100);
      const user = await this.getUser(username);
      
      if (!user || !repos) return 0;
      
      // Simple estimation: public repos * 10 + followers * 2
      return Math.min(repos.length * 10 + user.followers * 2, 10000);
    } catch (error) {
      console.error('Error calculating contributions:', error);
      return 0;
    }
  }

  /**
   * Verification Methods
   */
  async verifyGitHubAccount(username: string): Promise<GitHubVerificationData> {
    try {
      const user = await this.getUser(username);
      
      if (!user) {
        return {
          verified: false,
          githubHandle: username,
          publicRepos: 0,
          followers: 0,
          totalContributions: 0,
          accountAgeMonths: 0,
          consistencyScore: 0,
          trustScore: 0,
          lastActivity: '',
          topLanguages: [],
          error: 'User not found'
        };
      }

      const repos = await this.getUserRepos(username);
      const totalContributions = await this.getUserContributions(username);
      const accountAgeMonths = this.calculateAccountAge(user.created_at);
      const consistencyScore = this.calculateConsistencyScore(repos, user);
      const trustScore = this.calculateTrustScore(user, repos, totalContributions, accountAgeMonths, consistencyScore);
      const topLanguages = this.extractTopLanguages(repos);

      return {
        verified: this.isAccountVerified(user, repos, totalContributions, accountAgeMonths),
        githubHandle: user.login,
        publicRepos: user.public_repos,
        followers: user.followers,
        totalContributions,
        accountAgeMonths,
        consistencyScore,
        trustScore,
        lastActivity: user.updated_at,
        topLanguages
      };
    } catch (error) {
      return {
        verified: false,
        githubHandle: username,
        publicRepos: 0,
        followers: 0,
        totalContributions: 0,
        accountAgeMonths: 0,
        consistencyScore: 0,
        trustScore: 0,
        lastActivity: '',
        topLanguages: [],
        error: error instanceof Error ? error.message : 'Verification failed'
      };
    }
  }

  /**
   * Mock Mode for Development
   */
  async getVerificationDataMock(username: string): Promise<GitHubVerificationData> {
    // Mock data untuk development - simulate real GitHub data
    const mockUsers = {
      'testdev1': {
        verified: true,
        githubHandle: 'testdev1',
        publicRepos: 25,
        followers: 45,
        totalContributions: 1200,
        accountAgeMonths: 36,
        consistencyScore: 85,
        trustScore: 220,
        lastActivity: new Date().toISOString(),
        topLanguages: ['TypeScript', 'JavaScript', 'Solidity', 'Python']
      },
      'testdev2': {
        verified: true,
        githubHandle: 'testdev2',
        publicRepos: 15,
        followers: 20,
        totalContributions: 800,
        accountAgeMonths: 24,
        consistencyScore: 75,
        trustScore: 180,
        lastActivity: new Date().toISOString(),
        topLanguages: ['JavaScript', 'React', 'Node.js', 'CSS']
      },
      'newdev': {
        verified: false,
        githubHandle: 'newdev',
        publicRepos: 3,
        followers: 2,
        totalContributions: 50,
        accountAgeMonths: 2,
        consistencyScore: 30,
        trustScore: 110,
        lastActivity: new Date().toISOString(),
        topLanguages: ['JavaScript']
      }
    };

    return mockUsers[username as keyof typeof mockUsers] || {
      verified: false,
      githubHandle: username,
      publicRepos: 0,
      followers: 0,
      totalContributions: 0,
      accountAgeMonths: 0,
      consistencyScore: 0,
      trustScore: 100,
      lastActivity: '',
      topLanguages: [],
      error: 'User not found in mock data'
    };
  }

  /**
   * Utility Methods
   */
  private async exchangeCodeForToken(code: string): Promise<{ access_token?: string; error?: string }> {
    // Note: In production, this should be done on your backend server
    // GitHub doesn't allow CORS requests to their token endpoint
    // This is just for demonstration - implement proper backend OAuth
    
    try {
      // Mock token exchange for development
      if (process.env.NODE_ENV === 'development') {
        return { access_token: `gho_mock_token_${Date.now()}` };
      }
      
      // In production, make request to your backend
      const response = await fetch('/api/github/oauth/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code })
      });
      
      return await response.json();
    } catch (error) {
      return { error: 'Token exchange failed' };
    }
  }

  private getApiHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'CoreDev-Zero-App'
    };
    
    if (this.accessToken) {
      headers['Authorization'] = `token ${this.accessToken}`;
    }
    
    return headers;
  }

  private calculateAccountAge(createdAt: string): number {
    const created = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const diffMonths = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 30));
    return diffMonths;
  }

  private calculateConsistencyScore(repos: GitHubRepo[], user: GitHubUser): number {
    if (repos.length === 0) return 0;
    
    // Calculate based on recent activity, repo count, and age
    const recentRepos = repos.filter(repo => {
      const updated = new Date(repo.updated_at);
      const monthsAgo = new Date();
      monthsAgo.setMonth(monthsAgo.getMonth() - 6);
      return updated > monthsAgo;
    });
    
    const recentActivityScore = Math.min((recentRepos.length / repos.length) * 100, 50);
    const repoCountScore = Math.min(repos.length * 2, 30);
    const followerScore = Math.min(user.followers, 20);
    
    return Math.floor(recentActivityScore + repoCountScore + followerScore);
  }

  private calculateTrustScore(
    user: GitHubUser, 
    repos: GitHubRepo[], 
    contributions: number, 
    accountAge: number, 
    consistency: number
  ): number {
    const baseScore = 100;
    const repoScore = user.public_repos * 2;
    const followerScore = Math.floor(user.followers / 10);
    const contributionScore = Math.floor(contributions / 100);
    const ageScore = Math.min(accountAge, 60);
    const consistencyScore = Math.floor(consistency / 10);
    
    return baseScore + repoScore + followerScore + contributionScore + ageScore + consistencyScore;
  }

  private isAccountVerified(
    user: GitHubUser, 
    repos: GitHubRepo[], 
    contributions: number, 
    accountAge: number
  ): boolean {
    return (
      user.public_repos >= 5 &&
      accountAge >= 6 &&
      contributions >= 100 &&
      repos.length >= 3
    );
  }

  private extractTopLanguages(repos: GitHubRepo[]): string[] {
    const languages = repos
      .map(repo => repo.language)
      .filter((lang): lang is string => lang !== null);
    
    const languageCount = languages.reduce((acc, lang) => {
      acc[lang] = (acc[lang] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(languageCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([lang]) => lang);
  }

  private generateState(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Public Utility Methods
   */
  isAuthenticated(): boolean {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('github_access_token');
      return !!(token || this.accessToken);
    }
    return this.authenticated;
  }

  logout(): void {
    this.accessToken = null;
    this.authenticated = false;
    
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('github_access_token');
      sessionStorage.removeItem('github_oauth_state');
    }
  }

  // Initialize from stored token
  initialize(): void {
    if (typeof window !== 'undefined') {
      const token = sessionStorage.getItem('github_access_token');
      if (token) {
        this.accessToken = token;
        this.authenticated = true;
      }
    }
  }
}
