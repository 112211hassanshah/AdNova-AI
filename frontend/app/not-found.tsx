import Link from "next/link";
export default function NotFound() {
  return (
    <main className="not-found">
      <h1>That page isn’t here.</h1>
      <p>Return to your advertising workspace.</p>
      <Link className="button primary" href="/">
        Open overview
      </Link>
    </main>
  );
}
