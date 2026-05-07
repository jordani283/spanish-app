import { AppNav } from "@/components/app-nav";

export default function ReviewLoading() {
  return (
    <>
      <AppNav />
      <main className="page-shell mobile-bottom-safe flex-1">
        <div className="skeleton h-9 w-52" />
        <div className="mt-3 skeleton h-5 w-96 max-w-full" />

        <section className="surface-card mt-6 p-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
            <div className="skeleton h-12 w-full" />
          </div>
        </section>

        <section className="surface-card mt-6 p-6">
          <div className="skeleton h-4 w-32" />
          <div className="mt-4 skeleton h-10 w-44" />
          <div className="mt-5 skeleton h-12 w-full" />
          <div className="mt-3 skeleton h-12 w-full" />
        </section>
      </main>
    </>
  );
}
