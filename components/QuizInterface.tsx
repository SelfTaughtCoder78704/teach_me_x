'use client';

import { useState } from 'react';

interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface Module {
  id: number;
  title: string;
  content: string;
  questions: Question[];
}

export default function QuizInterface({ modules }: { modules: Module[] }) {
  const [currentModule, setCurrentModule] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  // If modules are empty, show loading state
  if (!modules || modules.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Generating your quiz content...</p>
        </div>
      </div>
    );
  }

  const currentModuleData = modules[currentModule];
  const question = currentModuleData.questions[currentQuestion];

  const handleAnswer = (index: number) => {
    setSelectedAnswer(index);
    setShowExplanation(true);
  };

  const nextQuestion = () => {
    if (currentQuestion < currentModuleData.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else if (currentModule < modules.length - 1) {
      setCurrentModule(currentModule + 1);
      setCurrentQuestion(0);
    }
    setSelectedAnswer(null);
    setShowExplanation(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow text-black">
        <h2 className="text-2xl font-bold mb-4">{currentModuleData.title}</h2>
        <div className="prose max-w-none mb-6 whitespace-pre-wrap">{currentModuleData.content}</div>
        
        <div className="space-y-4">
          <h3 className="text-xl font-semibold">{question.question}</h3>
          <div className="space-y-2">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className={`w-full p-3 text-left rounded-lg border ${
                  selectedAnswer === index
                    ? selectedAnswer === question.correctAnswer
                      ? 'bg-green-100 border-green-500'
                      : 'bg-red-100 border-red-500'
                    : 'hover:bg-gray-50'
                }`}
                disabled={showExplanation}
              >
                {option}
              </button>
            ))}
          </div>

          {showExplanation && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="font-medium">Explanation:</p>
              <p>{question.explanation}</p>
              {(currentQuestion < currentModuleData.questions.length - 1 || currentModule < modules.length - 1) && (
                <button
                  onClick={nextQuestion}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Next Question
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          Module {currentModule + 1} of {modules.length} |
          Question {currentQuestion + 1} of {currentModuleData.questions.length}
        </div>
      </div>
    </div>
  );
}
