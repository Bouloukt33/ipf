export default function LoginIllustration() {
  return (
    <div className="hidden md:flex justify-center items-center">
      <div className="relative w-full max-w-[500px] aspect-square">
        {/* Glow effect behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-full blur-3xl animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-br from-primary/20 to-primary-light/10 backdrop-blur-lg rounded-3xl border-2 border-primary/40 p-12 shadow-2xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary-light/20 rounded-full blur-2xl" />
          
          {/* Timer Icon - Large */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full space-y-8">
            <div className="relative">
              {/* Outer ring */}
              <div className="w-64 h-64 rounded-full border-8 border-primary/30 flex items-center justify-center animate-pulse-ring">
                {/* Inner circle */}
                <div className="w-48 h-48 bg-gradient-to-br from-primary to-primary-light rounded-full flex items-center justify-center shadow-[0_20px_60px_rgba(210,122,45,0.5)]">
                  <div className="text-center">
                    <div className="text-8xl font-black text-white animate-bounce-icon">
                      ⚡
                    </div>
                    <div className="text-6xl font-black text-white mt-2 animate-countdown-pulse">
                      5
                    </div>
                    <div className="text-sm font-bold text-white/90 tracking-[3px] mt-1">
                      SECONDES
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating particles */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-3 h-3 bg-primary rounded-full animate-float-particle"
                  style={{
                    top: `${[10, 20, 70, 80, 70, 30][i]}%`,
                    left: `${[10, 80, 85, 15, 15, 80][i]}%`,
                    animationDelay: `${i * 0.5}s`,
                  }}
                />
              ))}
            </div>
            
            {/* Text */}
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-black text-white">
                Apprenez en 5 secondes
              </h3>
              <p className="text-white/70 font-semibold max-w-sm">
                Une méthode révolutionnaire pour maîtriser l'immobilier commercial
              </p>
            </div>

            {/* Stats badges */}
            <div className="flex gap-4 flex-wrap justify-center">
              {[
                { icon: '📚', text: '50+ Quiz' },
                { icon: '🎯', text: '100% Efficace' },
                { icon: '⚡', text: 'Rapide' },
              ].map((badge, i) => (
                <div
                  key={i}
                  className="bg-primary/20 backdrop-blur-sm border border-primary/30 rounded-full px-4 py-2 flex items-center gap-2"
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-white font-bold text-sm">{badge.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}