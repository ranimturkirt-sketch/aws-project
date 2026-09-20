// =============================================================================
// App Component — frontend/src/App.tsx
// =============================================================================

import React, { useState, useEffect, useCallback } from 'react';
import { Task, CreateTaskInput, UpdateTaskInput } from './types/task';
import { fetchTasks, createTask, updateTask, deleteTask } from './services/api';
import Header from './components/Header';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  // Load tasks on mount
  const loadTasks = useCallback(async () => {
    try {
      setError(null);
      const data = await fetchTasks();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de chargement');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // CRUD handlers
  const handleCreateTask = async (input: CreateTaskInput) => {
    const newTask = await createTask(input);
    setTasks((prev) => [newTask, ...prev]);
  };

  const handleUpdateTask = async (id: number, input: UpdateTaskInput) => {
    const updated = await updateTask(id, input);
    setTasks((prev) => prev.map((t) => (t.id === id ? updated : t)));
  };

  const handleDeleteTask = async (id: number) => {
    await deleteTask(id);
    setTasks((prev) => prev.filter((t) => t.id !== id));
  };

  // Computed values
  const completedTasks = tasks.filter((t) => t.completed).length;
  const filteredTasks = tasks.filter((task) => {
    if (filter === 'pending') return !task.completed;
    if (filter === 'completed') return task.completed;
    return true;
  });

  return (
    <div className="app">
      <Header totalTasks={tasks.length} completedTasks={completedTasks} />

      <main className="app-main">
        <div className="app-container">
          <TaskForm onSubmit={handleCreateTask} />

          {error && (
            <div className="error-banner">
              <span>⚠️ {error}</span>
              <button onClick={loadTasks} className="btn btn-retry">
                Réessayer
              </button>
            </div>
          )}

          <div className="filter-bar">
            <button
              id="filter-all"
              className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              Toutes ({tasks.length})
            </button>
            <button
              id="filter-pending"
              className={`filter-btn ${filter === 'pending' ? 'active' : ''}`}
              onClick={() => setFilter('pending')}
            >
              En cours ({tasks.length - completedTasks})
            </button>
            <button
              id="filter-completed"
              className={`filter-btn ${filter === 'completed' ? 'active' : ''}`}
              onClick={() => setFilter('completed')}
            >
              Terminées ({completedTasks})
            </button>
          </div>

          <TaskList
            tasks={filteredTasks}
            onUpdate={handleUpdateTask}
            onDelete={handleDeleteTask}
            isLoading={isLoading}
          />
        </div>
      </main>

      <footer className="app-footer">
        <p>Task Manager — DevSecOps AWS Project — {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

export default App;
