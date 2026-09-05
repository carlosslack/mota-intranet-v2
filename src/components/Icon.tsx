import { cn } from '@/lib/cn';
export function Icon({ name, size = 20, className, style }: { name: string; size?: number; className?: string; style?: React.CSSProperties }) {
  return (
    <span className={cn('material-symbols-outlined leading-none', className)} style={{ fontSize: size, ...style }}>
      {name}
    </span>
  );
}
