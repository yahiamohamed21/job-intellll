import React from 'react';
import { cn } from '../../lib/utils';

export function ChartContainer({ config={}, className, children, ...props }){
  const style={};
  Object.entries(config).forEach(([k,v])=>{
    if(v?.color) style[`--color-${k}`]=v.color;
  });
  return (
    <div
      role="figure"
      className={cn("rounded-2xl border p-4 bg-[var(--card)] w-full h-[240px]", className)}
      style={style}
      {...props}
    >
      {children}
    </div>
  );
}

export function ChartTooltipContent({ active, payload, label }){
  if(!active || !payload || !payload.length) return null;
  return (
    <div className="rounded-lg border bg-[var(--surface)] px-3 py-2 shadow text-[13px]">
      <div className="opacity-70 mb-1">{label}</div>
      {payload.map((it,i)=>(
        <div key={i} className="font-semibold">{it.name}: {it.value}</div>
      ))}
    </div>
  );
}
