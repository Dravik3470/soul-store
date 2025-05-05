import { 
  users, 
  content, 
  soulboundTokens, 
  type User, 
  type InsertUser,
  type Content,
  type InsertContent,
  type SoulboundToken,
  type InsertSoulboundToken,
  type AIAnalysis
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByNearWallet(nearWallet: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Content methods
  getContent(id: number): Promise<Content | undefined>;
  getContentsByUser(userId: number): Promise<Content[]>;
  getAllContents(limit?: number, offset?: number): Promise<Content[]>;
  createContent(content: InsertContent): Promise<Content>;
  updateContentAnalysis(id: number, analysis: AIAnalysis): Promise<Content>;
  approveContent(id: number): Promise<Content>;
  rejectContent(id: number): Promise<Content>;
  updateContentTokenId(id: number, tokenId: string): Promise<Content>;
  
  // SBT methods
  getSoulboundToken(id: number): Promise<SoulboundToken | undefined>;
  getSoulboundTokensByUser(userId: number): Promise<SoulboundToken[]>;
  createSoulboundToken(token: InsertSoulboundToken): Promise<SoulboundToken>;
  
  // Leaderboard
  getLeaderboard(limit?: number): Promise<{userId: number, username: string, nearWallet: string, tokenCount: number}[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private contents: Map<number, Content>;
  private soulboundTokens: Map<number, SoulboundToken>;
  userCurrentId: number;
  contentCurrentId: number;
  sbtCurrentId: number;

  constructor() {
    this.users = new Map();
    this.contents = new Map();
    this.soulboundTokens = new Map();
    this.userCurrentId = 1;
    this.contentCurrentId = 1;
    this.sbtCurrentId = 1;
    
    // Add an admin user
    this.createUser({
      username: 'admin',
      password: 'admin123',
      nearWallet: 'admin.near',
      nearAddress: '0x123456789'
    }).then(user => {
      // Update to make admin
      const adminUser = {...user, isAdmin: true};
      this.users.set(user.id, adminUser);
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username
    );
  }
  
  async getUserByNearWallet(nearWallet: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.nearWallet === nearWallet
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userCurrentId++;
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      isAdmin: false
    };
    this.users.set(id, user);
    return user;
  }
  
  // Content methods
  async getContent(id: number): Promise<Content | undefined> {
    return this.contents.get(id);
  }
  
  async getContentsByUser(userId: number): Promise<Content[]> {
    return Array.from(this.contents.values()).filter(
      (content) => content.userId === userId
    );
  }
  
  async getAllContents(limit = 10, offset = 0): Promise<Content[]> {
    return Array.from(this.contents.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(offset, offset + limit);
  }
  
  async createContent(insertContent: InsertContent): Promise<Content> {
    const id = this.contentCurrentId++;
    const newContent: Content = {
      ...insertContent,
      id,
      createdAt: new Date(),
      approved: false,
      rejected: false,
      tokenIssued: false,
      tokenId: null
    };
    this.contents.set(id, newContent);
    return newContent;
  }
  
  async updateContentAnalysis(id: number, analysis: AIAnalysis): Promise<Content> {
    const content = await this.getContent(id);
    if (!content) {
      throw new Error(`Content with id ${id} not found`);
    }
    
    const updatedContent = {
      ...content,
      aiAnalysis: analysis
    };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async approveContent(id: number): Promise<Content> {
    const content = await this.getContent(id);
    if (!content) {
      throw new Error(`Content with id ${id} not found`);
    }
    
    const updatedContent = {
      ...content,
      approved: true,
      rejected: false
    };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async rejectContent(id: number): Promise<Content> {
    const content = await this.getContent(id);
    if (!content) {
      throw new Error(`Content with id ${id} not found`);
    }
    
    const updatedContent = {
      ...content,
      approved: false,
      rejected: true
    };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  async updateContentTokenId(id: number, tokenId: string): Promise<Content> {
    const content = await this.getContent(id);
    if (!content) {
      throw new Error(`Content with id ${id} not found`);
    }
    
    const updatedContent = {
      ...content,
      tokenIssued: true,
      tokenId
    };
    this.contents.set(id, updatedContent);
    return updatedContent;
  }
  
  // SBT methods
  async getSoulboundToken(id: number): Promise<SoulboundToken | undefined> {
    return this.soulboundTokens.get(id);
  }
  
  async getSoulboundTokensByUser(userId: number): Promise<SoulboundToken[]> {
    return Array.from(this.soulboundTokens.values()).filter(
      (token) => token.userId === userId
    );
  }
  
  async createSoulboundToken(insertToken: InsertSoulboundToken): Promise<SoulboundToken> {
    const id = this.sbtCurrentId++;
    const token: SoulboundToken = {
      ...insertToken,
      id,
      createdAt: new Date()
    };
    this.soulboundTokens.set(id, token);
    
    // Update content with token ID if content exists
    if (token.contentId) {
      await this.updateContentTokenId(token.contentId, token.tokenId);
    }
    
    return token;
  }
  
  // Leaderboard
  async getLeaderboard(limit = 10): Promise<{userId: number, username: string, nearWallet: string, tokenCount: number}[]> {
    // Group tokens by user and count
    const userTokens = new Map<number, number>();
    
    for (const token of this.soulboundTokens.values()) {
      const count = userTokens.get(token.userId) || 0;
      userTokens.set(token.userId, count + 1);
    }
    
    // Transform to array and sort
    const leaderboard = Array.from(userTokens.entries())
      .map(([userId, tokenCount]) => {
        const user = this.users.get(userId);
        return {
          userId,
          username: user?.username || 'Unknown',
          nearWallet: user?.nearWallet || 'Unknown',
          tokenCount
        };
      })
      .sort((a, b) => b.tokenCount - a.tokenCount)
      .slice(0, limit);
      
    return leaderboard;
  }
}

export const storage = new MemStorage();
