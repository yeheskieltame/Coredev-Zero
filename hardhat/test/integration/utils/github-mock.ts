/**
 * GitHub API Mock Service
 * Simulates GitHub API responses for integration testing
 */

export interface GitHubUser {
  login: string;
  id: number;
  name: string;
  email: string;
  followers: number;
  following: number;
  public_repos: number;
  created_at: string;
  updated_at: string;
}

export interface GitHubRepo {
  id: number;
  name: string;
  full_name: string;
  owner: { login: string };
  private: boolean;
  description: string;
  fork: boolean;
  created_at: string;
  updated_at: string;
  pushed_at: string;
  stargazers_count: number;
  watchers_count: number;
  forks_count: number;
  language: string;
  size: number;
}

export interface GitHubContribution {
  date: string;
  count: number;
}

export interface GitHubCommit {
  sha: string;
  commit: {
    author: {
      name: string;
      email: string;
      date: string;
    };
    message: string;
  };
  author: {
    login: string;
  };
}

export interface GitHubVerificationData {
  username: string;
  publicRepos: number;
  followers: number;
  totalContributions: number;
  accountAgeMonths: number;
  consistencyScore: number;
  languages: string[];
  totalStars: number;
  totalForks: number;
  verified: boolean;
}

/**
 * Mock GitHub API Service
 */
export class GitHubMockService {
  private static instance: GitHubMockService;
  private users: Map<string, GitHubUser> = new Map();
  private repos: Map<string, GitHubRepo[]> = new Map();
  private contributions: Map<string, GitHubContribution[]> = new Map();
  private commits: Map<string, GitHubCommit[]> = new Map();

  constructor() {
    this.initializeMockData();
  }

  static getInstance(): GitHubMockService {
    if (!GitHubMockService.instance) {
      GitHubMockService.instance = new GitHubMockService();
    }
    return GitHubMockService.instance;
  }

