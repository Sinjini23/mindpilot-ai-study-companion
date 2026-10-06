import {
  BookOpen,
  Brain,
  CheckCircle2,
  FileText,
  Sparkles,
} from "lucide-react";

interface AnalysisProps {
  fileName: string;
}

function Analysis({ fileName }: AnalysisProps) {
  return (
    <div className="min-h-screen bg-[#070b14] text-white">
      <header className="border-b border-white/10 bg-[#070b14]/80">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-600">
            <Brain size={22} />
          </div>

          <div>
            <h1 className="text-lg font-semibold">
              MindPilot
            </h1>

            <p className="text-xs text-gray-500">
              AI Study Analysis
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10">
        {/* File */}
        <div className="flex items-center gap-3">
          <FileText className="text-violet-400" />

          <div>
            <p className="text-sm text-gray-400">
              Studying
            </p>

            <h2 className="font-semibold">
              {fileName}
            </h2>
          </div>
        </div>

        {/* Title */}
        <div className="mt-10">
          <div className="flex items-center gap-2 text-violet-400">
            <Sparkles size={18} />

            <span className="text-sm font-medium">
              AI Analysis
            </span>
          </div>

          <h2 className="mt-3 text-3xl font-bold">
            Your study material, simplified.
          </h2>

          <p className="mt-2 text-gray-500">
            AI-generated insights from your document.
          </p>
        </div>

        {/* Summary */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
              <BookOpen size={20} />
            </div>

            <h3 className="text-lg font-semibold">
              Summary
            </h3>
          </div>

          <p className="mt-5 leading-7 text-gray-400">
            Your AI-generated summary will appear here.
            Once we connect the AI model, this section will
            automatically explain the important concepts from
            your uploaded study material.
          </p>
        </section>

        {/* Key Concepts */}
        <section className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-6">
          <h3 className="text-lg font-semibold">
            Key Concepts
          </h3>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              "Important concept 1",
              "Important concept 2",
              "Important concept 3",
              "Important concept 4",
            ].map((concept) => (
              <div
                key={concept}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4"
              >
                <CheckCircle2
                  size={18}
                  className="text-emerald-400"
                />

                <span className="text-sm text-gray-300">
                  {concept}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Coming soon */}
        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Feature
            icon={<Brain size={21} />}
            title="Flashcards"
            description="AI-generated flashcards from your study material."
          />

          <Feature
            icon={<Sparkles size={21} />}
            title="AI Quiz"
            description="Test your understanding with generated questions."
          />
        </div>
      </main>
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
        {icon}
      </div>

      <h3 className="mt-4 font-semibold">
        {title}
      </h3>

      <p className="mt-2 text-sm leading-6 text-gray-500">
        {description}
      </p>
    </div>
  );
}

export default Analysis;