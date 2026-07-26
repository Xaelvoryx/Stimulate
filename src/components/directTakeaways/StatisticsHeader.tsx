'use client';

import { useEffect, useState } from 'react';

interface StatItem {
  label: string;
  value: number;
  suffix?: string;
}

const stats: StatItem[] = [
  { label: 'Categories', value: 6 },
  { label: 'Resources', value: 70, suffix: '+' },
  { label: 'Access', value: 1, suffix: ' Click' },
  { label: 'Ecosystem', value: 1, suffix: ' Curated' },
];

export function StatisticsHeader() {
  const [animatedValues, setAnimatedValues] = useState<number[]>(stats.map(() => 0));

  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    const animate = () => {
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);

        setAnimatedValues(
          stats.map((stat) => Math.floor(stat.value * easeOutQuart))
        );

        if (currentStep >= steps) {
          clearInterval(timer);
          setAnimatedValues(stats.map((stat) => stat.value));
        }
      }, interval);
    };

    animate();
  }, []);

  return (
    <div className="mb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className="bg-[var(--surface)] border border-[var(--line)] p-5 text-center hover:border-[var(--line-2)] transition-all duration-300"
            style={{
              animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`,
            }}
          >
            <div className="text-2xl font-bold text-[var(--brand)] mb-1 font-mono">
              {animatedValues[index]}
              {stat.suffix}
            </div>
            <div className="text-xs text-[var(--faint)] font-mono uppercase tracking-wider">{stat.label}</div>
          </div>
        ))}
      </div>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
