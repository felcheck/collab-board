"use client";

import { db } from "@/lib/db";
import { id } from "@instantdb/react";
import { useState } from "react";

export default function App() {
  return (
    <div>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
      <db.SignedIn>
        <Dashboard />
      </db.SignedIn>
    </div>
  );
}

// Authentication Components
function Login() {
  const [sentEmail, setSentEmail] = useState("");

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <div className="max-w-md w-full mx-4">
        {!sentEmail ? (
          <EmailStep onSendEmail={setSentEmail} />
        ) : (
          <CodeStep sentEmail={sentEmail} onBack={() => setSentEmail("")} />
        )}
      </div>
    </div>
  );
}

function EmailStep({ onSendEmail }: { onSendEmail: (email: string) => void }) {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await db.auth.sendMagicCode({ email });
      onSendEmail(email);
    } catch (err: any) {
      alert(`Error: ${err.body?.message || "Failed to send magic code"}`);
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
          CollabBoard
        </h1>
        <p className="text-gray-600">
          Real-time collaborative whiteboard for teams
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Email address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? "Sending code..." : "Send magic link"}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500 mt-6">
        We'll send you a verification code to sign in
      </p>
    </div>
  );
}

function CodeStep({
  sentEmail,
  onBack,
}: {
  sentEmail: string;
  onBack: () => void;
}) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setIsLoading(true);
    try {
      await db.auth.signInWithMagicCode({ email: sentEmail, code });
    } catch (err: any) {
      alert(`Error: ${err.body?.message || "Invalid code"}`);
      setCode("");
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl p-8 border border-purple-100">
      <button
        onClick={onBack}
        className="text-purple-600 hover:text-purple-700 mb-6 flex items-center gap-2 text-sm font-medium"
      >
        ← Back
      </button>

      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Check your email
        </h2>
        <p className="text-gray-600">
          We sent a code to <strong>{sentEmail}</strong>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Verification code
          </label>
          <input
            id="code"
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            required
            autoFocus
            disabled={isLoading}
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all text-center text-2xl tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-3 rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isLoading ? "Verifying..." : "Verify code"}
        </button>
      </form>
    </div>
  );
}

// Dashboard Components
function Dashboard() {
  const user = db.useUser();
  const { isLoading, error, data } = db.useQuery({
    boards: {
      $: {
        order: { createdAt: "desc" },
      },
      creator: {},
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">Error: {error.message}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            CollabBoard
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">{user.email}</span>
            <button
              onClick={() => db.auth.signOut()}
              className="text-sm text-gray-600 hover:text-gray-900 font-medium"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">All Boards</h2>
          <p className="text-gray-600">
            Collaborate with your team on any board in real-time
          </p>
        </div>

        <BoardGrid boards={data?.boards || []} userId={user.id} currentUserEmail={user.email || null} />
      </main>
    </div>
  );
}

function BoardGrid({
  boards,
  userId,
  currentUserEmail,
}: {
  boards: any[];
  userId: string;
  currentUserEmail: string | null;
}) {
  const [isCreating, setIsCreating] = useState(false);
  const [boardName, setBoardName] = useState("");

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!boardName.trim()) return;

    const boardId = id();
    await db.transact(
      db.tx.boards[boardId]
        .update({
          name: boardName,
          createdAt: Date.now(),
        })
        .link({ creator: userId })
    );

    setBoardName("");
    setIsCreating(false);

    // Navigate to the new board
    window.location.href = `/board/${boardId}`;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Create New Board Card */}
      {!isCreating ? (
        <button
          onClick={() => setIsCreating(true)}
          className="h-48 rounded-2xl border-2 border-dashed border-purple-300 hover:border-purple-500 bg-white hover:bg-purple-50 transition-all flex flex-col items-center justify-center gap-3 group"
        >
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center text-white text-2xl group-hover:scale-110 transition-transform">
            +
          </div>
          <span className="text-lg font-medium text-gray-700 group-hover:text-purple-700">
            Create New Board
          </span>
        </button>
      ) : (
        <div className="h-48 rounded-2xl border-2 border-purple-500 bg-white p-6 flex flex-col">
          <form onSubmit={handleCreateBoard} className="flex-1 flex flex-col">
            <input
              type="text"
              value={boardName}
              onChange={(e) => setBoardName(e.target.value)}
              placeholder="Board name"
              autoFocus
              className="flex-1 text-lg font-medium outline-none border-b-2 border-purple-200 focus:border-purple-500 transition-colors mb-4"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-medium py-2 rounded-lg hover:shadow-md transition-all"
              >
                Create
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsCreating(false);
                  setBoardName("");
                }}
                className="flex-1 bg-gray-200 text-gray-700 font-medium py-2 rounded-lg hover:bg-gray-300 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Existing Boards */}
      {boards.map((board) => {
        const isOwnBoard = board.creator?.id === userId;
        const creatorEmail = board.creator?.email || "Unknown";

        return (
          <a
            key={board.id}
            href={`/board/${board.id}`}
            className="h-48 rounded-2xl border border-gray-200 bg-white hover:shadow-xl transition-all flex flex-col p-6 group hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="text-xl font-bold text-gray-900 group-hover:text-purple-700 transition-colors">
                {board.name}
              </h3>
              {isOwnBoard && (
                <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full font-medium">
                  You
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-1">
              Created {new Date(board.createdAt).toLocaleDateString()}
            </p>
            <p className="text-xs text-gray-400">
              by {isOwnBoard ? "you" : creatorEmail}
            </p>
            <div className="flex-1" />
            <div className="text-sm font-medium text-purple-600 group-hover:text-purple-700">
              Open board →
            </div>
          </a>
        );
      })}
    </div>
  );
}
