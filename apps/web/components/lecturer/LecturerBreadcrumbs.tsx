import Link from 'next/link';
import './LecturerBreadcrumbs.css';

interface LecturerBreadcrumbItem {
  label: string;
  href?: string;
}

interface LecturerBreadcrumbsProps {
  items: LecturerBreadcrumbItem[];
}

export function LecturerBreadcrumbs({ items }: LecturerBreadcrumbsProps) {
  return (
    <nav className="breadcrumbs">
      {items.map((item, index) => {
        const isLastItem = index === items.length - 1;

        return (
          <div key={`${item.label}-${index}`} className="breadcrumb-item">
            {item.href && !isLastItem ? (
              <Link href={item.href} className="breadcrumb-link">
                {item.label}
              </Link>
            ) : (
              <span className={isLastItem ? "breadcrumb-current" : ""}>
                {item.label}
              </span>
            )}

            {!isLastItem ? <BreadcrumbChevronIcon /> : null}
          </div>
        );
      })}
    </nav>
  );
}

function BreadcrumbChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M5 3.5 8.5 7 5 10.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
