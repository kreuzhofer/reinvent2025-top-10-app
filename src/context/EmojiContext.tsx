import React, { createContext, useContext, useState, useCallback, useRef } from 'react';
import { EmojiManager } from '../services/emoji/EmojiManager';
import { EmojiAnimation } from '../components/EmojiAnimation';
import type { EmojiConfig } from '../services/emoji/EmojiManager';

/**
 * Context type for emoji management
 */
interface EmojiContextType {
  showSuccessEmoji: () => void;
  showMissEmoji: () => void;
}

/**
 * Emoji context for providing emoji manager to the application
 */
const EmojiContext = createContext<EmojiContextType | undefined>(undefined);

/**
 * Props for EmojiProvider component
 */
interface EmojiProviderProps {
  children: React.ReactNode;
}

/**
 * EmojiProvider component that manages the EmojiManager instance
 * and provides emoji animation functionality to the application through context.
 */
export const EmojiProvider: React.FC<EmojiProviderProps> = ({ children }) => {
  const [emojiManager] = useState<EmojiManager>(() => {
    return new EmojiManager({
      maxConcurrentEmojis: 3,
      displayDuration: 1500,
      animationDuration: 800,
    });
  });

  const [activeEmojis, setActiveEmojis] = useState<EmojiConfig[]>([]);
  const audioManagerRef = useRef<any>(null);

  /**
   * Show a success emoji animation
   */
  const showSuccessEmoji = useCallback(() => {
    const config = emojiManager.showSuccessEmoji();
    if (config) {
      setActiveEmojis(prev => [...prev, config]);
      
      // Play emoji fly-in sound effect if audio manager is available
      if (audioManagerRef.current) {
        audioManagerRef.current.playSFX('effects/emoji-fly.mp3').catch(() => {
          // Silently fail if audio doesn't play
        });
      }
    }
  }, [emojiManager]);

  /**
   * Show a miss emoji animation
   */
  const showMissEmoji = useCallback(() => {
    const config = emojiManager.showMissEmoji();
    if (config) {
      setActiveEmojis(prev => [...prev, config]);
      
      // Play emoji fly-in sound effect if audio manager is available
      if (audioManagerRef.current) {
        audioManagerRef.current.playSFX('effects/emoji-fly.mp3').catch(() => {
          // Silently fail if audio doesn't play
        });
      }
    }
  }, [emojiManager]);

  /**
   * Handle emoji animation completion
   */
  const handleEmojiComplete = useCallback((id: string) => {
    setActiveEmojis(prev => prev.filter(emoji => emoji.id !== id));
    emojiManager.removeEmoji(id);
  }, [emojiManager]);

  const value: EmojiContextType = {
    showSuccessEmoji,
    showMissEmoji,
  };

  return (
    <EmojiContext.Provider value={value}>
      {children}
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
    </EmojiContext.Provider>
  );
};

/**
 * Hook to access the emoji context
 * @throws Error if used outside of EmojiProvider
 */
export const useEmojiContext = () => {
  const context = useContext(EmojiContext);
  if (context === undefined) {
    throw new Error('useEmojiContext must be used within an EmojiProvider');
  }
  return context;
};
