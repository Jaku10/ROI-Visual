import React from 'react';
import * as Slider from '@radix-ui/react-slider';
import { Info, AlertCircle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface KPICardProps {
  title: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  prefix?: string;
  onChange: (val: number) => void;
  description?: string;
  commentary?: string;
  color?: string;
}

export function KPICard({
  title,
  value,
  min,
  max,
  step = 1,
  unit = '',
  prefix = '',
  onChange,
  description,
  commentary,
  color = 'blue'
}: KPICardProps) {
  const percentage = ((value - min) / (max - min)) * 100;

  const formatValue = (val: number) => {
    if (prefix === '$') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        maximumFractionDigits: 0,
        notation: val > 999999 ? 'compact' : 'standard'
      }).format(val);
    }
    if (unit === '%') {
      return `${val}%`;
    }
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(val);
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{title}</h3>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-bold text-slate-900">{formatValue(value)}</span>
            <span className="text-sm text-slate-400 font-medium">
              {unit && unit !== '%' ? unit : ''}
            </span>
          </div>
        </div>
        {description && (
          <div className="group relative">
             <Info className="w-4 h-4 text-slate-400 cursor-help" />
             <div className="absolute right-0 w-64 p-2 bg-slate-800 text-white text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none mb-2 bottom-full">
               {description}
             </div>
          </div>
        )}
      </div>

      <div className="relative h-6 flex items-center select-none touch-none">
        <Slider.Root
          className="relative flex items-center select-none touch-none w-full h-5"
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onChange(vals[0])}
        >
          <Slider.Track className="bg-slate-200 relative grow rounded-full h-[4px]">
            <Slider.Range className={twMerge("absolute bg-blue-500 rounded-full h-full", color === 'green' && "bg-emerald-500", color === 'indigo' && "bg-indigo-500", color === 'amber' && "bg-amber-500")} />
          </Slider.Track>
          <Slider.Thumb
            className={twMerge(
              "block w-5 h-5 bg-white border-2 border-blue-500 shadow-sm rounded-full hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-transform hover:scale-110",
              color === 'green' && "border-emerald-500 hover:bg-emerald-50 focus:ring-emerald-400",
              color === 'indigo' && "border-indigo-500 hover:bg-indigo-50 focus:ring-indigo-400",
              color === 'amber' && "border-amber-500 hover:bg-amber-50 focus:ring-amber-400"
            )}
            aria-label={title}
          />
        </Slider.Root>
      </div>
      
      <div className="flex justify-between text-xs text-slate-400 mt-1 font-medium">
        <span>{formatValue(min)}</span>
        <span>{formatValue(max)}</span>
      </div>

      {commentary && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex gap-2 items-start">
          <AlertCircle className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-slate-500 leading-relaxed italic">
            "{commentary}"
          </p>
        </div>
      )}
    </div>
  );
}
