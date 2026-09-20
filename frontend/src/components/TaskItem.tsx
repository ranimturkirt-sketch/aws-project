// =============================================================================
// TaskItem Component — frontend/src/components/TaskItem.tsx
// =============================================================================

import React, { useState } from 'react';
import { Task, UpdateTaskInput } from '../types/task';

interface TaskItemProps {
  task: Task;
  onUpdate: (id: number, input: UpdateTaskInput) => Promise<void>;
  onDelete: (id: number) => Promise<void>;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [isLoading, setIsLoading] = useState(false);

  const handleToggleComplete = async () => {
    setIsLoading(true);
    try {
      await onUpdate(task.id, { completed: !task.completed });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!editTitle.trim()) return;
    setIsLoading(true);
    try {
      await onUpdate(task.id, {
        title: editTitle.trim(),
        description: editDescription.trim(),
      });
      setIsEditing(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await onDelete(task.id);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setIsEditing(false);
  };

  const formattedDate = new Date(task.created_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`task-item ${task.completed ? 'task-completed' : ''} ${isLoading ? 'task-loading' : ''}`}>
      {isEditing ? (
        <div className="task-edit-form">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="form-input"
            maxLength={255}
          />
          <textarea
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
            className="form-textarea"
            rows={2}
          />
          <div className="task-edit-actions">
            <button className="btn btn-save" onClick={handleSave} disabled={!editTitle.trim()}>
              Sauvegarder
            </button>
            <button className="btn btn-cancel" onClick={handleCancel}>
              Annuler
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="task-main">
            <button
              className={`task-checkbox ${task.completed ? 'checked' : ''}`}
              onClick={handleToggleComplete}
              aria-label={task.completed ? 'Marquer comme non terminée' : 'Marquer comme terminée'}
            >
              {task.completed && <span className="checkmark">✓</span>}
            </button>
            <div className="task-content">
              <h3 className="task-title">{task.title}</h3>
              {task.description && <p className="task-description">{task.description}</p>}
              <span className="task-date">{formattedDate}</span>
            </div>
          </div>
          <div className="task-actions">
            <button className="btn btn-edit" onClick={() => setIsEditing(true)} aria-label="Modifier">
              ✎
            </button>
            <button className="btn btn-delete" onClick={handleDelete} aria-label="Supprimer">
              ✕
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskItem;
