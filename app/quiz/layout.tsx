import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Quiz',
  description: 'Interactive learning quiz',
};

export default function QuizLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}