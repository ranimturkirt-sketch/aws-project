// =============================================================================
// Header Component — frontend/src/components/Header.tsx
// =============================================================================

import React from 'react';

interface HeaderProps {
  totalTasks: number;
  completedTasks: number;
}

const Header: React.FC<HeaderProps> = ({ totalTasks, completedTasks }) => {
  const pendingTasks = totalTasks - completedTasks;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-title">
          <div className="header-icon">✓</div>
          <div>
            <h1>Task Manager</h1>
            <p className="header-subtitle">DevSecOps AWS Project</p>
          </div>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <span className="stat-number">{totalTasks}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-number">{pendingTasks}</span>
            <span className="stat-label">En cours</span>
          </div>
          <div className="stat-card stat-completed">
            <span className="stat-number">{completedTasks}</span>
            <span className="stat-label">Terminées</span>
          </div>
          <div className="stat-card stat-progress">
            <span className="stat-number">{completionPercentage}%</span>
            <span className="stat-label">Progression</span>
          </div>
        </div>
      </div>
      {totalTasks > 0 && (
        <div className="progress-bar-container">
          <div className="progress-bar" style={{ width: `${completionPercentage}%` }}></div>
        </div>
      )}
    </header>
  );
};

export default Header;
