import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAudioManager } from '../hooks/useAudioManager';
import { KiroBranding } from './KiroBranding';
import { AudioControls } from './AudioControls';

interface WelcomeScreenProps {
  onStart: () => void;
}

const WelcomeScreen = ({ onStart }: WelcomeScreenProps) => {
  const { playBackgroundMusic } = useAudioManager();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // Play welcome background music on mount
  useEffect(() => {
    playBackgroundMusic('welcome-bg.mp3');
  }, [playBackgroundMusic]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Enter') {
        onStart();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [onStart]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4 relative overflow-hidden">
      {/* Diagonal Banner - AWS Internal Use Only */}
      <motion.div
        className="absolute pointer-events-none z-30"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ 
          duration: 0.5,
          delay: 0.6,
          ease: 'easeOut'
        }}
        style={{
          top: '140px',
          left: '-110px',
        }}
      >
        <div 
          className="bg-red-600/90 text-white font-bold text-xs md:text-sm py-2 md:py-3 px-12 md:px-16 shadow-2xl whitespace-nowrap"
          style={{
            transform: 'rotate(-45deg)',
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
          }}
        >
          AWS Internal Use Only - Do Not Share Externally
        </div>
      </motion.div>

      {/* Audio Controls - Upper Right Corner */}
      <motion.div
        className="absolute top-4 right-4 z-20"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.3,
          delay: 0.2,
          ease: 'easeOut'
        }}
      >
        <AudioControls inline={true} />
      </motion.div>

      {/* Animated Background Video */}
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute inset-0 w-full h-full object-cover opacity-75"
        style={{ filter: 'brightness(0.7)' }}
      >
        <source src="/website-header-1920x700-grid-hero-1-3.mp4" type="video/mp4" />
      </video>

      {/* Content Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.4,
          ease: 'easeOut'
        }}
        className="text-center max-w-2xl relative z-10"
      >
        {/* re:Invent Logo with Date/Location */}
        <div className="mb-8">
          <motion.img
            src="/reinvent-white.png"
            alt="AWS re:Invent Logo"
            className="w-64 md:w-80 mx-auto"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.4,
              delay: 0.1,
              ease: 'easeOut'
            }}
          />
          <motion.p
            className="text-sm md:text-base text-gray-300 mt-2 md:mt-3 tracking-wide"
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ 
              duration: 0.3,
              delay: 0.15,
              ease: 'easeOut'
            }}
          >
            December 1-5, 2025 | Las Vegas
          </motion.p>
        </div>

        {/* Welcome Message */}
        <motion.h1
          className="text-4xl md:text-5xl font-bold text-white mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.2,
            ease: 'easeOut'
          }}
        >
          AWS re:Invent 2025 Quiz
        </motion.h1>

        <motion.p
          className="text-xl md:text-2xl text-gray-300 mb-12"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.3,
            ease: 'easeOut'
          }}
        >
          Test your knowledge of the latest AWS announcements
        </motion.p>

        {/* Start Button */}
        <motion.button
          onClick={onStart}
          className="bg-reinvent-purple hover:bg-purple-600 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors duration-200 mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ 
            duration: 0.3,
            delay: 0.35,
            ease: 'easeOut'
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Start Quiz
        </motion.button>

        {/* Keyboard Shortcut Hint */}
        <motion.p
          className="text-gray-500 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            duration: 0.3,
            delay: 0.4,
            ease: 'easeOut'
          }}
        >
          Press Enter to start
        </motion.p>

        {/* Kiro Branding */}
        <motion.div
          className="mt-6 flex justify-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.3,
            delay: 0.5,
            ease: 'easeOut'
          }}
        >
          <KiroBranding variant="welcome" />
        </motion.div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