  private initializeMockData() {
    // Mock users
    this.addMockUser({
      login: "testdev1",
      id: 1001,
      name: "Test Developer 1",
      email: "testdev1@example.com",
      followers: 150,
      following: 80,
      public_repos: 25,
      created_at: "2020-01-15T10:00:00Z",
      updated_at: "2024-06-15T15:30:00Z"
    });

    this.addMockUser({
      login: "testdev2", 
      id: 1002,
      name: "Test Developer 2",
      email: "testdev2@example.com",
      followers: 75,
      following: 120,
      public_repos: 12,
      created_at: "2021-06-10T08:00:00Z",
      updated_at: "2024-06-14T12:00:00Z"
    });

    this.addMockUser({
      login: "newdev",
      id: 1003,
      name: "New Developer",
      email: "newdev@example.com", 
      followers: 5,
      following: 10,
      public_repos: 2,
      created_at: "2024-01-01T00:00:00Z",
      updated_at: "2024-06-01T10:00:00Z"
    });

    this.addMockUser({
      login: "testdev3",
      id: 1004,
      name: "Test Developer 3",
      email: "testdev3@example.com",
      followers: 95,
      following: 60,
      public_repos: 18,
      created_at: "2021-03-20T12:00:00Z",
      updated_at: "2024-06-16T08:30:00Z"
    });

    // Mock repositories
    this.addMockRepos("testdev1", [
      {
        id: 2001,
        name: "awesome-project",
        full_name: "testdev1/awesome-project",
        owner: { login: "testdev1" },
        private: false,
        description: "An awesome TypeScript project",
        fork: false,
        created_at: "2023-01-15T10:00:00Z",
        updated_at: "2024-06-15T15:30:00Z",
        pushed_at: "2024-06-14T09:00:00Z",
        stargazers_count: 45,
        watchers_count: 45,
        forks_count: 12,
        language: "TypeScript",
        size: 2048
      },
      {
        id: 2002,
        name: "blockchain-utils",
        full_name: "testdev1/blockchain-utils",
        owner: { login: "testdev1" },
        private: false,
        description: "Utility library for blockchain development",
        fork: false,
        created_at: "2023-06-01T14:00:00Z",
        updated_at: "2024-06-10T11:20:00Z",
        pushed_at: "2024-06-09T16:45:00Z",
        stargazers_count: 78,
        watchers_count: 78,
        forks_count: 23,
        language: "Solidity",
        size: 1536
      },
      {
        id: 2003,
        name: "smart-contracts",
        full_name: "testdev1/smart-contracts",
        owner: { login: "testdev1" },
        private: false,
        description: "Collection of audited smart contracts",
        fork: false,
        created_at: "2023-09-15T08:00:00Z",
        updated_at: "2024-06-11T10:15:00Z",
        pushed_at: "2024-06-10T14:30:00Z",
        stargazers_count: 92,
        watchers_count: 92,
        forks_count: 28,
        language: "Solidity",
        size: 1920
      }
    ]);

    this.addMockRepos("testdev2", [
      {
        id: 2005,
        name: "data-processor",
        full_name: "testdev2/data-processor",
        owner: { login: "testdev2" },
        private: false,
        description: "High-performance data processing library",
        fork: false,
        created_at: "2023-03-10T09:00:00Z",
        updated_at: "2024-06-12T14:15:00Z",
        pushed_at: "2024-06-11T10:30:00Z",
        stargazers_count: 32,
        watchers_count: 32,
        forks_count: 8,
        language: "Python",
        size: 1024
      },
      {
        id: 2006,
        name: "web-framework",
        full_name: "testdev2/web-framework",
        owner: { login: "testdev2" },
        private: false,
        description: "Lightweight web framework",
        fork: false,
        created_at: "2023-08-05T16:00:00Z",
        updated_at: "2024-06-08T13:45:00Z",
        pushed_at: "2024-06-07T17:20:00Z",
        stargazers_count: 19,
        watchers_count: 19,
        forks_count: 4,
        language: "JavaScript",
        size: 768
      }
    ]);

    this.addMockRepos("testdev3", [
      {
        id: 2007,
        name: "mobile-app",
        full_name: "testdev3/mobile-app",
        owner: { login: "testdev3" },
        private: false,
        description: "Cross-platform mobile application",
        fork: false,
        created_at: "2023-02-14T11:00:00Z",
        updated_at: "2024-06-13T09:30:00Z",
        pushed_at: "2024-06-12T15:45:00Z",
        stargazers_count: 67,
        watchers_count: 67,
        forks_count: 15,
        language: "Dart",
        size: 2560
      },
      {
        id: 2008,
        name: "api-gateway",
        full_name: "testdev3/api-gateway",
        owner: { login: "testdev3" },
        private: false,
        description: "Microservices API gateway",
        fork: false,
        created_at: "2023-09-20T14:30:00Z",
        updated_at: "2024-06-14T16:00:00Z",
        pushed_at: "2024-06-13T18:15:00Z",
        stargazers_count: 41,
        watchers_count: 41,
        forks_count: 11,
        language: "Go",
        size: 1792
      },
      {
        id: 2009,
        name: "ml-toolkit",
        full_name: "testdev3/ml-toolkit",
        owner: { login: "testdev3" },
        private: false,
        description: "Machine learning toolkit",
        fork: false,
        created_at: "2024-01-10T10:00:00Z",
        updated_at: "2024-06-15T12:30:00Z",
        pushed_at: "2024-06-14T14:20:00Z",
        stargazers_count: 28,
        watchers_count: 28,
        forks_count: 6,
        language: "Python",
        size: 1280
      }
    ]);

    // Mock contributions (simplified - last 365 days)
    this.addMockContributions("testdev1", this.generateContributions(500, 365));
    this.addMockContributions("testdev2", this.generateContributions(200, 365));
    this.addMockContributions("testdev3", this.generateContributions(350, 365));
    this.addMockContributions("newdev", this.generateContributions(50, 180));
  }

  private addMockUser(user: GitHubUser) {
    this.users.set(user.login, user);
  }

  private addMockRepos(username: string, repos: GitHubRepo[]) {
    this.repos.set(username, repos);
  }

  private addMockContributions(username: string, contributions: GitHubContribution[]) {
    this.contributions.set(username, contributions);
  }

  private generateContributions(total: number, days: number): GitHubContribution[] {
    const contributions: GitHubContribution[] = [];
    const now = new Date();
    
    for (let i = 0; i < days; i++) {
      const date = new Date(now.getTime() - (i * 24 * 60 * 60 * 1000));
      const count = Math.floor(Math.random() * (total / days * 2)); // Vary contributions
      
      contributions.push({
        date: date.toISOString().split('T')[0],
        count: count
      });
    }
    
    return contributions.reverse(); // Chronological order
  }

  /**
   * Mock API Methods
   */

  async getUser(username: string): Promise<GitHubUser | null> {
    // Simulate API delay
    await this.delay(100);
    
    const user = this.users.get(username);
    if (!user) {
      throw new Error(`User ${username} not found`);
    }
    
    return user;
  }

