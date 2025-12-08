import React from 'react';
import { Info, CheckCircle, AlertTriangle } from 'lucide-react';

interface CalloutBoxProps {
  text: string;
  style: 'info' | 'success' | 'warning';
}

/**
 * CalloutBox Component
 * 
 * Renders a highlighted callout box with different styles for info, success, and warning messages.
 * Styled with re:Invent branding colors.
 * 
 * Requirements:
 * - 13.1: Render highlighted box with specified style
 */
const CalloutBox: React.FC<CalloutBoxProps> = ({ text, style }) => {
  const styleConfig = {
    info: {
      bgColor: 'bg-reinvent-blue/20',
      borderColor: 'border-reinvent-blue/50',
      textColor: 'text-blue-200',
      icon: Info,
      iconColor: 'text-reinvent-blue',
    },
    success: {
      bgColor: 'bg-green-500/20',
      borderColor: 'border-green-500/50',
      textColor: 'text-green-200',
      icon: CheckCircle,
      iconColor: 'text-green-500',
    },
    warning: {
      bgColor: 'bg-reinvent-yellow/20',
      borderColor: 'border-reinvent-yellow/50',
      textColor: 'text-yellow-200',
      icon: AlertTriangle,
      iconColor: 'text-reinvent-yellow',
    },
  };

  const config = styleConfig[style];
  const IconComponent = config.icon;

  const ariaLabel = `${style} callout: ${text}`;
  
  return (
    <aside
      role="note"
      aria-label={ariaLabel}
      className={`flex items-start gap-2 sm:gap-3 p-3 sm:p-4 rounded-lg border ${config.bgColor} ${config.borderColor} backdrop-blur-sm`}
      data-testid="callout-box"
      data-style={style}
    >
      <IconComponent
        className={`flex-shrink-0 w-4 h-4 sm:w-5 sm:h-5 mt-0.5 ${config.iconColor}`}
        data-testid="callout-icon"
        aria-hidden="true"
      />
      <p className={`text-sm sm:text-base ${config.textColor} leading-relaxed`} data-testid="callout-text">
        {text}
      </p>
    </aside>
  );
};

export default CalloutBox;
