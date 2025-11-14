"use client";

import { db } from "@/lib/db";
import { useParams } from "next/navigation";
import Canvas from "@/components/Canvas";

export default function BoardPage() {
  const params = useParams();
  const boardId = params.id as string;

  return (
    <db.SignedIn>
      <BoardView boardId={boardId} />
    </db.SignedIn>
  );
}

function BoardView({ boardId }: { boardId: string }) {
  const { isLoading, error, data } = db.useQuery({
    boards: {
      $: { where: { id: boardId } },
      stickyNotes: {},
      shapes: {},
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-600">Loading board...</div>
      </div>
    );
  }

  if (error || !data?.boards?.[0]) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            {error?.message || "Board not found"}
          </div>
          <a
            href="/"
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            ← Back to dashboard
          </a>
        </div>
      </div>
    );
  }

  const board = data.boards[0];
  const stickyNotes = board.stickyNotes || [];

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="text-gray-600 hover:text-gray-900 font-medium text-sm"
          >
            ← Back
          </a>
          <h1 className="text-xl font-bold text-gray-900">{board.name}</h1>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {stickyNotes.length} {stickyNotes.length === 1 ? "note" : "notes"}
          </span>
          <button
            onClick={() => db.auth.signOut()}
            className="text-sm text-gray-600 hover:text-gray-900 font-medium"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Canvas Area */}
      <main className="flex-1 relative overflow-hidden">
        <Canvas boardId={boardId} stickyNotes={stickyNotes} />
      </main>
    </div>
  );
}
