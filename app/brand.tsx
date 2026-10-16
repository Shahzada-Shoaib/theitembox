import type { ReactNode } from "react";

export function Brand({ compact = false }: { compact?: boolean }) {
  return <span className="brand inline-flex w-[100px] flex-col gap-[5px] max-[600px]:w-[82px]">
    <svg className="block h-auto w-full" viewBox="0 0 146 46" fill="none" aria-hidden="true"><path d="M9 4H63L53 15H37V42H22V15H0L9 4Z" fill="currentColor" /><path d="M67 4H80V42H67V4Z" fill="#B7FF00" /><path fillRule="evenodd" d="M87 4H130L142 15V21L137 25L145 31V35L136 42H87V4ZM101 14V20H126V14H101ZM101 27V33H126V27H101Z" fill="currentColor" /></svg>
    {!compact && <span className="whitespace-nowrap text-[8px] tracking-[3.05px] max-[600px]:text-[6.5px] max-[600px]:tracking-[2.5px]">THE ITEM BOX</span>}
  </span>;
}

export function Icon({ name, className = "" }: { name: "arrow" | "bag" | "search" | "close" | "plus" | "minus" | "play" | "pause" | "expand" | "down" | "check" | "menu"; className?: string }) {
  const paths: Record<typeof name, ReactNode> = {
    arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
    bag: <><path d="M5 7h14l1 14H4L5 7Z" /><path d="M8 8V6a4 4 0 0 1 8 0v2" /></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5" /><path d="m16 16 5 5" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    plus: <path d="M12 5v14M5 12h14" />,
    minus: <path d="M5 12h14" />,
    play: <path d="m8 5 11 7-11 7V5Z" fill="currentColor" strokeWidth="0" />,
    pause: <path d="M8 5v14M16 5v14" strokeWidth="3" />,
    expand: <path d="M9 4H4v5m11-5h5v5M4 15v5h5m11-5v5h-5" />,
    down: <path d="M12 4v16m-6-6 6 6 6-6" />,
    check: <path d="m5 12 4 4L19 6" />,
    menu: <path d="M4 8h16M4 16h16" />,
  };
  return <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}
