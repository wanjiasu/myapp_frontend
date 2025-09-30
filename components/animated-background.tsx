"use client";

import React, { useState, useEffect } from 'react';

const AnimatedBackground: React.FC = () => {
  const [isClient, setIsClient] = useState(false);
  
  // 使用固定的种子值生成一致的"随机"配置
  const meteorConfigs = Array.from({ length: 5 }, (_, i) => { // 减少流星数量从8个到5个
    // 使用索引作为种子，确保服务端和客户端生成相同的值
    const seed1 = (i * 9301 + 49297) % 233280;
    const seed2 = (i * 1234 + 5678) % 100000;
    const seed3 = (i * 4321 + 8765) % 200000;
    const seed4 = (i * 1111 + 2222) % 60000;
    const seed5 = (i * 7777 + 3333) % 90000;
    
    return {
      id: i,
      left: (seed1 / 233280) * 100,
      top: (seed2 / 100000) * 50,
      delay: (seed3 / 200000) * 20,
      duration: 12 + (seed4 / 60000) * 8, // 进一步增加持续时间，从 8-14秒 改为 12-20秒
      rotation: -30 + (seed5 / 90000) * 60
    };
  });

  // 生成固定的粒子配置以避免 hydration 错误
  const particleConfigs = Array.from({ length: 40 }, (_, i) => {
    // 使用不同的种子值确保粒子和流星的位置不同
    const seed1 = (i * 7919 + 65537) % 100000;
    const seed2 = (i * 2357 + 11111) % 100000;
    const seed3 = (i * 5431 + 22222) % 200000;
    const seed4 = (i * 8888 + 33333) % 180000;
    
    return {
      id: i,
      left: (seed1 / 100000) * 100,
      top: (seed2 / 100000) * 100,
      delay: (seed3 / 200000) * 20,
      duration: 10 + (seed4 / 180000) * 8,
      type: i % 4
    };
  });

  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* 网格背景 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
          animation: 'grid-move 20s linear infinite'
        }} />
      </div>

      {/* 大型光晕效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-cyan-400/20 via-blue-400/10 to-transparent rounded-full animate-glow-pulse blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 bg-gradient-radial from-purple-400/15 via-pink-400/8 to-transparent rounded-full animate-glow-pulse-delayed blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-gradient-radial from-green-400/12 via-teal-400/6 to-transparent rounded-full animate-glow-rotate blur-2xl" />
      </div>

      {/* 增强的波浪背景 */}
      <div className="absolute inset-0">
        <svg
          className="absolute bottom-0 left-0 w-full h-80 opacity-15"
          viewBox="0 0 1200 320"
          preserveAspectRatio="none"
        >
          <defs>
            <linearGradient id="wave-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(110, 231, 249, 0.3)" />
              <stop offset="50%" stopColor="rgba(165, 180, 252, 0.2)" />
              <stop offset="100%" stopColor="rgba(52, 211, 153, 0.3)" />
            </linearGradient>
            <linearGradient id="wave-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="rgba(139, 92, 246, 0.2)" />
              <stop offset="50%" stopColor="rgba(59, 130, 246, 0.15)" />
              <stop offset="100%" stopColor="rgba(16, 185, 129, 0.2)" />
            </linearGradient>
          </defs>
          <path
            fill="url(#wave-gradient-1)"
            d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave-1"
          />
          <path
            fill="url(#wave-gradient-2)"
            d="M0,192L48,197.3C96,203,192,213,288,208C384,203,480,181,576,165.3C672,149,768,139,864,144C960,149,1056,171,1152,181.3C1248,192,1344,192,1392,192L1440,192L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
            className="animate-wave-2"
          />
        </svg>
      </div>

      {/* 增强的浮动几何图形 */}
      <div className="absolute inset-0">
        {/* 大型装饰圆形 */}
        <div className="absolute top-16 left-8 w-48 h-48 bg-gradient-to-br from-cyan-400/15 to-blue-400/8 rounded-full animate-float-slow blur-sm" />
        <div className="absolute top-32 right-16 w-36 h-36 bg-gradient-to-br from-purple-400/12 to-pink-400/8 rounded-full animate-float-medium blur-sm" />
        <div className="absolute bottom-32 left-1/4 w-28 h-28 bg-gradient-to-br from-green-400/15 to-teal-400/10 rounded-full animate-float-fast blur-sm" />
        
        {/* 大型三角形 */}
        <div className="absolute top-1/3 right-1/4 animate-float-reverse">
          <div className="w-0 h-0 border-l-[60px] border-r-[60px] border-b-[104px] border-l-transparent border-r-transparent border-b-cyan-400/10 blur-sm" />
        </div>
        
        {/* 多个菱形 */}
        <div className="absolute bottom-1/4 right-12 w-24 h-24 bg-gradient-to-br from-yellow-400/15 to-orange-400/10 transform rotate-45 animate-rotate-slow blur-sm" />
        <div className="absolute top-1/2 left-16 w-16 h-16 bg-gradient-to-br from-pink-400/12 to-purple-400/8 transform rotate-45 animate-rotate-reverse blur-sm" />
        
        {/* 扩展的圆点群 */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <div className="w-4 h-4 bg-cyan-400/30 rounded-full animate-pulse-slow absolute -top-12 -left-12" />
          <div className="w-3 h-3 bg-purple-400/25 rounded-full animate-pulse-medium absolute top-8 left-16" />
          <div className="w-5 h-5 bg-green-400/20 rounded-full animate-pulse-fast absolute -bottom-10 right-12" />
          <div className="w-2 h-2 bg-pink-400/35 rounded-full animate-pulse-slow absolute top-16 -left-8" />
          <div className="w-3 h-3 bg-blue-400/25 rounded-full animate-pulse-medium absolute -top-6 right-20" />
        </div>
        
        {/* 增强的线条装饰 */}
        <div className="absolute top-1/4 left-1/2 w-px h-48 bg-gradient-to-b from-transparent via-cyan-400/20 to-transparent animate-fade-in-out" />
        <div className="absolute bottom-1/4 right-1/4 w-32 h-px bg-gradient-to-r from-transparent via-purple-400/20 to-transparent animate-fade-in-out-delayed" />
        <div className="absolute top-1/3 left-1/4 w-24 h-px bg-gradient-to-r from-transparent via-green-400/15 to-transparent animate-fade-in-out" />
      </div>

      {/* 流星效果 */}
      <div className="absolute inset-0">
        {meteorConfigs.map((config) => (
          <div
            key={`meteor-${config.id}`}
            className="absolute w-1 h-20 bg-gradient-to-b from-white/40 via-cyan-400/30 to-transparent animate-meteor blur-sm"
            style={{
              left: `${config.left}%`,
              top: `${config.top}%`,
              animationDelay: `${config.delay}s`,
              animationDuration: `${config.duration}s`,
              transform: `rotate(${config.rotation}deg)`
            }}
          />
        ))}
      </div>

      {/* 增强的粒子效果 */}
      <div className="absolute inset-0">
        {particleConfigs.map((config) => (
          <div
            key={`particle-${config.id}`}
            className={`absolute rounded-full animate-particle ${
              config.type === 0 ? 'w-2 h-2 bg-cyan-400/30' :
              config.type === 1 ? 'w-1 h-1 bg-purple-400/25' :
              config.type === 2 ? 'w-1.5 h-1.5 bg-green-400/20' :
              'w-1 h-1 bg-pink-400/30'
            }`}
            style={{
              left: `${config.left}%`,
              top: `${config.top}%`,
              animationDelay: `${config.delay}s`,
              animationDuration: `${config.duration}s`
            }}
          />
        ))}
      </div>

      {/* 脉冲环效果 */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 right-1/3 w-32 h-32 border border-cyan-400/20 rounded-full animate-pulse-ring" />
        <div className="absolute bottom-1/3 left-1/4 w-24 h-24 border border-purple-400/15 rounded-full animate-pulse-ring-delayed" />
        <div className="absolute top-2/3 right-1/4 w-20 h-20 border border-green-400/20 rounded-full animate-pulse-ring-slow" />
      </div>
    </div>
  );
};

export default AnimatedBackground;