// =============================================================================
// TaskForm Component — frontend/src/components/TaskForm.tsx
// =============================================================================

import React, { useState } from 'react';
import { CreateTaskInput } from '../types/task';

interface TaskFormProps {
  onSubmit: (input: CreateTaskInput) => Promise<void>;
}

const TaskForm: React.FC<TaskFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError('Le titre est requis');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({ title: title.trim(), description: description.trim() });
      setTitle('');
      setDescription('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la création');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <h2 className="form-title">Nouvelle tâche</h2>
      {error && <div className="form-error">{error}</div>}
      <div className="form-group">
        <input
          id="task-title-input"
          type="text"
          placeholder="Titre de la tâche..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="form-input"
          maxLength={255}
          disabled={isSubmitting}
        />
      </div>
      <div className="form-group">
        <textarea
          id="task-description-input"
          placeholder="Description (optionnel)..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="form-textarea"
          rows={3}
          disabled={isSubmitting}
        />
      </div>
      <button
        id="task-submit-btn"
        type="submit"
        className="form-submit-btn"
        disabled={isSubmitting || !title.trim()}
      >
        {isSubmitting ? 'Création...' : '+ Ajouter la tâche'}
      </button>
    </form>
  );
};

export default TaskForm;
