import { useState } from "react";
import axios from "axios";
import {
  Brain,
  FileText,
  Sparkles,
  BookOpen,
  Layers3,
  ClipboardCheck,
  Upload,
  ArrowRight,
  Loader2,
  RotateCcw,
  CheckCircle2,
  XCircle,
} from "lucide-react";
const API_URL = import.meta.env.VITE_API_URL;

type Flashcard = {
  question: string;
  answer: string;
};

type QuizQuestion = {
  question: string;
  options: string[];
  answer: string;
  explanation: string;
};

type Analysis = {
  summary: string;
  keyConcepts: string[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
};

function App() {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [error, setError] = useState("");

  // Original PDF text
  const [studyText, setStudyText] = useState("");

  // Quiz
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Flashcards
  const [flippedCard, setFlippedCard] = useState<number | null>(null);

  // Ask MindPilot
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [asking, setAsking] = useState(false);

  // ================= FILE UPLOAD =================

  const handleFileChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const selectedFile = event.target.files?.[0];

    if (!selectedFile) return;

    if (selectedFile.type !== "application/pdf") {
      setError("Please upload a PDF file.");
      setFile(null);
      return;
    }

    setError("");
    setFile(selectedFile);
    setAnalysis(null);
    setStudyText("");

    // Reset quiz
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);

    // Reset flashcards
    setFlippedCard(null);

    // Reset Ask MindPilot
    setQuestion("");
    setAnswer("");
  };

  // ================= PDF + AI ANALYSIS =================

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a PDF first.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      console.log("Uploading PDF...");

      const formData = new FormData();
      formData.append("pdf", file);

      // Upload PDF
      const uploadResponse = await axios.post(
        `${API_URL}/api/upload`,
        formData
      );

      const extractedText = uploadResponse.data.text;

      console.log("Extracted text:", extractedText);

      // Store original PDF text
      setStudyText(extractedText);

      // Send extracted text to Gemini
      console.log("Sending extracted text to Gemini...");

      const analysisResponse = await axios.post(
        `${API_URL}/api/analyze`,
        {
          text: extractedText,
        }
      );

      console.log("AI ANALYSIS:", analysisResponse.data);

      setAnalysis(analysisResponse.data.analysis);

      // Reset quiz
      setCurrentQuestion(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizFinished(false);

      // Reset flashcards
      setFlippedCard(null);

      // Reset Ask MindPilot
      setQuestion("");
      setAnswer("");

    } catch (error) {
      console.error("Analysis failed:", error);

      if (axios.isAxiosError(error)) {
        console.error(
          "Backend response:",
          error.response?.data
        );

        setError(
          error.response?.data?.message ||
            "Something went wrong while analyzing the PDF."
        );
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  // ================= QUIZ =================

  const handleAnswer = (selected: string) => {
    if (selectedAnswer !== null || !analysis) return;

    setSelectedAnswer(selected);

    const currentQuiz = analysis.quiz[currentQuestion];

    if (selected === currentQuiz.answer) {
      setScore((previous) => previous + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!analysis) return;

    if (currentQuestion < analysis.quiz.length - 1) {
      setCurrentQuestion((previous) => previous + 1);
      setSelectedAnswer(null);
    } else {
      setQuizFinished(true);
    }
  };

  const restartQuiz = () => {
    setCurrentQuestion(0);
    setSelectedAnswer(null);
    setScore(0);
    setQuizFinished(false);
  };

  // ================= ASK MINDPILOT =================

  const handleAsk = async () => {
    if (!question.trim() || !studyText) return;

    try {
      setAsking(true);
      setAnswer("");

      console.log("Asking MindPilot:", question);

     const response = await axios.post(
  `${API_URL}/api/ask`,
  {
    question: question.trim(),
  }
);

      console.log("MindPilot answer:", response.data);

      setAnswer(response.data.answer);
    } catch (error) {
      console.error("Ask MindPilot error:", error);

      if (axios.isAxiosError(error)) {
        setAnswer(
          error.response?.data?.message ||
            "Sorry, I couldn't answer that question."
        );
      } else {
        setAnswer(
          "Sorry, I couldn't answer that question. Please try again."
        );
      }
    } finally {
      setAsking(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-gray-100">

      {/* ================= NAVBAR ================= */}

      <nav className="border-b border-white/10 bg-[#070b14]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-cyan-400 shadow-lg shadow-violet-500/20">
              <Brain size={22} />
            </div>

            <div>
              <h1 className="text-xl font-bold tracking-tight">
                MindPilot
              </h1>

              <p className="text-xs text-gray-400">
                Your AI study companion
              </p>
            </div>

          </div>

          <div className="hidden items-center gap-6 text-sm text-gray-400 sm:flex">
            <span>Smart Summary</span>
            <span>Flashcards</span>
            <span>AI Quiz</span>
          </div>

        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6">

        {/* ================= HERO ================= */}

        <section className="pb-16 pt-20 text-center">

          <div className="mx-auto mb-6 flex w-fit items-center gap-2 rounded-full border border-violet-400/20 bg-violet-500/10 px-4 py-2 text-sm text-violet-300">
            <Sparkles size={16} />
            Powered by Generative AI
          </div>

          <h2 className="mx-auto max-w-4xl text-4xl font-bold leading-tight tracking-tight sm:text-6xl">

            Make your study material

            <span className="block bg-gradient-to-r from-violet-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              work smarter for you.
            </span>

          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-gray-400 sm:text-lg">
            Upload your study material and let MindPilot transform
            it into summaries, key concepts, flashcards, and
            interactive quizzes.
          </p>

        </section>

        {/* ================= UPLOAD ================= */}

        <section className="mx-auto max-w-3xl">

          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl shadow-violet-950/20 backdrop-blur">

            <div className="mb-8 text-center">

              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-violet-400">
                <FileText size={28} />
              </div>

              <h3 className="text-xl font-semibold">
                Upload your study material
              </h3>

              <p className="mt-2 text-sm text-gray-400">
                Start with a PDF and let AI do the heavy lifting.
              </p>

            </div>

            <label
              htmlFor="pdf-upload"
              className="group flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-black/20 px-6 py-12 transition hover:border-violet-400/50 hover:bg-violet-500/[0.04]"
            >

              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white/5 text-gray-400 transition group-hover:text-violet-400">
                <Upload size={24} />
              </div>

              <p className="font-medium">
                Click to upload your PDF
              </p>

              <p className="mt-2 text-sm text-gray-500">
                PDF files only
              </p>

              <input
                id="pdf-upload"
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />

            </label>

            {/* Selected file */}

            {file && (
              <div className="mt-5 flex items-center justify-between rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">

                <div className="flex min-w-0 items-center gap-3">

                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400">
                    <FileText size={20} />
                  </div>

                  <div className="min-w-0">

                    <p className="truncate text-sm font-medium">
                      {file.name}
                    </p>

                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>

                  </div>

                </div>

                <span className="ml-4 shrink-0 text-xs text-emerald-400">
                  Ready
                </span>

              </div>
            )}

            {/* Error */}

            {error && (
              <div className="mt-4 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            {/* Start Learning */}

            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-4 font-semibold shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {loading ? (
                <>
                  <Loader2
                    size={20}
                    className="animate-spin"
                  />

                  Analyzing your material...
                </>
              ) : (
                <>
                  <Sparkles size={20} />

                  Start Learning

                  <ArrowRight size={18} />
                </>
              )}

            </button>

            {loading && (
              <p className="mt-4 text-center text-xs text-gray-500">
                MindPilot is reading your material and generating
                your personalized study guide.
              </p>
            )}

          </div>

        </section>

        {/* ================= AI RESULTS ================= */}

        {analysis && (
          <section className="mx-auto max-w-5xl pb-20 pt-16">

            {/* Header */}

            <div className="mb-10 text-center">

              <div className="mx-auto mb-4 flex w-fit items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-300">
                <Sparkles size={16} />
                AI Analysis Complete
              </div>

              <h2 className="text-3xl font-bold">
                Your personalized study guide
              </h2>

              <p className="mt-3 text-gray-400">
                MindPilot has analyzed your study material.
              </p>

            </div>

            {/* ================= SUMMARY ================= */}

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-4 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <BookOpen size={20} />
                </div>

                <h3 className="text-lg font-semibold">
                  Smart Summary
                </h3>

              </div>

              <p className="leading-7 text-gray-300">
                {analysis.summary}
              </p>

            </div>

            {/* ================= KEY CONCEPTS ================= */}

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Layers3 size={20} />
                </div>

                <h3 className="text-lg font-semibold">
                  Key Concepts
                </h3>

              </div>

              <div className="grid gap-3 sm:grid-cols-2">

                {analysis.keyConcepts?.map(
                  (concept, index) => (
                    <div
                      key={index}
                      className="rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-gray-300"
                    >

                      <span className="mr-2 text-violet-400">
                        {index + 1}.
                      </span>

                      {concept}

                    </div>
                  )
                )}

              </div>

            </div>

            {/* ================= FLASHCARDS ================= */}

            <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-5 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                  <Layers3 size={20} />
                </div>

                <div>
                  <h3 className="text-lg font-semibold">
                    AI Flashcards
                  </h3>

                  <p className="text-xs text-gray-500">
                    Click a card to reveal the answer
                  </p>
                </div>

              </div>

              <div className="grid gap-4 md:grid-cols-2">

                {analysis.flashcards?.map(
                  (card, index) => {

                    const isFlipped =
                      flippedCard === index;

                    return (
                      <button
                        key={index}
                        onClick={() =>
                          setFlippedCard(
                            isFlipped ? null : index
                          )
                        }
                        className="min-h-[170px] rounded-xl border border-white/10 bg-black/20 p-5 text-left transition hover:border-violet-400/40 hover:bg-violet-500/[0.04]"
                      >

                        <div className="mb-4 flex items-center justify-between">

                          <span className="text-xs font-semibold uppercase tracking-wider text-violet-400">
                            {isFlipped
                              ? "Answer"
                              : `Card ${index + 1}`}
                          </span>

                          <RotateCcw
                            size={15}
                            className="text-gray-600"
                          />

                        </div>

                        <p className="leading-7 text-gray-300">
                          {isFlipped
                            ? card.answer
                            : card.question}
                        </p>

                        {!isFlipped && (
                          <p className="mt-5 text-xs text-gray-600">
                            Click to flip
                          </p>
                        )}

                      </button>
                    );
                  }
                )}

              </div>

            </div>

            {/* ================= QUIZ ================= */}

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6 flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                    <ClipboardCheck size={20} />
                  </div>

                  <div>

                    <h3 className="text-lg font-semibold">
                      AI Quiz
                    </h3>

                    <p className="text-xs text-gray-500">
                      Test your understanding
                    </p>

                  </div>

                </div>

                {!quizFinished && (
                  <span className="text-sm text-gray-500">
                    {currentQuestion + 1} /{" "}
                    {analysis.quiz.length}
                  </span>
                )}

              </div>

              {quizFinished ? (
                <div className="py-10 text-center">

                  <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400">
                    <CheckCircle2 size={32} />
                  </div>

                  <h3 className="text-2xl font-bold">
                    Quiz Complete! 🎉
                  </h3>

                  <p className="mt-3 text-gray-400">
                    You scored
                  </p>

                  <div className="my-4 text-5xl font-bold text-violet-400">
                    {score} / {analysis.quiz.length}
                  </div>

                  <p className="text-gray-400">
                    {Math.round(
                      (score / analysis.quiz.length) * 100
                    )}
                    % correct
                  </p>

                  <button
                    onClick={restartQuiz}
                    className="mx-auto mt-7 flex items-center gap-2 rounded-xl bg-violet-600 px-6 py-3 font-medium transition hover:bg-violet-500"
                  >
                    <RotateCcw size={18} />
                    Try Again
                  </button>

                </div>
              ) : (
                <>
                  {analysis.quiz.length > 0 && (
                    <div>

                      <div className="mb-7 h-1.5 overflow-hidden rounded-full bg-white/5">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 transition-all"
                          style={{
                            width: `${
                              ((currentQuestion + 1) /
                                analysis.quiz.length) *
                              100
                            }%`,
                          }}
                        />

                      </div>

                      <p className="mb-6 text-lg font-semibold leading-7">
                        {analysis.quiz[currentQuestion].question}
                      </p>

                      <div className="space-y-3">

                        {analysis.quiz[
                          currentQuestion
                        ].options.map(
                          (option, index) => {

                            const quizQuestion =
                              analysis.quiz[
                                currentQuestion
                              ];

                            const isSelected =
                              selectedAnswer === option;

                            const isCorrect =
                              option ===
                              quizQuestion.answer;

                            let optionStyle =
                              "border-white/10 bg-black/20 hover:border-violet-400/40";

                            if (selectedAnswer) {

                              if (isCorrect) {
                                optionStyle =
                                  "border-emerald-400/40 bg-emerald-500/10";
                              } else if (isSelected) {
                                optionStyle =
                                  "border-red-400/40 bg-red-500/10";
                              }

                            }

                            return (
                              <button
                                key={index}
                                onClick={() =>
                                  handleAnswer(option)
                                }
                                disabled={
                                  selectedAnswer !== null
                                }
                                className={`flex w-full items-center justify-between rounded-xl border p-4 text-left transition ${optionStyle}`}
                              >

                                <div className="flex items-center gap-3">

                                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-sm text-violet-400">
                                    {String.fromCharCode(
                                      65 + index
                                    )}
                                  </span>

                                  <span className="text-sm text-gray-300">
                                    {option}
                                  </span>

                                </div>

                                {selectedAnswer &&
                                  isCorrect && (
                                    <CheckCircle2
                                      size={19}
                                      className="text-emerald-400"
                                    />
                                  )}

                                {selectedAnswer &&
                                  isSelected &&
                                  !isCorrect && (
                                    <XCircle
                                      size={19}
                                      className="text-red-400"
                                    />
                                  )}

                              </button>
                            );
                          }
                        )}

                      </div>

                      {selectedAnswer && (
                        <div className="mt-5 rounded-xl border border-violet-400/20 bg-violet-500/5 p-4">

                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-violet-400">
                            Explanation
                          </p>

                          <p className="text-sm leading-6 text-gray-400">
                            {
                              analysis.quiz[
                                currentQuestion
                              ].explanation
                            }
                          </p>

                        </div>
                      )}

                      {selectedAnswer && (
                        <button
                          onClick={handleNextQuestion}
                          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3.5 font-semibold transition hover:from-violet-500 hover:to-purple-500"
                        >

                          {currentQuestion ===
                          analysis.quiz.length - 1
                            ? "Finish Quiz"
                            : "Next Question"}

                          <ArrowRight size={18} />

                        </button>
                      )}

                    </div>
                  )}
                </>
              )}

            </div>

            {/* ================= ASK MINDPILOT ================= */}

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-6">

              <div className="mb-6 flex items-center gap-3">

                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                  <Sparkles size={20} />
                </div>

                <div>

                  <h3 className="text-lg font-semibold">
                    Ask MindPilot
                  </h3>

                  <p className="text-xs text-gray-500">
                    Ask anything about your uploaded study material
                  </p>

                </div>

              </div>

              <div className="flex flex-col gap-3 sm:flex-row">

                <input
                  type="text"
                  value={question}
                  onChange={(event) =>
                    setQuestion(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      handleAsk();
                    }
                  }}
                  placeholder="e.g. What is useEffect used for?"
                  className="flex-1 rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-gray-200 outline-none placeholder:text-gray-600 focus:border-violet-400/50"
                />

                <button
                  onClick={handleAsk}
                 disabled={
  !question.trim() ||
  asking
}
                  className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 px-6 py-3 font-semibold transition hover:from-violet-500 hover:to-purple-500 disabled:cursor-not-allowed disabled:opacity-50"
                >

                  {asking ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Thinking...
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} />
                      Ask
                    </>
                  )}

                </button>

              </div>

              {answer && (
                <div className="mt-6 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-5">

                  <div className="mb-3 flex items-center gap-2">

                    <Brain
                      size={18}
                      className="text-cyan-400"
                    />

                    <span className="text-sm font-semibold text-cyan-300">
                      MindPilot
                    </span>

                  </div>

                  <p className="text-sm leading-7 text-gray-300">
                    {answer}
                  </p>

                </div>
              )}

            </div>

          </section>
        )}

        {/* ================= FEATURES ================= */}

        {!analysis && (
          <section className="mx-auto grid max-w-5xl gap-5 pb-20 pt-16 md:grid-cols-3">

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/20">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                <BookOpen size={22} />
              </div>

              <h3 className="mb-2 font-semibold">
                Smart Summary
              </h3>

              <p className="text-sm leading-6 text-gray-400">
                Turn long study material into concise,
                easy-to-understand summaries.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/20">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400">
                <Layers3 size={22} />
              </div>

              <h3 className="mb-2 font-semibold">
                AI Flashcards
              </h3>

              <p className="text-sm leading-6 text-gray-400">
                Automatically create useful question-and-answer
                cards for faster revision.
              </p>

            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 transition hover:-translate-y-1 hover:border-violet-400/20">

              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400">
                <ClipboardCheck size={22} />
              </div>

              <h3 className="mb-2 font-semibold">
                AI Quiz
              </h3>

              <p className="text-sm leading-6 text-gray-400">
                Test your understanding with AI-generated
                multiple-choice questions.
              </p>

            </div>

          </section>
        )}

      </main>

      {/* ================= FOOTER ================= */}

      <footer className="border-t border-white/10 px-6 py-8 text-center">

        <p className="text-sm text-gray-500">
          MindPilot · Learn smarter with Gen-AI
        </p>

      </footer>

    </div>
  );
}

export default App;