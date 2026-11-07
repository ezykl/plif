import type { SVGProps } from "react";

export interface IconProps extends SVGProps<SVGSVGElement> {
  size?: number;
}

function baseProps(size: number, props: SVGProps<SVGSVGElement>): SVGProps<SVGSVGElement> {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.75,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": props["aria-label"] ? undefined : true,
    ...props,
  };
}

export function BookOpenIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M4 5.5c0-.8.7-1.5 1.5-1.5H11v16H5.5A1.5 1.5 0 0 1 4 18.5v-13Z" />
      <path d="M20 5.5c0-.8-.7-1.5-1.5-1.5H13v16h5.5a1.5 1.5 0 0 0 1.5-1.5v-13Z" />
      <path d="M12 4v16" />
      <path d="M7 8h2M7 11h2M15 8h2M15 11h2" />
    </svg>
  );
}

export function NewspaperSpreadIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <rect x="3.5" y="4.5" width="7.5" height="15" rx="1.2" />
      <rect x="13" y="4.5" width="7.5" height="15" rx="1.2" />
      <path d="M6.5 8.5h2.5M6.5 11.5h2.5M6.5 14.5h2.5M15 8.5h2.5M15 11.5h2.5M15 14.5h2.5" />
    </svg>
  );
}

export function HardcoverBookIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M5 5.2c0-.9.7-1.6 1.6-1.6H11v17H6.6A1.6 1.6 0 0 1 5 18.8V5.2Z" />
      <path d="M19 5.2c0-.9-.7-1.6-1.6-1.6H13v17h4.4a1.6 1.6 0 0 0 1.6-1.6V5.2Z" />
      <path d="M11 3.6h2v17h-2" />
    </svg>
  );
}

export function ZineBookletIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <rect x="6" y="4" width="12" height="16" rx="1.5" />
      <path d="M9 8h6M9 11.5h6M9 15h4" />
    </svg>
  );
}

export function UploadDocumentIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8l-5-5Z" />
      <path d="M14 3v5h5" />
      <path d="M12 17v-6M9.5 13.5 12 11l2.5 2.5" />
    </svg>
  );
}

export function SlidersStyleIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <line x1="4" y1="6" x2="20" y2="6" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="9" cy="6" r="2" fill="currentColor" />
      <circle cx="15" cy="12" r="2" fill="currentColor" />
      <circle cx="10" cy="18" r="2" fill="currentColor" />
    </svg>
  );
}

export function DownloadExportIcon({ size = 20, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M12 4v11M7.5 10.5 12 15l4.5-4.5" />
      <path d="M5 19h14" />
    </svg>
  );
}

export function ShieldPrivacyIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M12 3 5 6v6c0 5 3.4 8.3 7 9 3.6-.7 7-4 7-9V6l-7-3Z" />
      <path d="m9.5 12 1.8 1.8 3.5-3.6" />
    </svg>
  );
}

export function WifiOfflineIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <line x1="2" y1="2" x2="22" y2="22" />
      <path d="M16.7 11.1c.8.4 1.6.9 2.3 1.6" />
      <path d="M5 12.6a10 10 0 0 1 5.2-2.7" />
      <path d="M10.7 5c4-.4 8 .9 11.3 3.8" />
      <path d="M2 8.8a15 15 0 0 1 3.7-2.6" />
      <path d="M8.5 16.4a5 5 0 0 1 7 0" />
      <line x1="12" y1="20" x2="12.01" y2="20" />
    </svg>
  );
}

export function ArrowLeftIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M19 12H5M11 6l-6 6 6 6" />
    </svg>
  );
}

export function ArrowRightIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function TrashIcon({ size = 16, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

export function CodeBracketIcon({ size = 18, ...props }: IconProps) {
  return (
    <svg {...baseProps(size, props)}>
      <path d="m8 8-4 4 4 4M16 8l4 4-4 4M13.5 6l-3 12" />
    </svg>
  );
}
