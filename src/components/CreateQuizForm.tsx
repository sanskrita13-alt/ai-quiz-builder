"use client";

import { useState } from "react";
import { FileText, Type, UploadCloud, Loader2, BrainCircuit } from "lucide-react";

interface Question {
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  explanation: string;
}

interface CreateQuizFormProps {
  onQuizGenerated: (questions: Question[], title: string) => void;
}

export function CreateQuizForm({ onQuizGenerated }: CreateQuizFormProps) {
  const [inputType, setInputType] = useState<"topic" | "text" | "pdf">("topic");
  const [topic, setTopic] = useState("");
  const [rawText, setRawText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    setError(null);
    
    try {
      const formData = new FormData();
      formData.append("inputType", inputType);
      formData.append("questionCount", questionCount.toString());
      formData.append("difficulty", difficulty);

      if (inputType === "topic") {
        formData.append("topic", topic);
      } else if (inputType === "text") {
        formData.append("rawText", rawText);
      } else if (inputType === "pdf") {
        if (!file) {
          setError("Please select a PDF file.");
          setIsGenerating(false);
          return;
        }
        formData.append("file", file);
      }

      const response = await fetch("/api/generate-quiz", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to generate quiz");
      }

      onQuizGenerated(data.questions, data.title || "Generated Quiz");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-[#111114] rounded-2xl border border-[#1e1e26] p-6 md:p-8">
      <h2 className="text-xl font-bold text-white mb-6">Create New Quiz</h2>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Input Methods Tab */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-400">Source Material</label>
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#0a0a0f] rounded-xl border border-[#1e1e26]">
            <button
              type="button"
              onClick={() => setInputType("topic")}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                inputType === "topic"
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <Type className="w-4 h-4" /> Topic
            </button>
            <button
              type="button"
              onClick={() => setInputType("text")}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                inputType === "text"
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <FileText className="w-4 h-4" /> Text
            </button>
            <button
              type="button"
              onClick={() => setInputType("pdf")}
              className={`flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all ${
                inputType === "pdf"
                  ? "bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-indigo-300 border border-indigo-500/30 shadow-sm"
                  : "text-gray-500 hover:text-gray-300 border border-transparent"
              }`}
            >
              <UploadCloud className="w-4 h-4" /> PDF
            </button>
          </div>

          <div className="mt-4">
            {inputType === "topic" && (
              <input
                type="text"
                placeholder="e.g. World War II, React Hooks, Quantum Physics..."
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a22] border border-[#2a2a35] text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
                required
              />
            )}
            {inputType === "text" && (
              <textarea
                placeholder="Paste your study material, lecture notes, or article content here..."
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 rounded-xl bg-[#1a1a22] border border-[#2a2a35] text-white placeholder-gray-500 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all resize-none"
                required
              />
            )}
            {inputType === "pdf" && (
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer bg-[#1a1a22] hover:bg-[#1e1e28] border-[#2a2a35] hover:border-indigo-500/40 transition-all">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <UploadCloud className="w-8 h-8 text-gray-500 mb-2" />
                    <p className="text-sm text-gray-400">
                      <span className="font-semibold text-indigo-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 mt-1">PDF files only</p>
                    {file && <p className="mt-2 text-sm font-medium text-indigo-400">{file.name}</p>}
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="application/pdf"
                    onChange={(e) => setFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>
            )}
          </div>
        </div>

        {/* Settings */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-[#1e1e26]">
          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">
              Questions: <span className="font-bold text-indigo-400">{questionCount}</span>
            </label>
            <input
              type="range"
              min="1"
              max="100"
              value={questionCount}
              onChange={(e) => setQuestionCount(parseInt(e.target.value))}
              className="w-full accent-indigo-500 h-2 bg-gray-800 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-600">
              <span>1</span>
              <span>50</span>
              <span>100</span>
            </div>
            {questionCount > 20 && (
              <p className="text-xs text-amber-500 mt-2">
                Warning: Generating {questionCount} questions will take longer to process.
              </p>
            )}
          </div>

          <div className="space-y-3">
            <label className="block text-sm font-medium text-gray-400">Difficulty</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="w-full px-4 py-3 rounded-xl bg-[#1a1a22] border border-[#2a2a35] text-white focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 outline-none transition-all"
            >
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white font-medium rounded-xl transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-indigo-500/20"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <BrainCircuit className="w-5 h-5" />
              Generate Quiz
            </>
          )}
        </button>
      </form>
    </div>
  );
}
