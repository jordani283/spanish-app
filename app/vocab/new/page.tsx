import { AppNav } from "@/components/app-nav";
import { VocabForm } from "@/components/vocab-form";

export default function NewVocabPage() {
  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Add vocabulary</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Add words you do not know yet. They are automatically available for date-range review sessions.
        </p>
        <div className="mt-6">
          <VocabForm />
        </div>
      </main>
    </>
  );
}
