import { Comment, CommentWithReactions } from '../../../shared/src/types/comment.types';

export class CommentModel {
  static create(movieTitle: string, timestamp: number, text: string): Comment {
    return {
      id: `${Date.now()}_${Math.random()}`,
      movieId: '',
      movieTitle,
      timestamp,
      text,
      createdAt: new Date()
    };
  }

  static generateFacts(movieTitle: string, timestamp: number): string {
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    

    // пиздец как проработать "факты, добавить адаптивную генерацию"
    const facts = [
      `На ${timeStr} в фильме "${movieTitle}" происходит важный поворот сюжета!`,
      `Интересно, что сцена на ${timeStr} снималась в павильоне.`,
      `Актеры особенно старались в этом моменте (${timeStr}).`,
      `Режиссер считает сцену на ${timeStr} ключевой для понимания фильма.`,
      `На ${timeStr} можно заметить небольшую ошибку монтажа.`,
      `Саундтрек в этом месте (${timeStr}) написал известный композитор.`,
      `Этот кадр на ${timeStr} стал мемом в интернете.`,
      `На ${timeStr} актер импровизировал - этого не было в сценарии!`,
      `Съемки этой сцены (${timeStr}) заняли 3 дня.`,
      `В этом моменте (${timeStr}) спрятана пасхалка для фанатов.`
    ];
    
    return facts[Math.floor(Math.random() * facts.length)];
  }

  static generateRandomComments(movieTitle: string, count: number): Comment[] {
    const comments = [];
    for (let i = 0; i < count; i++) {
      const timestamp = Math.floor(Math.random() * 7200);
      comments.push(
        this.create(movieTitle, timestamp, this.generateFacts(movieTitle, timestamp))
      );
    }
    return comments.sort((a, b) => a.timestamp - b.timestamp);
  }
}