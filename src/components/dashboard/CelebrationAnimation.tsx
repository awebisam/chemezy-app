import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { UserAward } from '@/types/award.types';

interface CelebrationAnimationProps {
  award: UserAward;
  onComplete: () => void;
}

export const CelebrationAnimation: React.FC<CelebrationAnimationProps> = ({
  award,
  onComplete,
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [animationPhase, setAnimationPhase] = useState<
    'enter' | 'celebrate' | 'exit'
  >('enter');

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setAnimationPhase('celebrate');
    }, 500);

    const timer2 = setTimeout(() => {
      setAnimationPhase('exit');
    }, 3000);

    const timer3 = setTimeout(() => {
      setIsVisible(false);
      onComplete();
    }, 3500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);
    };
  }, [onComplete]);

  const getTierInfo = (tier: number) => {
    if (tier >= 3) {
      return {
        name: 'Gold',
        color: 'text-yellow-400',
        bgColor: 'bg-gradient-to-r from-yellow-400 to-yellow-600',
        particles: 'bg-yellow-300',
      };
    } else if (tier >= 2) {
      return {
        name: 'Silver',
        color: 'text-gray-300',
        bgColor: 'bg-gradient-to-r from-gray-300 to-gray-500',
        particles: 'bg-gray-200',
      };
    } else {
      return {
        name: 'Bronze',
        color: 'text-orange-400',
        bgColor: 'bg-gradient-to-r from-orange-400 to-orange-600',
        particles: 'bg-orange-300',
      };
    }
  };

  const tierInfo = getTierInfo(award.tier);

  if (!isVisible) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      {/* Background overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-500 ${
          animationPhase === 'enter'
            ? 'opacity-0'
            : animationPhase === 'celebrate'
              ? 'opacity-30'
              : 'opacity-0'
        }`}
      />

      {/* Confetti particles */}
      <div className="absolute inset-0 overflow-hidden">
        {Array.from({ length: 50 }).map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 ${tierInfo.particles} opacity-80 animate-bounce-slow`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>

      {/* Main celebration card */}
      <div
        className={`relative bg-white rounded-2xl shadow-2xl p-8 max-w-md mx-4 text-center transform transition-all duration-500 ${
          animationPhase === 'enter'
            ? 'scale-0 rotate-180 opacity-0'
            : animationPhase === 'celebrate'
              ? 'scale-100 rotate-0 opacity-100'
              : 'scale-110 rotate-0 opacity-0'
        }`}
      >
        {/* Sparkle effects */}
        <div className="absolute -top-4 -right-4">
          <div className="w-8 h-8 text-yellow-400 animate-pulse-slow">
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-3.01L12 0z" />
            </svg>
          </div>
        </div>
        <div className="absolute -bottom-2 -left-2">
          <div
            className="w-6 h-6 text-blue-400 animate-pulse-slow"
            style={{ animationDelay: '0.5s' }}
          >
            <svg fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-3.01L12 0z" />
            </svg>
          </div>
        </div>

        {/* Award icon */}
        <div
          className={`inline-flex items-center justify-center w-20 h-20 rounded-full ${tierInfo.bgColor} mb-4 animate-bounce-slow`}
        >
          <svg
            className="w-12 h-12 text-white"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>

        {/* Celebration text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Award Earned! 🎉
        </h2>

        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {award.template.name}
        </h3>

        <div className="flex items-center justify-center space-x-2 mb-3">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${tierInfo.color} bg-gray-100`}
          >
            {tierInfo.name} Tier
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-primary-600 bg-primary-100">
            +{award.tier * 10} Points
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {award.template.description}
        </p>

        {/* Animated progress bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className="h-2 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full transition-all duration-2000 ease-out"
            style={{
              width: animationPhase === 'celebrate' ? '100%' : '0%',
              transitionDelay: '0.5s',
            }}
          />
        </div>

        {/* Celebration message */}
        <div className="text-sm text-gray-700">
          <p className="font-medium">Congratulations!</p>
          <p>Keep experimenting to unlock more achievements!</p>
        </div>

        {/* Floating particles around the card */}
        {animationPhase === 'celebrate' && (
          <>
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={`particle-${i}`}
                className={`absolute w-1 h-1 ${tierInfo.particles} rounded-full animate-ping`}
                style={{
                  left: `${20 + Math.random() * 60}%`,
                  top: `${20 + Math.random() * 60}%`,
                  animationDelay: `${Math.random() * 1}s`,
                  animationDuration: `${1 + Math.random()}s`,
                }}
              />
            ))}
          </>
        )}
      </div>

      {/* Fireworks effect */}
      {animationPhase === 'celebrate' && (
        <div className="absolute inset-0 pointer-events-none">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={`firework-${i}`}
              className="absolute"
              style={{
                left: `${10 + Math.random() * 80}%`,
                top: `${10 + Math.random() * 80}%`,
              }}
            >
              <div className="relative">
                {Array.from({ length: 8 }).map((_, j) => (
                  <div
                    key={j}
                    className={`absolute w-1 h-8 ${tierInfo.particles} opacity-70`}
                    style={{
                      transform: `rotate(${j * 45}deg)`,
                      transformOrigin: 'bottom center',
                      animation: `firework 1s ease-out ${i * 0.2}s`,
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        @keyframes firework {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>,
    document.body
  );
};
