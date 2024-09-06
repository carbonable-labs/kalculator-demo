import { cn } from "@nextui-org/react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    className?: string;
    isLoading?: boolean;
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
}

const greenButton = 'font-inter uppercase rounded-lg px-4 py-2 text-sm text-neutal-500 border border-neutral-500 tracking-wide bg-greenish-500 hover:brightness-110';
const disabledGreenButton = 'font-inter uppercase rounded-lg px-4 py-2 text-sm text-neutal-500 border border-neutral-500 tracking-wide bg-greenish-500 opacity-50 cursor-not-allowed';

export function GreenButton({ children, className, onClick, disabled, isLoading }: ButtonProps) {
  if (isLoading) {
    return <button disabled={true} className={cn(disabledGreenButton, className)}>Calculating...</button>
  }
  return <button disabled={disabled} className={cn(greenButton, className)} onClick={onClick}>{children}</button>;
}