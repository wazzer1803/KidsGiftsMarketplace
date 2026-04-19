import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl items-center justify-center px-6 py-24">
      <div className="soft-card rounded-3xl p-8 text-center md:p-12">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight sm:text-5xl">Page not found</h1>
        <p className="mt-3 text-on-surface-variant">The page may have moved. Go back to the main marketplace.</p>
        <Link href="/" className="btn-primary mt-6">
          Back to Home
        </Link>
      </div>
    </main>
  );
}
