// =============================================================================
// TaskList Component — frontend/src/components/TaskList.tsx
// =============================================================================

import React from 'react';
import { Task, UpdateTaskInput } from '../types/task';
import TaskItem from './TaskItem';

interface TaskListProps {
  tasks: Task[];
  onUpdate: (id: number, input: UpdateTaskInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
  isLoading: boolean;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onUpdate, onDelete, isLoading }) => {
  if (isLoading) {
    return (
      <div className="task-list-empty">
        <div className="loading-spinner"></div>
        <p>Chargement des tâches...</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="task-list-empty">
        <div className="empty-icon">📋</div>
        <h3>Aucune tâche</h3>
        <p>Créez votre première tâche pour commencer !</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onUpdate={onUpdate}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
};

export default TaskList;
