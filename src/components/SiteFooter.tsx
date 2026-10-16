import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <p style={{ margin: 0 }}>SAHAJA YOGA: an independent project, not an official Sahaja Yoga website. Meditation is always free.</p>
      <ul>
        <li><Link href="/library">About &amp; sources</Link></li>
        <li><Link href="/settings">Privacy</Link></li>
        <li><Link href="/settings#accessibility">Accessibility</Link></li>
      </ul>
    </footer>
  );
}
