'use client';

import { useEffect, useState } from 'react';
import { motion, useSpring, useTransform } from 'framer-motion';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  format?: (value: number) => string;
}

export function AnimatedNumber({ 
  value, 
  suffix = '', 
  prefix = '', 
  duration = 0.8,
  format 
}: AnimatedNumberProps) {
  const [displayValue, setDisplayValue] = useState(0);
  
  useEffect(() => {
    const steps = 60;
    const stepValue = value / steps;
    let current = 0;
    let count = 0;
    
    const timer = setInterval(() => {
      current += stepValue;
      count++;
      if (count >= steps) {
        setDisplayValue(value);
        clearInterval(timer);
      } else {
        setDisplayValue(Math.floor(current));
      }
    }, (duration * 1000) / steps);
    
    return () => clearInterval(timer);
  }, [value, duration]);
  
  const formattedValue = format ? format(displayValue) : displayValue.toLocaleString();
  
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {prefix}{formattedValue}{suffix}
    </motion.span>
  );
}