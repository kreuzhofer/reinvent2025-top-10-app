import { useState, useCallback, useEffect } from 'react';
import { EmojiAnimation } from './EmojiAnimation';
import { EmojiManager } from '../services/emoji/EmojiManager';
import type { EmojiConfig } from '../services/emoji/EmojiManager';

interface EmojiContainerProps {
  emojiManager: EmojiManager;
}

export const EmojiContainer: React.FC<EmojiContainerProps> = ({ emojiManager }) => {
  const [activeEmojis, setActiveEmojis] = useState<EmojiConfig[]>([]);

  const handleEmojiComplete = useCallback((id: string) => {
    setActiveEmojis(prev => prev.filter(emoji => emoji.id !== id));
    emojiManager.removeEmoji(id);
  }, [emojiManager]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      emojiManager.cleanup();
    };
  }, [emojiManager]);

  // Expose methods to parent via ref or context
  // For now, we'll use a simple approach where the parent can trigger emojis
  // This will be enhanced in the useEmojiManager hook

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 9999
      }}
    >
      {activeEmojis.map(config => (
        <EmojiAnimation
          key={config.id}
          config={config}
          onComplete={() => handleEmojiComplete(config.id)}
        />
      ))}
    </div>
  );
};
