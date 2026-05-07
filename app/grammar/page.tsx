import { AppNav } from "@/components/app-nav";
import { GrammarTrainer } from "@/components/grammar-trainer";
import { getGrammarPrompts } from "@/lib/data";

export default async function GrammarPage() {
  const prompts = await getGrammarPrompts();

  return (
    <>
      <AppNav />
      <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-8">
        <h1 className="text-2xl font-semibold text-zinc-900">Grammar practice</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Typed answers first. After repeated mistakes, hints appear so you can correct the pattern.
        </p>
        <div className="mt-6">
          <GrammarTrainer prompts={prompts} />
        </div>
      </main>
    </>
  );
}
