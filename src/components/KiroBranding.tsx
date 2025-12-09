import { useState } from 'react';

interface KiroBrandingProps {
  variant?: 'welcome' | 'header';
  className?: string;
}

export const KiroBranding: React.FC<KiroBrandingProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const [logoError, setLogoError] = useState(false);

  // Variant-specific classes
  const variantClasses = {
    welcome: 'text-base p-3',
    header: 'text-sm p-2'
  };

  const logoClasses = {
    welcome: 'h-6',
    header: 'h-5'
  };

  return (
    <a
      href="https://kiro.dev"
      target="_blank"
      rel="noopener noreferrer"
      className={`
        flex items-center gap-1.5
        border border-gray-700 rounded-lg
        bg-gray-800 hover:bg-gray-700
        text-white
        transition-colors duration-200
        ${variantClasses[variant]}
        ${className}
      `.trim().replace(/\s+/g, ' ')}
      aria-label="Visit Kiro website"
    >
      <span className="text-gray-300">Made with</span>
      {!logoError && (
        <img
          src="/data/icons/aws/kiro.svg"
          alt="Kiro logo"
          className={`${logoClasses[variant]} w-auto mx-1.5`}
          loading="lazy"
          onError={() => setLogoError(true)}
        />
      )}
      <span>Kiro</span>
    </a>
  );
};
