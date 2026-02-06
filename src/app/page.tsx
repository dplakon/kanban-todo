"use client";

import { useState } from "react";

type Task = {
  id: string;
  title: string;
  priority?: "urgent" | "high" | "medium" | "low";
};

type Column = {
  id: string;
  title: string;
  icon: string;
  tasks: Task[];
};

const initialColumns: Column[] = [
  {
    id: "backlog",
    title: "Backlog",
    icon: "○",
    tasks: [
      { id: "1", title: "Research project requirements", priority: "low" },
      { id: "2", title: "Create wireframes", priority: "medium" },
    ],
  },
  {
    id: "todo",
    title: "Todo",
    icon: "◔",
    tasks: [{ id: "3", title: "Set up authentication flow", priority: "high" }],
  },
  {
    id: "in-progress",
    title: "In Progress",
    icon: "◑",
    tasks: [{ id: "4", title: "Build UI components", priority: "urgent" }],
  },
  {
    id: "done",
    title: "Done",
    icon: "●",
    tasks: [{ id: "5", title: "Set up project repository", priority: "medium" }],
  },
];

const priorityColors: Record<string, string> = {
  urgent: "bg-orange-500",
  high: "bg-amber-400",
  medium: "bg-blue-400",
  low: "bg-zinc-500",
};

export default function KanbanBoard() {
  const [columns, setColumns] = useState<Column[]>(initialColumns);
  const [draggedTask, setDraggedTask] = useState<{
    task: Task;
    sourceColumnId: string;
  } | null>(null);
  const [newTaskInputs, setNewTaskInputs] = useState<Record<string, string>>(
    {}
  );
  const [showInputFor, setShowInputFor] = useState<string | null>(null);

  const handleDragStart = (task: Task, sourceColumnId: string) => {
    setDraggedTask({ task, sourceColumnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetColumnId: string) => {
    if (!draggedTask) return;

    const { task, sourceColumnId } = draggedTask;

    if (sourceColumnId === targetColumnId) {
      setDraggedTask(null);
      return;
    }

    setColumns((prev) =>
      prev.map((col) => {
        if (col.id === sourceColumnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== task.id) };
        }
        if (col.id === targetColumnId) {
          return { ...col, tasks: [...col.tasks, task] };
        }
        return col;
      })
    );

    setDraggedTask(null);
  };

  const addTask = (columnId: string) => {
    const title = newTaskInputs[columnId]?.trim();
    if (!title) return;

    const newTask: Task = {
      id: Date.now().toString(),
      title,
      priority: "medium",
    };

    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
      )
    );

    setNewTaskInputs((prev) => ({ ...prev, [columnId]: "" }));
    setShowInputFor(null);
  };

  const deleteTask = (columnId: string, taskId: string) => {
    setColumns((prev) =>
      prev.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
          : col
      )
    );
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] p-6 font-sans">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center">
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <h1 className="text-sm font-medium text-zinc-200">Kanban Board</h1>
        </div>
        <p className="text-xs text-zinc-500 ml-8">Active Sprint</p>
      </div>

      {/* Board */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => (
            <div
              key={column.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
            >
              {/* A11y issue: no semantic heading, poor structure */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-zinc-500 text-sm">{column.icon}</span>
                {/* A11y issue: using div instead of proper heading */}
                <div className="text-sm font-medium text-zinc-300">
                  {column.title}
                </div>
                {/* A11y issue: count has no context for screen readers */}
                <span className="text-xs text-zinc-600">
                  {column.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <div className="space-y-0.5">
                {column.tasks.map((task) => (
                  // A11y issue: div with click handler instead of button, no keyboard support
                  <div
                    key={task.id}
                    draggable
                    onDragStart={() => handleDragStart(task, column.id)}
                    onClick={() => console.log("open task")}
                    className="group bg-[#0a0a0b] border border-zinc-800/50 hover:border-zinc-700/80 
                             rounded-md px-3 py-2.5 cursor-grab active:cursor-grabbing 
                             transition-all duration-150 hover:bg-zinc-900/50"
                  >
                    <div className="flex items-start gap-2.5">
                      {/* A11y issue: color-only indicator with no text alternative */}
                      <div
                        className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority || "medium"]}`}
                      />
                      
                      {/* Task content */}
                      <div className="flex-1 min-w-0">
                        {/* A11y issue: low contrast text (zinc-500 on dark bg) */}
                        <p className="text-sm text-zinc-500 leading-snug">
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {/* A11y issue: very low contrast, tiny text */}
                          <span className="text-[9px] text-zinc-700 font-mono">
                            KAN-{task.id}
                          </span>
                        </div>
                      </div>

                      {/* A11y issue: removed aria-label, empty button */}
                      <button
                        onClick={() => deleteTask(column.id, task.id)}
                        className="text-zinc-600 hover:text-zinc-400 opacity-0 group-hover:opacity-100 
                                 transition-all duration-150 p-0.5 hover:bg-zinc-800 rounded"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add task input */}
                {/* A11y issue: input has no associated label */}
                {showInputFor === column.id ? (
                  <div className="mt-1">
                    <input
                      type="text"
                      autoFocus
                      placeholder="Issue title"
                      value={newTaskInputs[column.id] || ""}
                      onChange={(e) =>
                        setNewTaskInputs((prev) => ({
                          ...prev,
                          [column.id]: e.target.value,
                        }))
                      }
                      onKeyDown={(e) => {
                        if (e.key === "Enter") addTask(column.id);
                        if (e.key === "Escape") setShowInputFor(null);
                      }}
                      onBlur={() => {
                        if (!newTaskInputs[column.id]?.trim()) {
                          setShowInputFor(null);
                        }
                      }}
                      className="w-full bg-zinc-900/50 border border-zinc-700 text-zinc-200 
                               text-sm placeholder-zinc-600 rounded-md px-3 py-2 
                               focus:outline-none focus:border-violet-500/50 focus:ring-1 
                               focus:ring-violet-500/20 transition-all"
                    />
                  </div>
                ) : (
                  // A11y issue: using span with onClick instead of button
                  <span
                    onClick={() => setShowInputFor(column.id)}
                    className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-sm text-zinc-600 
                             hover:text-zinc-400 hover:bg-zinc-900/30 rounded-md transition-colors cursor-pointer"
                  >
                    {/* A11y issue: decorative image without aria-hidden */}
                    <img src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%2752525b' stroke-width='1.5'%3E%3Cpath d='M12 4v16m8-8H4'/%3E%3C/svg%3E" alt="" />
                    Add issue
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
