import { useEffect } from 'react';
import { motion } from 'framer-motion';
import type { EmojiConfig } from '../services/emoji/EmojiManager';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface EmojiAnimationProps {
  config: EmojiConfig;
  onComplete: () => void;
}

export const EmojiAnimation: React.FC<EmojiAnimationProps> = ({ config, onComplete }) => {
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    // Set up cleanup timer
    const timer = setTimeout(() => {
      onComplete();
    }, config.duration + 1500); // animation duration + display time

    return () => clearTimeout(timer);
  }, [config.duration, onComplete]);

  // If user prefers reduced motion, show emoji without animation
  if (prefersReducedMotion) {
    return (
      <div
        style={{
          position: 'fixed',
          fontSize: '80px',
          pointerEvents: 'none',
          zIndex: 9999,
          left: config.endPosition.x,
          top: config.endPosition.y,
          transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
          opacity: 1
        }}
      >
        {config.emoji}
      </div>
    );
  }

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
