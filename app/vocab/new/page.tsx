import { AppNav } from "@/components/app-nav";
import { VocabForm } from "@/components/vocab-form";

export default function NewVocabPage() {
  return (
    <>
      <AppNav />
      <main className="page-shell mobile-bottom-safe flex-1">
        <h1 className="section-title">Add vocabulary</h1>
        <p className="section-subtitle">
          Add words you do not know yet. They are automatically available for date-range review sessions.
        </p>
        <div className="mt-6">
          <VocabForm />
        </div>
      </main>
    </>
  );
}
