export default function RegisterIllustration() {
  return (
    <div className="hidden md:flex justify-center items-center">
      <div className="relative w-full max-w-[500px]">
        {/* Glow effect behind */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-primary-light/30 rounded-full blur-3xl animate-pulse" />
        
        {/* Main card */}
        <div className="relative bg-gradient-to-br from-primary/20 to-primary-light/10 backdrop-blur-lg rounded-3xl border-2 border-primary/40 p-12 shadow-2xl overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-32 h-32 bg-primary/20 rounded-full blur-2xl" />
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary-light/20 rounded-full blur-2xl" />
          
          {/* Content */}
          <div className="relative z-10 flex flex-col items-center space-y-8">
            {/* Gamification badges */}
            <div className="grid grid-cols-3 gap-4 w-full">
              {[
                { icon: '🎮', label: 'Gamifié', color: 'primary' },
                { icon: '⚡', label: '5 Sec', color: 'primary-light' },
                { icon: '🏆', label: 'Récompenses', color: 'primary' },
              ].map((item, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-br from-primary/20 to-primary-light/10 backdrop-blur-sm border-2 border-primary/30 rounded-2xl p-6 flex flex-col items-center justify-center space-y-2 hover:scale-105 transition-transform"
                  style={{ animationDelay: `${i * 0.2}s` }}
                >
                  <div className="text-5xl">{item.icon}</div>
                  <div className="text-white font-bold text-sm text-center">
                    {item.label}
                  </div>
                </div>
              ))}
            </div>

            {/* Central message */}
            <div className="text-center space-y-4 py-6">
              <div className="w-24 h-24 mx-auto bg-gradient-primary rounded-full flex items-center justify-center shadow-[0_20px_50px_rgba(210,122,45,0.5)] animate-bounce-icon">
                <span className="text-5xl">🚀</span>
              </div>
              <h3 className="text-3xl font-black text-white">
                Rejoignez-nous !
              </h3>
              <p className="text-white/70 font-semibold max-w-sm mx-auto leading-relaxed">
                Accédez à des centaines de quiz, progressez à votre rythme et devenez un expert
              </p>
            </div>

            {/* Features list */}
            <div className="w-full space-y-3">
              {[
                { icon: '✓', text: 'Quiz illimités' },
                { icon: '✓', text: 'Progression personnalisée' },
                { icon: '✓', text: 'Coaching IA' },
                { icon: '✓', text: 'Communauté active' },
              ].map((feature, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-primary/10 backdrop-blur-sm border border-primary/20 rounded-xl px-5 py-3"
                >
                  <span className="text-primary text-xl font-black">{feature.icon}</span>
                  <span className="text-white font-semibold">{feature.text}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="flex gap-6 justify-center w-full pt-4">
              {[
                { number: '1000+', label: 'Utilisateurs' },
                { number: '50+', label: 'Quiz' },
              ].map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-4xl font-black bg-gradient-primary bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-white/70 text-sm font-bold mt-1">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}