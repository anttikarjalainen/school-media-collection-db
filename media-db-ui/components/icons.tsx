import type { ReactNode, SVGProps } from "react";
import type { CollectionKey } from "@/lib/collections";

// Stroke icons in the Lucide style used by the design. Inline SVG keeps the
// bundle free of an icon dependency.

type IconProps = Omit<SVGProps<SVGSVGElement>, "children"> & { size?: number };

function createIcon(paths: ReactNode) {
  return function Icon({ size = 16, ...props }: IconProps) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className="shrink-0"
        {...props}
      >
        {paths}
      </svg>
    );
  };
}

export const DatabaseIcon = createIcon(
  <>
    <ellipse cx="12" cy="5" rx="8" ry="3" />
    <path d="M4 5v14a8 3 0 0 0 16 0V5" />
    <path d="M4 12a8 3 0 0 0 16 0" />
  </>,
);

export const BookIcon = createIcon(
  <>
    <path d="M12 7v14" />
    <path d="M3 18a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h5a4 4 0 0 1 4 4 4 4 0 0 1 4-4h5a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1h-6a3 3 0 0 0-3 3 3 3 0 0 0-3-3z" />
  </>,
);

export const FilmIcon = createIcon(
  <>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <path d="M7 3v18M17 3v18M3 12h18M3 7.5h4M3 16.5h4M17 7.5h4M17 16.5h4" />
  </>,
);

export const GamepadIcon = createIcon(
  <>
    <rect x="2" y="6" width="20" height="12" rx="4" />
    <path d="M6 12h4M8 10v4M15 13h.01M18 11h.01" />
  </>,
);

export const SearchIcon = createIcon(
  <>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </>,
);

export const PlusIcon = createIcon(<path d="M12 5v14M5 12h14" />);

export const PencilIcon = createIcon(
  <>
    <path d="M21.17 6.81a1 1 0 0 0-3.99-3.99L3.84 16.17a2 2 0 0 0-.5.83l-1.32 4.35a.5.5 0 0 0 .62.62l4.35-1.32a2 2 0 0 0 .83-.5z" />
    <path d="m15 5 4 4" />
  </>,
);

export const TrashIcon = createIcon(
  <>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </>,
);

export const ChevronLeftIcon = createIcon(<path d="m15 18-6-6 6-6" />);
export const ChevronRightIcon = createIcon(<path d="m9 18 6-6-6-6" />);
export const ArrowUpIcon = createIcon(<path d="M12 19V5M5 12l7-7 7 7" />);
export const ArrowDownIcon = createIcon(<path d="M12 5v14M19 12l-7 7-7-7" />);
export const SortIcon = createIcon(<path d="m7 15 5 5 5-5M7 9l5-5 5 5" />);

export const SunIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
  </>,
);

export const MoonIcon = createIcon(<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />);

export const XIcon = createIcon(<path d="M18 6 6 18M6 6l12 12" />);

export const AlertCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </>,
);

export const CheckCircleIcon = createIcon(
  <>
    <circle cx="12" cy="12" r="9" />
    <path d="m9 12 2 2 4-4" />
  </>,
);

export const AlertTriangleIcon = createIcon(
  <>
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
    <path d="M12 9v4M12 17h.01" />
  </>,
);

const COLLECTION_ICONS = { books: BookIcon, movies: FilmIcon, games: GamepadIcon };

export function CollectionIcon({ collection, ...props }: IconProps & { collection: CollectionKey }) {
  const Icon = COLLECTION_ICONS[collection];
  return <Icon {...props} />;
}
