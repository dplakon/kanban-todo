"use client";

import { useState, useRef, useCallback } from "react";

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

const priorityLabels: Record<string, string> = {
  urgent: "Urgent priority",
  high: "High priority",
  medium: "Medium priority",
  low: "Low priority",
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
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

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

  // Keyboard navigation for moving tasks between columns
  const moveTaskWithKeyboard = useCallback(
    (task: Task, sourceColumnId: string, direction: "left" | "right") => {
      const columnIndex = columns.findIndex((col) => col.id === sourceColumnId);
      const targetIndex =
        direction === "left" ? columnIndex - 1 : columnIndex + 1;

      if (targetIndex < 0 || targetIndex >= columns.length) return;

      const targetColumnId = columns[targetIndex].id;

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
    },
    [columns]
  );

  const handleTaskKeyDown = (
    e: React.KeyboardEvent,
    task: Task,
    columnId: string
  ) => {
    switch (e.key) {
      case "Enter":
      case " ":
        e.preventDefault();
        setSelectedTaskId(task.id);
        console.log("open task", task.id);
        break;
      case "ArrowLeft":
        e.preventDefault();
        moveTaskWithKeyboard(task, columnId, "left");
        break;
      case "ArrowRight":
        e.preventDefault();
        moveTaskWithKeyboard(task, columnId, "right");
        break;
      case "Delete":
      case "Backspace":
        e.preventDefault();
        deleteTask(columnId, task.id);
        break;
    }
  };

  const skipToMain = () => {
    mainContentRef.current?.focus();
  };

  return (
    <main className="min-h-screen bg-[#0a0a0b] p-6 font-sans">
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          skipToMain();
        }}
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 
                   focus:z-50 focus:bg-violet-600 focus:text-white focus:px-4 focus:py-2 
                   focus:rounded-md focus:outline-none focus:ring-2 focus:ring-white"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="max-w-7xl mx-auto mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div 
            className="w-5 h-5 rounded bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center"
            aria-hidden="true"
          >
            <span className="text-white text-xs font-bold">K</span>
          </div>
          <h1 className="text-sm font-medium text-zinc-200">Kanban Board</h1>
        </div>
        <p className="text-xs text-zinc-400 ml-8">Active Sprint</p>
      </header>

      {/* Board */}
      <div 
        id="main-content"
        ref={mainContentRef}
        tabIndex={-1}
        className="max-w-7xl mx-auto outline-none"
        role="region"
        aria-label="Kanban board with 4 columns"
      >
        <div className="flex gap-4 overflow-x-auto pb-4" role="list" aria-label="Kanban columns">
          {columns.map((column) => (
            <section
              key={column.id}
              className="flex-shrink-0 w-72"
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(column.id)}
              aria-labelledby={`column-${column.id}-heading`}
              role="listitem"
            >
              {/* Column header with proper semantics */}
              <div className="flex items-center gap-2 mb-3 px-1">
                <span className="text-zinc-500 text-sm" aria-hidden="true">
                  {column.icon}
                </span>
                <h2
                  id={`column-${column.id}-heading`}
                  className="text-sm font-medium text-zinc-300"
                >
                  {column.title}
                </h2>
                <span
                  className="text-xs text-zinc-500"
                  aria-label={`${column.tasks.length} tasks`}
                >
                  {column.tasks.length}
                </span>
              </div>

              {/* Tasks */}
              <ul className="space-y-0.5" aria-label={`Tasks in ${column.title}`}>
                {column.tasks.map((task) => (
                  <li key={task.id}>
                    <article
                      draggable
                      onDragStart={() => handleDragStart(task, column.id)}
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        console.log("open task", task.id);
                      }}
                      onKeyDown={(e) => handleTaskKeyDown(e, task, column.id)}
                      tabIndex={0}
                      role="button"
                      aria-pressed={selectedTaskId === task.id}
                      aria-describedby={`task-${task.id}-info`}
                      className="group bg-[#0a0a0b] border border-zinc-800/50 hover:border-zinc-700/80 
                               rounded-md px-3 py-2.5 cursor-grab active:cursor-grabbing 
                               transition-all duration-150 hover:bg-zinc-900/50
                               focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500/50"
                    >
                      <div className="flex items-start gap-2.5">
                        {/* Priority indicator with accessible label */}
                        <div
                          className={`w-1 h-1 rounded-full mt-1.5 flex-shrink-0 ${priorityColors[task.priority || "medium"]}`}
                          role="img"
                          aria-label={priorityLabels[task.priority || "medium"]}
                        />

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                          {/* Improved contrast: zinc-300 for better readability */}
                          <p className="text-sm text-zinc-300 leading-snug">
                            {task.title}
                          </p>
                          <div className="flex items-center gap-2 mt-1.5">
                            {/* Improved contrast: zinc-500 and larger text */}
                            <span
                              id={`task-${task.id}-info`}
                              className="text-[10px] text-zinc-500 font-mono"
                            >
                              KAN-{task.id}
                            </span>
                          </div>
                        </div>

                        {/* Delete button with accessible name */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTask(column.id, task.id);
                          }}
                          aria-label={`Delete task: ${task.title}`}
                          className="text-zinc-500 hover:text-zinc-300 opacity-0 group-hover:opacity-100 
                                   focus:opacity-100 transition-all duration-150 p-0.5 hover:bg-zinc-800 
                                   rounded focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            aria-hidden="true"
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
                    </article>
                  </li>
                ))}

              </ul>

              {/* Add task input with proper label */}
              {showInputFor === column.id ? (
                <div className="mt-1">
                  <label htmlFor={`new-task-${column.id}`} className="sr-only">
                    New task title for {column.title}
                  </label>
                  <input
                    id={`new-task-${column.id}`}
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
                             text-sm placeholder-zinc-500 rounded-md px-3 py-2 
                             focus:outline-none focus:border-violet-500/50 focus:ring-2 
                             focus:ring-violet-500/20 transition-all"
                  />
                </div>
              ) : (
                <button
                  onClick={() => setShowInputFor(column.id)}
                  className="w-full mt-1 flex items-center gap-2 px-3 py-2 text-sm text-zinc-500 
                           hover:text-zinc-300 hover:bg-zinc-900/30 rounded-md transition-colors
                           focus:outline-none focus:ring-2 focus:ring-violet-500/50"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    aria-hidden="true"
                  >
                    <path d="M12 4v16m8-8H4" />
                  </svg>
                  Add issue
                </button>
              )}
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
