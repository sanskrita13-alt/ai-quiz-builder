"use client";

import { useState } from "react";
import { Navbar } from "./Navbar";
import { CreateQuizForm } from "./CreateQuizForm";
import { QuizDisplay } from "./QuizDisplay";

interface Question {
  questionText: string;
  answerA: string;
  answerB: string;
  answerC: string;
  answerD: string;
  correctAnswer: string;
  explanation: string;
}

export function Dashboard() {
  const [quizQuestions, setQuizQuestions] = useState<Question[] | null>(null);
  const [quizTitle, setQuizTitle] = useState("");

  const handleQuizGenerated = (questions: Question[], title: string) => {
    setQuizQuestions(questions);
    setQuizTitle(title);
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col">
      <Navbar />
      
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Panel — Input */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                Generate Quizzes{" "}
                <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  in Seconds
                </span>
              </h1>
              <p className="mt-3 text-base text-gray-400 leading-relaxed">
                Transform any topic, text snippet, or PDF document into a comprehensive Multiple Choice Quiz using AI.
              </p>
            </div>
            <CreateQuizForm onQuizGenerated={handleQuizGenerated} />
          </div>

          {/* Right Panel — Output */}
          <div className="lg:col-span-7">
            {quizQuestions && quizQuestions.length > 0 ? (
              <QuizDisplay questions={quizQuestions} title={quizTitle} />
            ) : (
              <div className="bg-[#111114] rounded-2xl border border-[#1e1e26] p-8 h-full min-h-[500px] flex flex-col items-center justify-center text-center">
                <div className="w-20 h-20 bg-[#1a1a22] rounded-2xl flex items-center justify-center mb-5 border border-[#2a2a35]">
                  <svg className="w-10 h-10 text-indigo-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white">No Quiz Generated Yet</h3>
                <p className="mt-2 text-sm text-gray-500 max-w-xs leading-relaxed">
                  Use the form on the left to input your material, choose settings, and hit generate. Your quiz will appear here.
                </p>
              </div>
            )}
          </div>
          
        </div>
      </main>
    </div>
  );
}
