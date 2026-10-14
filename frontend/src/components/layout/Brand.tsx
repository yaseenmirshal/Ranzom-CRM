import Link from "next/link";

type BrandProps = {
  onClick?: () => void;
};

export default function Brand({ onClick }: BrandProps) {
  return (
    <Link
      aria-label="RanzomTech CRM home"
      className="brand-lockup"
      href="/dashboard"
      onClick={onClick}
    >
      <span aria-hidden="true" className="brand-mark">
        <svg fill="none" viewBox="0 0 32 32">
          <path
            d="M8 23.5V8.5h7.4c4 0 6.2 1.8 6.2 5 0 2.5-1.4 4.1-4 4.7l5.1 5.3h-5.2l-4.6-5h-.5v5H8Zm4.4-8.6h2.8c1.4 0 2.1-.5 2.1-1.5s-.7-1.5-2.1-1.5h-2.8v3Z"
            fill="currentColor"
          />
          <path d="M22.5 6.5h3v3h-3z" fill="currentColor" opacity=".55" />
        </svg>
      </span>
      <span className="brand-copy">
        <span className="brand-name">RanzomTech</span>
        <span className="brand-product">CRM</span>
      </span>
    </Link>
  );
}
