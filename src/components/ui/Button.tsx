import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';
import { cn } from '@/utils';

type Variant = 'go' | 'brand' | 'ink' | 'outline' | 'ghost' | 'glass' | 'white' | 'danger' | 'soft';
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'icon';

const base =
  'group/btn relative inline-flex items-center justify-center gap-2 overflow-hidden font-semibold whitespace-nowrap transition-all duration-300 ease-out-expo select-none disabled:pointer-events-none disabled:opacity-55 active:scale-[0.97] focus-visible:outline-offset-4';

const variants: Record<Variant, string> = {
  go: 'bg-go-sheen text-white shadow-glow-go hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-10px_rgb(255_106_19/0.7)]',
  brand: 'bg-brand-sheen text-white shadow-glow-brand hover:-translate-y-0.5 hover:brightness-110',
  ink: 'bg-ink-900 text-white hover:bg-ink-800 hover:-translate-y-0.5 shadow-soft',
  outline: 'border border-line-strong bg-white text-text hover:border-brand-400 hover:text-brand-700 hover:bg-brand-50/50',
  ghost: 'text-text-2 hover:bg-surface-2 hover:text-text',
  glass: 'border border-white/20 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:-translate-y-0.5',
  white: 'bg-white text-ink-900 shadow-soft hover:-translate-y-0.5 hover:shadow-lift',
  danger: 'bg-crit text-white hover:brightness-110',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 rounded-xl px-3.5 text-sm',
  md: 'h-11 rounded-xl px-5 text-[15px]',
  lg: 'h-13 rounded-2xl px-6 text-base',
  xl: 'h-15 rounded-2xl px-8 text-lg',
  icon: 'size-10 rounded-xl',
};

interface CommonProps {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  className?: string;
  children?: ReactNode;
  block?: boolean;
}

const Shine = () => (
  <span aria-hidden className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-700 group-hover/btn:translate-x-full" />
);

const Inner = ({ loading, iconLeft, iconRight, children }: CommonProps) => (
  <>
    <Shine />
    {loading ? <LoaderCircle className="size-4 animate-spin" aria-hidden /> : iconLeft}
    <span className="relative">{children}</span>
    {!loading && iconRight && <span className="relative transition-transform duration-300 group-hover/btn:translate-x-0.5">{iconRight}</span>}
  </>
);

export const Button = forwardRef<HTMLButtonElement, CommonProps & ButtonHTMLAttributes<HTMLButtonElement>>(function Button(
  { variant = 'go', size = 'md', loading, iconLeft, iconRight, className, children, block, disabled, type = 'button', ...rest },
  ref,
) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} aria-busy={loading || undefined} className={cn(base, variants[variant], sizes[size], block && 'w-full', className)} {...rest}>
      <Inner loading={loading} iconLeft={iconLeft} iconRight={iconRight}>{children}</Inner>
    </button>
  );
});

export function ButtonLink({ variant = 'go', size = 'md', iconLeft, iconRight, className, children, block, ...rest }: CommonProps & LinkProps) {
  return (
    <Link className={cn(base, variants[variant], sizes[size], block && 'w-full', className)} {...rest}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>{children}</Inner>
    </Link>
  );
}

export function ExternalButton({ variant = 'go', size = 'md', iconLeft, iconRight, className, children, block, ...rest }: CommonProps & React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a className={cn(base, variants[variant], sizes[size], block && 'w-full', className)} {...rest}>
      <Inner iconLeft={iconLeft} iconRight={iconRight}>{children}</Inner>
    </a>
  );
}
