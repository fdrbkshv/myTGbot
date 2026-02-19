import { Comment } from '../../../shared/src/types/comment.types';

export class CommentService {
  generateCommentsBefore(movieTitle: string, upToTimestamp: number, count: number): Comment[] {
    const comments = [];
    // Генерируем комментарии для моментов до указанного времени
    for (let i = 0; i < count; i++) {
      const timestamp = Math.floor(Math.random() * upToTimestamp);
      comments.push({
        id: `${Date.now()}_${i}`,
        movieId: '',
        movieTitle,
        timestamp,
        text: this.generateFact(movieTitle, timestamp),
        createdAt: new Date()
      });
    }
    return comments.sort((a, b) => a.timestamp - b.timestamp);
  }

  private generateFact(movieTitle: string, timestamp: number): string {
    const minutes = Math.floor(timestamp / 60);
    const seconds = timestamp % 60;
    const timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    const facts = [
      `На ${timeStr} происходит важная сцена, которая многое объясняет!`,
      `Обрати внимание на диалог в ${timeStr} - там есть скрытый смысл.`,
      `Актер в этой сцене (${timeStr}) improviziroval - этого не было в сценарии!`,
      `Саундтрек в ${timeStr} написан специально для этого момента.`,
      `Режиссер считает сцену на ${timeStr} одной из лучших в фильме.`,
      `На ${timeStr} можно заметить интересную деталь в кадре.`,
      `Этот момент (${timeStr}) особенно любят фанаты.`,
      `Съемки этой сцены (${timeStr}) проходили в необычном месте.`
    ];
    
    return facts[Math.floor(Math.random() * facts.length)];
  }
}