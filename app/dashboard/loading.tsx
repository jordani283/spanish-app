import { AppNav } from "@/components/app-nav";

export default function DashboardLoading() {
  return (
    <>
      <AppNav />
      <main className="page-shell mobile-bottom-safe flex-1">
        <div className="skeleton h-9 w-56" />
        <div className="mt-3 skeleton h-5 w-96 max-w-full" />

        <section className="surface-card mt-6 p-5 sm:p-6">
          <div className="skeleton h-4 w-28" />
          <div className="mt-3 skeleton h-7 w-72 max-w-full" />
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="surface-card p-5">
              <div className="skeleton h-4 w-24" />
              <div className="mt-3 skeleton h-8 w-20" />
              <div className="mt-4 skeleton h-2 w-full" />
            </article>
          ))}
        </section>
      </main>
    </>
  );
}
