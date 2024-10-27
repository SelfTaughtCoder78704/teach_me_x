import QuizForm from '@/components/QuizForm';

export default function Home() {
  return (
    <main className="min-h-screen p-8 flex items-center justify-center">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Interactive Learning Quiz Generator</h1>
        <QuizForm />
      </div>
    </main>
  );
}
