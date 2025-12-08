import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EmojiConfig } from '../services/emoji/EmojiManager';

interface EmojiAnimationProps {
  config: EmojiConfig;
  onComplete: () => void;
}

export const EmojiAnimation: React.FC<EmojiAnimationProps> = ({ config, onComplete }) => {
  useEffect(() => {
    // Set up cleanup timer
    const timer = setTimeout(() => {
      onComplete();
    }, config.duration + 1500); // animation duration + display time

    return () => clearTimeout(timer);
  }, [config.duration, onComplete]);

  return (
    <motion.div
      initial={{
        x: config.startPosition.x,
        y: config.startPosition.y,
        z: config.startPosition.z,
        scale: 0,
        rotate: 0,
        opacity: 0
      }}
      animate={{
        x: config.endPosition.x,
        y: config.endPosition.y,
        z: 0,
        scale: config.scale,
        rotate: config.rotation,
        opacity: 1
      }}
      transition={{
        duration: config.duration / 1000,
        ease: 'easeOut'
      }}
      style={{
        position: 'fixed',
        fontSize: '80px',
        pointerEvents: 'none',
        zIndex: 9999,
        willChange: 'transform'
      }}
    >
      {config.emoji}
    </motion.div>
  );
};