  async getUserRepos(username: string): Promise<GitHubRepo[]> {
    await this.delay(150);
    
    const repos = this.repos.get(username) || [];
    return repos;
  }

  async getUserContributions(username: string): Promise<GitHubContribution[]> {
    await this.delay(200);
    
    const contributions = this.contributions.get(username) || [];
    return contributions;
  }

  async verifyGitHubAccount(username: string): Promise<GitHubVerificationData> {
    await this.delay(300);

    const user = await this.getUser(username);
    const repos = await this.getUserRepos(username);
    const contributions = await this.getUserContributions(username);

    if (!user) {
      throw new Error(`User ${username} not found`);
    }

    // Calculate metrics
    const totalContributions = contributions.reduce((sum, c) => sum + c.count, 0);
    const totalStars = repos.reduce((sum, r) => sum + r.stargazers_count, 0);
    const totalForks = repos.reduce((sum, r) => sum + r.forks_count, 0);
    
    const languages = [...new Set(repos.map(r => r.language).filter(Boolean))];
    
    // Account age calculation
    const accountCreated = new Date(user.created_at);
    const now = new Date();
    const accountAgeMonths = Math.floor((now.getTime() - accountCreated.getTime()) / (1000 * 60 * 60 * 24 * 30));
    
    // Consistency score (based on contribution distribution)
    const consistencyScore = this.calculateConsistencyScore(contributions);

    return {
      username: user.login,
      publicRepos: user.public_repos,
      followers: user.followers,
      totalContributions,
      accountAgeMonths,
      consistencyScore,
      languages,
      totalStars,
      totalForks,
      verified: true
    };
  }

  private calculateConsistencyScore(contributions: GitHubContribution[]): number {
    if (contributions.length === 0) return 0;

    // Calculate how many days have contributions (consistency)
    const activeDays = contributions.filter(c => c.count > 0).length;
    const totalDays = contributions.length;
    
    const consistencyRatio = activeDays / totalDays;
    
    // Score from 0-100 based on consistency
    return Math.floor(consistencyRatio * 100);
  }

  /**
   * Utility Methods
   */

  async simulateRateLimit(): Promise<void> {
    await this.delay(1000);
    throw new Error('GitHub API rate limit exceeded');
  }

  async simulateNetworkError(): Promise<void> {
    await this.delay(500);
    throw new Error('Network timeout');
  }

  async simulateAuthError(): Promise<void> {
    await this.delay(200);
    throw new Error('Unauthorized: Invalid GitHub token');
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Test Data Helpers
   */

  createTestUser(overrides: Partial<GitHubUser> = {}): GitHubUser {
    const defaultUser: GitHubUser = {
      login: "testuser",
      id: 9999,
      name: "Test User",
      email: "test@example.com",
      followers: 10,
      following: 15,
      public_repos: 5,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2024-06-01T00:00:00Z"
    };

    return { ...defaultUser, ...overrides };
  }

  createTestRepo(username: string, overrides: Partial<GitHubRepo> = {}): GitHubRepo {
    const defaultRepo: GitHubRepo = {
      id: 9999,
      name: "test-repo",
      full_name: `${username}/test-repo`,
      owner: { login: username },
      private: false,
      description: "Test repository",
      fork: false,
      created_at: "2023-01-01T00:00:00Z",
      updated_at: "2024-06-01T00:00:00Z",
      pushed_at: "2024-05-01T00:00:00Z",
      stargazers_count: 5,
      watchers_count: 5,
      forks_count: 2,
      language: "JavaScript",
      size: 1024
    };

    return { ...defaultRepo, ...overrides };
  }

  /**
   * Reset mock data
   */
  reset(): void {
    this.users.clear();
    this.repos.clear();
    this.contributions.clear();
    this.commits.clear();
    this.initializeMockData();
  }

  /**
   * Add custom test data
   */
  addTestUser(user: GitHubUser, repos: GitHubRepo[] = [], contributionDays: number = 365): void {
    this.users.set(user.login, user);
    this.repos.set(user.login, repos);
    // For minimal users (< 50 days), generate very few contributions
    // For full year, generate enough contributions to pass activity check
    const totalContributions = contributionDays < 50 ? 20 : 400;
    this.contributions.set(user.login, this.generateContributions(totalContributions, contributionDays));
  }
}

export const githubMock = GitHubMockService.getInstance();
