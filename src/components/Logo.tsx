interface LogoProps {
  className?: string;
  showText?: boolean;
  size?: "sm" | "md" | "lg";
}

const Logo = ({ className = "", showText = true, size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-8 h-8", 
    lg: "w-10 h-10"
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl"
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Calendar with Location Pin SVG */}
      <div className={`${sizeClasses[size]} relative`}>
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Calendar background */}
          <rect 
            x="15" 
            y="25" 
            width="70" 
            height="60" 
            rx="8" 
            fill="hsl(var(--primary))" 
          />
          {/* Calendar header */}
          <rect 
            x="15" 
            y="25" 
            width="70" 
            height="15" 
            rx="8" 
            fill="hsl(var(--primary))" 
          />
          {/* Calendar body */}
          <rect 
            x="18" 
            y="35" 
            width="64" 
            height="47" 
            rx="4" 
            fill="white" 
          />
          {/* Calendar rings */}
          <rect 
            x="30" 
            y="18" 
            width="6" 
            height="14" 
            rx="3" 
            fill="hsl(var(--primary))" 
          />
          <rect 
            x="64" 
            y="18" 
            width="6" 
            height="14" 
            rx="3" 
            fill="hsl(var(--primary))" 
          />
          {/* Calendar dots */}
          <circle cx="30" cy="50" r="3" fill="hsl(var(--primary))" />
          <circle cx="45" cy="50" r="3" fill="hsl(var(--primary))" />
          <circle cx="30" cy="65" r="3" fill="hsl(var(--primary))" />
          <circle cx="45" cy="65" r="1.5" fill="hsl(var(--primary))" />
          
          {/* Location pin */}
          <circle 
            cx="70" 
            cy="70" 
            r="18" 
            fill="hsl(var(--primary))" 
          />
          <circle 
            cx="70" 
            cy="70" 
            r="6" 
            fill="white" 
          />
          <path 
            d="M70 55 L70 70 L80 80 Z" 
            fill="hsl(var(--primary))" 
          />
        </svg>
      </div>
      
      {showText && (
        <h1 className={`${textSizeClasses[size]} font-display font-bold bg-gradient-primary bg-clip-text text-transparent`}>
          Evently
        </h1>
      )}
    </div>
  );
};

export default Logo;