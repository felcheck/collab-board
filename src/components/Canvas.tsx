"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { db } from "@/lib/db";
import { id } from "@instantdb/react";

interface CanvasProps {
  boardId: string;
  stickyNotes: any[];
}

interface ViewState {
  scale: number;
  offsetX: number;
  offsetY: number;
}

const COLORS = {
  yellow: "#FEF3C7",
  pink: "#FCE7F3",
  blue: "#DBEAFE",
  green: "#D1FAE5",
  purple: "#E9D5FF",
};

export default function Canvas({ boardId, stickyNotes }: CanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [viewState, setViewState] = useState<ViewState>({
    scale: 1,
    offsetX: 0,
    offsetY: 0,
  });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [selectedNote, setSelectedNote] = useState<string | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  // Pan handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-background")) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - viewState.offsetX, y: e.clientY - viewState.offsetY });
      setSelectedNote(null);
    }
  }, [viewState.offsetX, viewState.offsetY]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isPanning) {
      setViewState(prev => ({
        ...prev,
        offsetX: e.clientX - panStart.x,
        offsetY: e.clientY - panStart.y,
      }));
    }
  }, [isPanning, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
  }, []);

  // Zoom handler
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY * -0.001;
    const newScale = Math.min(Math.max(0.1, viewState.scale + delta), 3);

    setViewState(prev => ({
      ...prev,
      scale: newScale,
    }));
  }, [viewState.scale]);

  // Double-click to create sticky note
  const handleDoubleClick = useCallback(async (e: React.MouseEvent) => {
    if (e.target === canvasRef.current || (e.target as HTMLElement).classList.contains("canvas-background")) {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = (e.clientX - rect.left - viewState.offsetX) / viewState.scale;
      const y = (e.clientY - rect.top - viewState.offsetY) / viewState.scale;

      const noteId = id();
      await db.transact(
        db.tx.stickyNotes[noteId]
          .update({
            content: "New note",
            x,
            y,
            color: "yellow",
            width: 200,
            height: 150,
            createdAt: Date.now(),
            updatedAt: Date.now(),
          })
          .link({ board: boardId })
      );

      // Auto-focus the new note
      setTimeout(() => {
        setEditingNote(noteId);
      }, 50);
    }
  }, [boardId, viewState.offsetX, viewState.offsetY, viewState.scale]);

  return (
    <div
      ref={canvasRef}
      className="absolute inset-0 overflow-hidden bg-gray-50 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      onDoubleClick={handleDoubleClick}
    >
      {/* Grid background */}
      <div
        className="canvas-background absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, #e5e7eb 1px, transparent 1px),
            linear-gradient(to bottom, #e5e7eb 1px, transparent 1px)
          `,
          backgroundSize: `${20 * viewState.scale}px ${20 * viewState.scale}px`,
          backgroundPosition: `${viewState.offsetX}px ${viewState.offsetY}px`,
        }}
      />

      {/* Canvas content */}
      <div
        className="absolute"
        style={{
          transform: `translate(${viewState.offsetX}px, ${viewState.offsetY}px) scale(${viewState.scale})`,
          transformOrigin: "0 0",
        }}
      >
        {stickyNotes.map((note) => (
          <StickyNote
            key={note.id}
            note={note}
            isSelected={selectedNote === note.id}
            isEditing={editingNote === note.id}
            onSelect={() => setSelectedNote(note.id)}
            onEdit={() => setEditingNote(note.id)}
            onEditEnd={() => setEditingNote(null)}
            viewScale={viewState.scale}
          />
        ))}
      </div>

      {/* Zoom controls */}
      <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex flex-col gap-2">
        <button
          onClick={() => setViewState(prev => ({ ...prev, scale: Math.min(prev.scale + 0.1, 3) }))}
          className="px-3 py-1 hover:bg-gray-100 rounded font-medium text-gray-700"
        >
          +
        </button>
        <div className="text-xs text-center text-gray-600">
          {Math.round(viewState.scale * 100)}%
        </div>
        <button
          onClick={() => setViewState(prev => ({ ...prev, scale: Math.max(prev.scale - 0.1, 0.1) }))}
          className="px-3 py-1 hover:bg-gray-100 rounded font-medium text-gray-700"
        >
          −
        </button>
        <button
          onClick={() => setViewState({ scale: 1, offsetX: 0, offsetY: 0 })}
          className="px-3 py-1 hover:bg-gray-100 rounded text-xs text-gray-700"
        >
          Reset
        </button>
      </div>

      {/* Instructions */}
      {stickyNotes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="text-center text-gray-400">
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg font-medium">Double-click anywhere to create a sticky note</p>
            <p className="text-sm">Drag to pan • Scroll to zoom</p>
          </div>
        </div>
      )}
    </div>
  );
}

interface StickyNoteProps {
  note: any;
  isSelected: boolean;
  isEditing: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onEditEnd: () => void;
  viewScale: number;
}

function StickyNote({
  note,
  isSelected,
  isEditing,
  onSelect,
  onEdit,
  onEditEnd,
  viewScale,
}: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [localContent, setLocalContent] = useState(note.content);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setLocalContent(note.content);
  }, [note.content]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isEditing]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isEditing) return;
    e.stopPropagation();
    onSelect();
    setIsDragging(true);
    setDragStart({
      x: e.clientX / viewScale - note.x,
      y: e.clientY / viewScale - note.y,
    });
  }, [isEditing, onSelect, viewScale, note.x, note.y]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX / viewScale - dragStart.x;
      const newY = e.clientY / viewScale - dragStart.y;

      db.transact(
        db.tx.stickyNotes[note.id].update({
          x: newX,
          y: newY,
          updatedAt: Date.now(),
        })
      );
    }
  }, [isDragging, dragStart, viewScale, note.id]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  }, [onEdit]);

  const handleContentChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setLocalContent(e.target.value);
  }, []);

  const handleBlur = useCallback(() => {
    db.transact(
      db.tx.stickyNotes[note.id].update({
        content: localContent,
        updatedAt: Date.now(),
      })
    );
    onEditEnd();
  }, [localContent, note.id, onEditEnd]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleBlur();
    }
    // Allow Ctrl/Cmd+Enter to finish editing
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      handleBlur();
    }
  }, [handleBlur]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    db.transact(db.tx.stickyNotes[note.id].delete());
  }, [note.id]);

  // Handle keyboard delete
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (isSelected && !isEditing && (e.key === "Delete" || e.key === "Backspace")) {
        e.preventDefault();
        db.transact(db.tx.stickyNotes[note.id].delete());
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [isSelected, isEditing, note.id]);

  const changeColor = useCallback((color: string) => {
    db.transact(
      db.tx.stickyNotes[note.id].update({
        color,
        updatedAt: Date.now(),
      })
    );
  }, [note.id]);

  return (
    <div
      className={`absolute cursor-move select-none ${isSelected ? "ring-2 ring-purple-500 ring-offset-2" : ""}`}
      style={{
        left: note.x,
        top: note.y,
        width: note.width,
        minHeight: note.height,
        backgroundColor: COLORS[note.color as keyof typeof COLORS] || COLORS.yellow,
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onDoubleClick={handleDoubleClick}
    >
      <div className="h-full p-4 rounded-lg shadow-md hover:shadow-xl transition-shadow relative">
        {isEditing ? (
          <textarea
            ref={textareaRef}
            value={localContent}
            onChange={handleContentChange}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="w-full h-full bg-transparent border-none outline-none resize-none font-sans"
            style={{ minHeight: "100px" }}
          />
        ) : (
          <div className="whitespace-pre-wrap break-words">{note.content}</div>
        )}

        {/* Color picker and delete button */}
        {isSelected && !isEditing && (
          <div className="absolute -top-10 left-0 bg-white rounded-lg shadow-lg border border-gray-200 p-2 flex gap-2">
            {Object.keys(COLORS).map((color) => (
              <button
                key={color}
                onClick={() => changeColor(color)}
                className="w-6 h-6 rounded-full border-2 border-gray-300 hover:scale-110 transition-transform"
                style={{ backgroundColor: COLORS[color as keyof typeof COLORS] }}
              />
            ))}
            <div className="w-px bg-gray-300" />
            <button
              onClick={handleDelete}
              className="px-2 text-red-600 hover:bg-red-50 rounded text-sm font-medium"
            >
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
