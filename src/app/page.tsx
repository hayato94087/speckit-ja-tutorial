import { TodoApp } from '@/components/todo/todo-app'

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-8 text-center text-3xl font-bold tracking-tight">
          個人用 ToDo
        </h1>
        <TodoApp />
      </div>
    </main>
  )
}
