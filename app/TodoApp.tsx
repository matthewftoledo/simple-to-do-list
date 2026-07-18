"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type Filter = "all" | "active" | "done";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  createdAt: number;
};

const STORAGE_KEY = "simple-todo-list:v1";

function createTask(title: string): Task {
  return {
    id: crypto.randomUUID(),
    title,
    completed: false,
    createdAt: Date.now(),
  };
}

export default function TodoApp() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingTitle, setEditingTitle] = useState("");

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setTasks(JSON.parse(saved));
        return;
      }
    } catch {
      // Ignore malformed local data and start fresh.
    }

    setTasks([
      createTask("Add your first task"),
      createTask("Mark one as done"),
      createTask("Clear completed when finished"),
    ]);
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  const visibleTasks = useMemo(() => {
    if (filter === "active") {
      return tasks.filter((task) => !task.completed);
    }

    if (filter === "done") {
      return tasks.filter((task) => task.completed);
    }

    return tasks;
  }, [filter, tasks]);

  const activeCount = tasks.filter((task) => !task.completed).length;
  const completedCount = tasks.length - activeCount;

  function addTask(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = newTask.trim();

    if (!title) {
      return;
    }

    setTasks((current) => [createTask(title), ...current]);
    setNewTask("");
  }

  function toggleTask(id: string) {
    setTasks((current) =>
      current.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task,
      ),
    );
  }

  function deleteTask(id: string) {
    setTasks((current) => current.filter((task) => task.id !== id));
  }

  function beginEdit(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  function saveEdit() {
    if (!editingId) {
      return;
    }

    const title = editingTitle.trim();
    if (!title) {
      deleteTask(editingId);
    } else {
      setTasks((current) =>
        current.map((task) =>
          task.id === editingId ? { ...task, title } : task,
        ),
      );
    }

    setEditingId(null);
    setEditingTitle("");
  }

  function cancelEdit() {
    setEditingId(null);
    setEditingTitle("");
  }

  return (
    <main className="todo-shell">
      <section className="todo-panel" aria-labelledby="todo-title">
        <div className="todo-header">
          <div>
            <p className="eyebrow">Today</p>
            <h1 id="todo-title">To-do list</h1>
          </div>
          <div className="task-count" aria-label={`${activeCount} active tasks`}>
            <strong>{activeCount}</strong>
            <span>left</span>
          </div>
        </div>

        <form className="add-task" onSubmit={addTask}>
          <label className="sr-only" htmlFor="new-task">
            New task
          </label>
          <input
            id="new-task"
            type="text"
            value={newTask}
            onChange={(event) => setNewTask(event.target.value)}
            placeholder="Add a task..."
            autoComplete="off"
          />
          <button type="submit">Add</button>
        </form>

        <div className="toolbar" aria-label="Task filters">
          {(["all", "active", "done"] as const).map((option) => (
            <button
              key={option}
              type="button"
              className={filter === option ? "selected" : ""}
              onClick={() => setFilter(option)}
            >
              {option}
            </button>
          ))}
        </div>

        <ul className="task-list" aria-label="Tasks">
          {visibleTasks.length === 0 ? (
            <li className="empty-state">
              {filter === "done"
                ? "No completed tasks yet."
                : filter === "active"
                  ? "No active tasks. Nice work."
                  : "No tasks yet. Add one above."}
            </li>
          ) : (
            visibleTasks.map((task) => (
              <li
                key={task.id}
                className={task.completed ? "task completed" : "task"}
              >
                <button
                  type="button"
                  className="check"
                  onClick={() => toggleTask(task.id)}
                  aria-label={
                    task.completed
                      ? `Mark ${task.title} active`
                      : `Mark ${task.title} complete`
                  }
                >
                  {task.completed ? "OK" : ""}
                </button>

                {editingId === task.id ? (
                  <form
                    className="edit-form"
                    onSubmit={(event) => {
                      event.preventDefault();
                      saveEdit();
                    }}
                  >
                    <input
                      value={editingTitle}
                      onChange={(event) => setEditingTitle(event.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={(event) => {
                        if (event.key === "Escape") {
                          cancelEdit();
                        }
                      }}
                      aria-label={`Edit ${task.title}`}
                      autoFocus
                    />
                  </form>
                ) : (
                  <button
                    type="button"
                    className="task-title"
                    onClick={() => beginEdit(task)}
                  >
                    {task.title}
                  </button>
                )}

                <button
                  type="button"
                  className="delete"
                  onClick={() => deleteTask(task.id)}
                  aria-label={`Delete ${task.title}`}
                >
                  Delete
                </button>
              </li>
            ))
          )}
        </ul>

        <footer className="footer">
          <span>
            {tasks.length} total, {completedCount} done
          </span>
          <button
            type="button"
            onClick={() =>
              setTasks((current) => current.filter((task) => !task.completed))
            }
            disabled={completedCount === 0}
          >
            Clear completed
          </button>
        </footer>
      </section>
    </main>
  );
}
