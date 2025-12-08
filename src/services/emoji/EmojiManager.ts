export interface EmojiConfig {
  id: string;
  emoji: string;
  startPosition: { x: number; y: number; z: number };
  endPosition: { x: number; y: number };
  rotation: number;
  scale: number;
  duration: number;
}

export interface EmojiManagerOptions {
  maxConcurrentEmojis: number;
  displayDuration: number;
  animationDuration: number;
}

export class EmojiManager {
  private activeEmojis: Set<string>;
  private activeEmojiConfigs: Map<string, EmojiConfig>;
  private successEmojis: string[];
  private missEmojis: string[];
  private options: EmojiManagerOptions;
  private lastUsedEmojis: Map<'success' | 'miss', string[]>;

  constructor(options: EmojiManagerOptions) {
    this.activeEmojis = new Set();
    this.activeEmojiConfigs = new Map();
    this.successEmojis = ['💪', '🔥', '⭐', '🎯', '✨'];
    this.missEmojis = ['💔', '🔨', '💥', '🌟', '🎪'];
    this.options = options;
    this.lastUsedEmojis = new Map([
      ['success', []],
      ['miss', []]
    ]);
  }

  showSuccessEmoji(): EmojiConfig | null {
    if (this.activeEmojis.size >= this.options.maxConcurrentEmojis) {
      return null;
    }

    const emoji = this.selectEmoji('success');
    const config = this.generateEmojiConfig(emoji);
    this.activeEmojis.add(config.id);
    this.activeEmojiConfigs.set(config.id, config);

    return config;
  }

  showMissEmoji(): EmojiConfig | null {
    if (this.activeEmojis.size >= this.options.maxConcurrentEmojis) {
      return null;
    }

    const emoji = this.selectEmoji('miss');
    const config = this.generateEmojiConfig(emoji);
    this.activeEmojis.add(config.id);
    this.activeEmojiConfigs.set(config.id, config);

    return config;
  }

  private selectEmoji(type: 'success' | 'miss'): string {
    const pool = type === 'success' ? this.successEmojis : this.missEmojis;
    const lastUsed = this.lastUsedEmojis.get(type) || [];

    // Try to select an emoji that wasn't recently used
    const availableEmojis = pool.filter(e => !lastUsed.includes(e));
    const selectedEmoji = availableEmojis.length > 0
      ? availableEmojis[Math.floor(Math.random() * availableEmojis.length)]
      : pool[Math.floor(Math.random() * pool.length)];

    // Update last used emojis (keep last 2)
    const updated = [...lastUsed, selectedEmoji].slice(-2);
    this.lastUsedEmojis.set(type, updated);

    return selectedEmoji;
  }

  private generateEmojiConfig(emoji: string): EmojiConfig {
    const id = `emoji-${Date.now()}-${Math.random()}`;
    
    // Generate random positions with overlap prevention
    let config: EmojiConfig;
    let attempts = 0;
    const maxAttempts = 10;

    do {
      config = {
        id,
        emoji,
        startPosition: {
          x: Math.random() * window.innerWidth,
          y: Math.random() * window.innerHeight,
          z: -500 + Math.random() * 400 // -500 to -100
        },
        endPosition: {
          x: Math.random() * (window.innerWidth - 100) + 50,
          y: Math.random() * (window.innerHeight - 100) + 50
        },
        rotation: -15 + Math.random() * 30, // -15 to 15
        scale: 0.8 + Math.random() * 0.4, // 0.8 to 1.2
        duration: this.options.animationDuration
      };
      attempts++;
    } while (this.checkOverlap(config) && attempts < maxAttempts);

    return config;
  }

  private checkOverlap(config: EmojiConfig): boolean {
    const size1 = 80 * config.scale;
    const overlapThreshold = 0.3;

    for (const [_id, activeConfig] of this.activeEmojiConfigs) {
      const size2 = 80 * activeConfig.scale;
      
      const dx = Math.abs(config.endPosition.x - activeConfig.endPosition.x);
      const dy = Math.abs(config.endPosition.y - activeConfig.endPosition.y);
      
      // Calculate overlap percentage
      const overlapX = Math.max(0, (size1 + size2) / 2 - dx);
      const overlapY = Math.max(0, (size1 + size2) / 2 - dy);
      const overlapArea = overlapX * overlapY;
      const minArea = Math.min(size1 * size1, size2 * size2);
      const overlapPercentage = minArea > 0 ? overlapArea / minArea : 0;
      
      if (overlapPercentage > overlapThreshold) {
        return true;
      }
    }

    return false;
  }

  removeEmoji(id: string): void {
    this.activeEmojis.delete(id);
    this.activeEmojiConfigs.delete(id);
  }

  cleanup(): void {
    this.activeEmojis.clear();
    this.activeEmojiConfigs.clear();
    this.lastUsedEmojis.set('success', []);
    this.lastUsedEmojis.set('miss', []);
  }

  getActiveEmojiCount(): number {
    return this.activeEmojis.size;
  }
}
