import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import type { Task, TaskCreate } from '../api/tasks';
import { createTask, deleteTask, getTasks, updateTask } from '../api/tasks';
import ConfirmModal from '../components/ConfirmModal';

const STATUS_OPTIONS = ['pending', 'in_progress', 'done'] as const;
const emptyForm: TaskCreate = { title: '', description: '', status: 'pending' };

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  done: 'Done',
};

const STATUS_ICONS: Record<string, string> = {
  pending: '🕐',
  in_progress: '⚡',
  done: '✅',
};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [form, setForm] = useState<TaskCreate>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getTasks()
      .then((res) => setTasks(res.data))
      .catch(() => setError('Failed to load tasks'))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      if (editingId !== null) {
        const res = await updateTask(editingId, form);
        setTasks((prev) => prev.map((t) => (t.id === editingId ? res.data : t)));
        setEditingId(null);
      } else {
        const res = await createTask(form);
        setTasks((prev) => [...prev, res.data]);
      }
      setForm(emptyForm);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Operation failed');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingId(task.id);
    setForm({ title: task.title, description: task.description ?? '', status: task.status });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async () => {
    if (deletingId === null) return;
    try {
      await deleteTask(deletingId);
      setTasks((prev) => prev.filter((t) => t.id !== deletingId));
    } catch {
      setError('Failed to delete task');
    } finally {
      setDeletingId(null);
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setForm(emptyForm);
  };

  const counts = {
    total: tasks.length,
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    done: tasks.filter((t) => t.status === 'done').length,
  };

  return (
    <div className="dashboard">
      {/* ── Header ── */}
      <header className="dash-header">
        <div className="dash-header-inner">
          <div className="dash-logo">
            <span className="dash-logo-icon">⚡</span>
            <span>TaskFlow</span>
          </div>
          <div className="dash-user">
            <div className="dash-avatar">{user?.username?.[0]?.toUpperCase()}</div>
            <div className="dash-user-info">
              <span className="dash-username">{user?.username}</span>
              <span className="dash-sep">·</span>
              <span className="dash-role">{user?.role}</span>
            </div>
            <button className="dash-logout" onClick={logout}>Sign out</button>
          </div>
        </div>
      </header>

      <main className="dash-main">
        {/* ── Stats row ── */}
        <div className="stats-row">
          <div className="stat-card stat-total">
            <span className="stat-num">{counts.total}</span>
            <span className="stat-label">Total</span>
          </div>
          <div className="stat-card stat-pending">
            <span className="stat-num">{counts.pending}</span>
            <span className="stat-label">🕐 Pending</span>
          </div>
          <div className="stat-card stat-progress">
            <span className="stat-num">{counts.in_progress}</span>
            <span className="stat-label">⚡ In Progress</span>
          </div>
          <div className="stat-card stat-done">
            <span className="stat-num">{counts.done}</span>
            <span className="stat-label">✅ Done</span>
          </div>
        </div>

        <div className="dash-grid">
          {/* ── Form panel ── */}
          <div className="card form-card">
            <div className="card-header">
              <h2>{editingId !== null ? '✏️ Edit Task' : '＋ New Task'}</h2>
            </div>

            {error && <div className="alert alert-error">{error}</div>}

            <form onSubmit={handleSubmit} className="task-form">
              <div className="field">
                <label>Title <span className="req">*</span></label>
                <input
                  placeholder="What needs to be done?"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div className="field">
                <label>Description</label>
                <textarea
                  placeholder="Add more details…"
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                />
              </div>

              <div className="field">
                <label>Status</label>
                <div className="status-buttons">
                  {STATUS_OPTIONS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className={`status-btn status-btn-${s}${form.status === s ? ' active' : ''}`}
                      onClick={() => setForm((f) => ({ ...f, status: s }))}
                    >
                      {STATUS_ICONS[s]} {STATUS_LABELS[s]}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-primary">
                  {editingId !== null ? 'Update Task' : 'Create Task'}
                </button>
                {editingId !== null && (
                  <button type="button" className="btn-ghost" onClick={handleCancel}>
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* ── Task list ── */}
          <div className="card tasks-card">
            <div className="card-header">
              <h2>My Tasks</h2>
              {tasks.length > 0 && <span className="count-badge">{tasks.length}</span>}
            </div>

            {loading && (
              <div className="loading-state">
                <div className="spinner" />
                <span>Loading tasks…</span>
              </div>
            )}

            {!loading && tasks.length === 0 && (
              <div className="empty-state">
                <div className="empty-icon">📋</div>
                <p>No tasks yet</p>
                <small>Create your first task using the form</small>
              </div>
            )}

            <div className="task-list">
              {tasks.map((task) => (
                <div key={task.id} className={`task-item status-${task.status}`}>
                  <div className="task-item-top">
                    <span className="task-title">{task.title}</span>
                    <span className={`badge badge-${task.status}`}>
                      {STATUS_ICONS[task.status]} {STATUS_LABELS[task.status]}
                    </span>
                  </div>
                  {task.description && (
                    <p className="task-description">{task.description}</p>
                  )}
                  <div className="task-footer">
                    <span className="task-date">
                      {new Date(task.created_at).toLocaleDateString('en-US', {
                        month: 'short', day: 'numeric',
                      })}
                    </span>
                    <div className="task-actions">
                      <button className="btn-edit" onClick={() => handleEdit(task)}>
                        Edit
                      </button>
                      <button className="btn-del" onClick={() => setDeletingId(task.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {deletingId !== null && (
        <ConfirmModal
          title="Delete Task"
          message="Are you sure you want to delete this task? This action cannot be undone."
          onConfirm={handleDelete}
          onCancel={() => setDeletingId(null)}
        />
      )}
    </div>
  );
}
