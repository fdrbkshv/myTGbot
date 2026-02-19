import { User, UserSession } from '../models/user.model';

export class UserService {
  private users = new Map<number, User>();
  private sessions = new Map<number, UserSession>();

  getUser(id: number): User {
    if (!this.users.has(id)) {
      this.users.set(id, {
        id,
        status: 'inactive',
        lastInteraction: new Date(),
        movieHistory: []
      });
    }
    return this.users.get(id)!;
  }

  getSession(id: number): UserSession {
    if (!this.sessions.has(id)) {
      this.sessions.set(id, {
        userId: id,
        state: 'idle'
      });
    }
    return this.sessions.get(id)!;
  }

  updateSession(id: number, updates: Partial<UserSession>) {
    const session = this.getSession(id);
    this.sessions.set(id, { ...session, ...updates });
  }

  updateUser(id: number, updates: Partial<User>) {
    const user = this.getUser(id);
    user.lastInteraction = new Date();
    this.users.set(id, { ...user, ...updates });
  }

  setReminder(userId: number, hours: number = 16) {
    const user = this.getUser(userId);
    const nextReminder = new Date();
    nextReminder.setHours(nextReminder.getHours() + hours + Math.random() * 8); // 16-24 часа
    user.nextReminder = nextReminder;
    user.status = 'pending';
    this.users.set(userId, user);
  }

  getUsersForReminder(): User[] {
    const now = new Date();
    return Array.from(this.users.values()).filter(user => 
      user.nextReminder && user.nextReminder <= now && user.status === 'pending'
    );
  }
}