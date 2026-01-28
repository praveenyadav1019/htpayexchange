
import React from 'react';

interface LogoProps {
  className?: string;
  iconOnly?: boolean;
  color?: 'dark' | 'white';
}

const Logo: React.FC<LogoProps> = ({ className = "h-10", iconOnly = false, color = 'dark' }) => {
  const primaryColor = color === 'white' ? '#FFFFFF' : '#002D5B';
  const iconBg = color === 'white' ? '#dc2626' : '#002D5B'; // Red for admin, blue for user
  const textFill = color === 'white' ? '#FFFFFF' : '#002D5B';

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      {/* Icon: Square with $ */}
      <svg 
        viewBox="0 0 100 100" 
        className="h-full w-auto aspect-square drop-shadow-sm"
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect width="100" height="100" rx="24" fill={iconBg} />
        <path 
          d="M50 25V30M50 70V75M62 40C62 35.5 58.5 32 54 32H46C41.5 32 38 35.5 38 40C38 44.5 41.5 48 46 48H54C58.5 48 62 51.5 62 56C62 60.5 58.5 64 54 64H46C41.5 64 38 60.5 38 56" 
          stroke="white" 
          strokeWidth="8" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        />
        <path d="M50 32V68" stroke="white" strokeWidth="8" strokeLinecap="round"/>
      </svg>

      {/* Text: Wordmark */}
      {!iconOnly && (
        <svg 
          viewBox="0 0 240 60" 
          className="h-[80%] w-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <text 
            x="0" 
            y="48" 
            fill={textFill} 
            style={{ 
              fontFamily: 'Inter, sans-serif', 
              fontWeight: 800, 
              fontSize: '52px',
              letterSpacing: '-1px'
            }}
          >
            HTPAY
          </text>
        </svg>
      )}
    </div>
  );
};

export default Logo;
