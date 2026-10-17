import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./brand";

export const primaryButtonClass = "inline-flex min-h-[51px] items-center justify-between gap-8 bg-[#b7ff00] px-[21px] py-[17px] text-xs font-semibold text-[#111] transition duration-200 hover:-translate-y-0.5 hover:bg-[#cbff48] max-[600px]:min-h-12 max-[600px]:gap-[21px] max-[600px]:px-4 max-[600px]:py-3.5 max-[600px]:text-xs [&>svg]:size-[19px]";

export function PrimaryButton({ className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  return <button type={type} className={`${primaryButtonClass} ${className}`} {...props} />;
}

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  label: string;
  icon: Parameters<typeof Icon>[0]["name"];
  children?: ReactNode;
};

export function IconButton({ label, icon, className = "", children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      className={`inline-flex size-9 shrink-0 items-center justify-center transition-colors duration-200 hover:text-[#b7ff00] max-[600px]:size-11 ${className}`}
      {...props}
    >
      <Icon name={icon} />
      {children}
    </button>
  );
}
