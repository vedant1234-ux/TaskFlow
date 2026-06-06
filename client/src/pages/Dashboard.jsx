/**
 * Dashboard Page
 * Main task management hub with stats, filters, search, and task list
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, SlidersHorizontal, ArrowUpDown, RefreshCw } from 'lucide-react';
import useTasks from '../hooks/useTasks';
import TaskCard from '../components/TaskCard';
import TaskForm from '../components/TaskForm';
import TaskModal from '../components/TaskModal';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Loader';
import toast from 'react-hot-toast';

// ── Animated Counter ──────────────────────────────
const AnimatedCounter = ({ value }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const duration = 600;
    const steps = 20;
    const increment = value / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else {
        setDisplay(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [value]);
  return <span>{display}</span>;
};

// ── Stats Cards Config ────────────────────────────
const STAT_CARDS = [
  {
    key: 'total',
    label: 'Total Tasks',
    gradient: 'linear-gradient(135deg, #4F46E5, #7C3AED)',
    iconBg: 'rgba(79, 70, 229, 0.15)',
    icon: '📋',
  },
  {
    key: 'pending',
    label: 'Pending',
    gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
    iconBg: 'rgba(245, 158, 11, 0.15)',
    icon: '⏳',
  },
  {
    key: 'in-progress',
    label: 'In Progress',
    gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)',
    iconBg: 'rgba(139, 92, 246, 0.15)',
    icon: '🔄',
  },
  {
    key: 'completed',
    label: 'Completed',
    gradient: 'linear-gradient(135deg, #10B981, #059669)',
    iconBg: 'rgba(16, 185, 129, 0.15)',
    icon: '✅',
  },
];

const STATUS_FILTERS = [
  { value: '', label: 'All Tasks' },
  { value: 'pending', label: 'Pending' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const PRIORITY_FILTERS = [
  { value: '', label: 'All Priority' },
  { value: 'high', label: '🔴 High' },
  { value: 'medium', label: '🟡 Medium' },
  { value: 'low', label: '🟢 Low' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'priority', label: 'By Priority' },
  { value: 'dueDate', label: 'By Due Date' },
];

const Dashboard = ({ onStatsUpdate }) => {
  const {
    tasks,
    stats,
    loading,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  } = useTasks();

  const [editingTask, setEditingTask] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [sort, setSort] = useState('newest');

  const debounceRef = useRef(null);

  // ── Load Data ──────────────────────────────────
  const loadAll = useCallback(async (params = {}) => {
    await Promise.all([fetchTasks(params), fetchStats()]);
  }, [fetchTasks, fetchStats]);

  useEffect(() => {
    loadAll({ sort });
  }, []);

  // Update parent layout stats
  useEffect(() => {
    if (onStatsUpdate) onStatsUpdate(stats);
  }, [stats]);

  // ── Debounced Search + Filter ──────────────────
  useEffect(() => {
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const params = {};
      if (search) params.search = search;
      if (statusFilter) params.status = statusFilter;
      if (priorityFilter) params.priority = priorityFilter;
      if (sort) params.sort = sort;
      fetchTasks(params);
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [search, statusFilter, priorityFilter, sort]);

  // ── Task CRUD ──────────────────────────────────
  const handleCreate = async (data) => {
    await createTask(data);
    fetchStats();
  };

  const handleUpdate = async (data) => {
    if (!editingTask) return;
    await updateTask(editingTask._id, data);
    setEditingTask(null);
    fetchStats();
  };

  const handleDelete = async (id) => {
    await deleteTask(id);
    fetchStats();
  };

  const handleToggle = async (id) => {
    await toggleTask(id);
    fetchStats();
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setSelectedTask(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const isFiltered = search || statusFilter || priorityFilter;

  return (
    <div className="page-content">

      {/* ── Stats Grid ───────────────────── */}
      <div className="stats-grid stagger-children" style={{ marginBottom: '28px' }}>
        {STAT_CARDS.map((card) => (
          <div key={card.key} className="stat-card">
            <div className="stat-icon" style={{ background: card.iconBg }}>
              <span style={{ fontSize: '24px' }}>{card.icon}</span>
            </div>
            <div className="stat-info">
              <div className="stat-value" style={{
                background: card.gradient,
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>
                <AnimatedCounter value={stats[card.key] || 0} />
              </div>
              <div className="stat-label">{card.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Task Form ───────────────────── */}
      <TaskForm
        onSubmit={editingTask ? handleUpdate : handleCreate}
        editingTask={editingTask}
        onCancelEdit={() => setEditingTask(null)}
      />

      {/* ── Filters + Search Bar ─────────── */}
      <div className="filter-bar">
        {/* Search */}
        <div className="search-bar" style={{ flex: 1, minWidth: '180px', maxWidth: '320px' }}>
          <Search size={15} className="search-icon" />
          <input
            className="input"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ height: '38px', paddingTop: '8px', paddingBottom: '8px', paddingLeft: '36px' }}
          />
        </div>

        {/* Status Filters */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              className={`filter-btn ${statusFilter === f.value ? 'active' : ''}`}
              onClick={() => setStatusFilter(statusFilter === f.value ? '' : f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Priority */}
        <select
          className="input"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          style={{ height: '38px', width: 'auto', minWidth: '120px', paddingTop: '8px', paddingBottom: '8px' }}
        >
          {PRIORITY_FILTERS.map((f) => (
            <option key={f.value} value={f.value}>{f.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          className="input"
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{ height: '38px', width: 'auto', minWidth: '130px', paddingTop: '8px', paddingBottom: '8px' }}
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>

        {/* Refresh */}
        <button
          className="btn btn-ghost btn-icon"
          onClick={() => loadAll({ sort })}
          data-tooltip="Refresh"
          style={{ flexShrink: 0, height: '38px', width: '38px' }}
        >
          <RefreshCw size={15} />
        </button>
      </div>

      {/* ── Results Header ───────────────── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
          {loading ? 'Loading...' : `${tasks.length} task${tasks.length !== 1 ? 's' : ''} found`}
        </p>
        {isFiltered && (
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => { setSearch(''); setStatusFilter(''); setPriorityFilter(''); }}
            style={{ fontSize: '12px', color: 'var(--color-danger)' }}
          >
            ✕ Clear Filters
          </button>
        )}
      </div>

      {/* ── Task List ────────────────────── */}
      {loading ? (
        <div className="tasks-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <EmptyState
          message="You haven't created any tasks yet. Start by creating your first task above!"
          filtered={!!isFiltered}
          onAction={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        />
      ) : (
        <div className="tasks-grid stagger-children">
          {tasks.map((task) => (
            <TaskCard
              key={task._id}
              task={task}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onToggle={handleToggle}
            />
          ))}
        </div>
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={handleEdit}
        />
      )}
    </div>
  );
};

export default Dashboard;
