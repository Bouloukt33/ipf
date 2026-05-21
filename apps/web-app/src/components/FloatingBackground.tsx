import Image from 'next/image'

const floatingMascots = [
    { src: '/mascots/coach.png', size: 180, top: '10%', left: '5%', delay: '0s', duration: '25s', hue: 0 },
    { src: '/mascots/joyeux.png', size: 140, top: '60%', left: '80%', delay: '3s', duration: '30s', hue: 30 },
    { src: '/mascots/applaudit.png', size: 200, top: '30%', left: '75%', delay: '6s', duration: '28s', hue: 60 },
    { src: '/mascots/joyeux.png', size: 120, top: '75%', left: '10%', delay: '9s', duration: '22s', hue: 90 },
    { src: '/mascots/bravo.png', size: 160, top: '50%', left: '50%', delay: '12s', duration: '26s', hue: 120 },
    { src: '/mascots/mascotte.png', size: 130, top: '15%', left: '40%', delay: '2s', duration: '24s', hue: 150 },
    { src: '/mascots/faire_choix.png', size: 150, top: '85%', left: '60%', delay: '8s', duration: '27s', hue: 180 },
    { src: '/mascots/gene.png', size: 170, top: '40%', left: '15%', delay: '5s', duration: '29s', hue: 210 },
]

export default function FloatingBackground() {
    return (
        <>
            <style>{`
        @keyframes mascot-float {
          0%,100% { transform: translate(0,0) rotate(0deg) scale(1); }
          25%      { transform: translate(30px,-40px) rotate(5deg) scale(1.05); }
          50%      { transform: translate(-20px,30px) rotate(-5deg) scale(0.95); }
          75%      { transform: translate(40px,20px) rotate(3deg) scale(1.02); }
        }
      `}</style>

            {/* Colored bg + floating mascots */}
            <div className="fixed inset-0 z-0 overflow-hidden bg-[#d27a2d96]">
                {floatingMascots.map((m, i) => (
                    <div
                        key={i}
                        className="absolute opacity-25 pointer-events-none"
                        style={{
                            width: m.size,
                            height: m.size,
                            top: m.top,
                            left: m.left,
                            animation: `mascot-float ${m.duration} ease-in-out infinite`,
                            animationDelay: m.delay,
                        }}
                    >
                        <Image
                            src={m.src}
                            alt=""
                            fill
                            className="object-contain"
                            style={{ filter: `blur(3px) hue-rotate(${m.hue}deg)` }}
                        />
                    </div>
                ))}
            </div>

            {/* Readability overlay */}
            <div className="fixed inset-0 z-[1] bg-white/75 pointer-events-none" />
        </>
    )
}