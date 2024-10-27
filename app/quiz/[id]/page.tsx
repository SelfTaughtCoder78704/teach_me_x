'use client';

import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import QuizInterface from '../../../components/QuizInterface';
import { Id } from '../../../convex/_generated/dataModel';
import { use } from 'react';
import { useRouter } from 'next/navigation';

export default function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const router = useRouter();
  const id = resolvedParams.id as Id<"quizzes">;
  const quiz = useQuery(api.quizzes.getQuiz, { id });

  if (!quiz) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Loading quiz...</p>
        </div>
      </div>
    );
  }

  if (quiz.status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Generating Quiz</h2>
          <p className="mb-4 text-lg">Sorry, there was an error generating your quiz. Please try again.</p>
          <button
            onClick={() => router.push('/')}
            className="px-8 py-4 bg-blue-600 text-black rounded-lg hover:bg-blue-700 transition duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (quiz.status === "generating") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg">Generating your quiz about {quiz.topic}...</p>
          <p className="text-sm text-gray-700 mt-2">This may take a few moments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Quiz: {quiz.topic}</h1>
        <QuizInterface modules={quiz.modules} />
      </div>
    </div>
  );
}
