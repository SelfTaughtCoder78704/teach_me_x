'use client';

import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../convex/_generated/api';
import { useRouter } from 'next/navigation';

/**
 * QuizForm component allows users to create a quiz based on a specified topic.
 * It handles form submission, loading state, and error management.
 */
export default function QuizForm() {
  // State to manage the topic input, loading status, and error messages
  const [topic, setTopic] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Mutation function to create a quiz
  const createQuiz = useMutation(api.quizzes.createQuiz);
  const router = useRouter();

  /**
   * Handles form submission, creates a quiz, and navigates to the quiz page.
   * @param e - The form event
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Creating quiz for topic:', topic);
      const quizId = await createQuiz({ topic });
      console.log('Quiz created with ID:', quizId);
      
      if (!quizId) {
        throw new Error('Failed to create quiz - no ID returned');
      }
      
      router.push(`/quiz/${quizId}`);
    } catch (err) {
      console.error('Failed to generate quiz:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate quiz. Please try again.');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Form elements for topic input and submission button */}
      <div>
        <label htmlFor="topic" className="block text-lg font-medium mb-2">
          What would you like to learn about?
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="topic"
            placeholder="Enter a topic (e.g., Photography, Classical Music, Ancient Rome)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            className="flex-1 p-3 border rounded-lg text-black"
            required
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                Generating...
              </div>
            ) : (
              'Generate Quiz'
            )}
          </button>
        </div>
      </div>
      
      {/* Loading and error messages */}
      {loading && (
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <p className="text-blue-700">
            Generating your quiz about {topic}... This might take a few moments.
          </p>
        </div>
      )}
      
      {error && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg">
          <p className="text-red-700">
            Error: {error}
          </p>
        </div>
      )}
    </form>
  );
}
