import { AppNav } from "@/components/app-nav";
import { GrammarTrainer } from "@/components/grammar-trainer";
import { getGrammarPrompts } from "@/lib/data";

export default async function GrammarPage() {
  const prompts = await getGrammarPrompts();

  return (
    <>
      <AppNav />
      <main className="page-shell mobile-bottom-safe flex-1">
        <h1 className="section-title">Grammar practice</h1>
        <p className="section-subtitle">
          Typed answers first. After repeated mistakes, hints appear so you can correct the pattern.
        </p>
        <div className="mt-6">
          <GrammarTrainer prompts={prompts} />
        </div>
      </main>
    </>
  );
}
