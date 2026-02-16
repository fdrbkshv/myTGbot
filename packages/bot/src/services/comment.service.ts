import { Comment } from '../../../shared/src/types/comment.types';
import { CommentModel } from '../models/comment.model';

interface Reactions {
  likes: number;
  dislikes: number;
}

export class CommentService {
  private reactions = new Map<string, Reactions>();

  generateComments(movieTitle: string, count: number): Comment[] {
    return CommentModel.generateRandomComments(movieTitle, count);
  }

  addReaction(messageId: string, type: 'like' | 'dislike'): void {
    if (!this.reactions.has(messageId)) {
      this.reactions.set(messageId, { likes: 0, dislikes: 0 });
    }
    
    const current = this.reactions.get(messageId)!;
    if (type === 'like') current.likes++;
    if (type === 'dislike') current.dislikes++;
    this.reactions.set(messageId, current);
    
    console.log(`Статистика: 👍 ${current.likes}, 👎 ${current.dislikes}`);
  }

  getReactions(messageId: string): Reactions | undefined {
    return this.reactions.get(messageId);
  }
}