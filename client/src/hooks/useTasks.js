/**
 * useTasks Hook
 * Manages all task CRUD operations with state and error handling
 */

import { useState, useCallback } from 'react';
import api from '../api/axios';
import toast from 'react-hot-toast';

const useTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    'in-progress': 0,
    completed: 0,
  });
  const [loading, setLoading] = useState(false);
  const [statsLoading, setStatsLoading] = useState(false);

  // ── Fetch Tasks ────────────────────────────────
  const fetchTasks = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const { data } = await api.get('/tasks', { params });
      setTasks(data.tasks);
      return data;
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to load tasks.';
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ── Fetch Stats ────────────────────────────────
  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    try {
      const { data } = await api.get('/tasks/stats');
      setStats(data.stats);
      return data.stats;
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    } finally {
      setStatsLoading(false);
    }
  }, []);

  // ── Create Task ────────────────────────────────
  const createTask = useCallback(async (taskData) => {
    const { data } = await api.post('/tasks', taskData);
    setTasks((prev) => [data.task, ...prev]);
    setStats((prev) => ({
      ...prev,
      total: prev.total + 1,
      pending: prev.pending + 1,
    }));
    toast.success('Task created! ✅');
    return data.task;
  }, []);

  // ── Update Task ────────────────────────────────
  const updateTask = useCallback(async (id, taskData) => {
    const { data } = await api.put(`/tasks/${id}`, taskData);
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? data.task : task))
    );
    toast.success('Task updated!');
    return data.task;
  }, []);

  // ── Delete Task ────────────────────────────────
  const deleteTask = useCallback(async (id) => {
    const taskToDelete = tasks.find((t) => t._id === id);
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((task) => task._id !== id));
    // Update stats
    if (taskToDelete) {
      setStats((prev) => ({
        ...prev,
        total: Math.max(0, prev.total - 1),
        [taskToDelete.status]: Math.max(0, prev[taskToDelete.status] - 1),
      }));
    }
    toast.success('Task deleted.');
  }, [tasks]);

  // ── Toggle Task Completion ─────────────────────
  const toggleTask = useCallback(async (id) => {
    const { data } = await api.patch(`/tasks/${id}/toggle`);
    const oldTask = tasks.find((t) => t._id === id);
    setTasks((prev) =>
      prev.map((task) => (task._id === id ? data.task : task))
    );
    // Update stats
    if (oldTask) {
      setStats((prev) => {
        const updated = { ...prev };
        updated[oldTask.status] = Math.max(0, updated[oldTask.status] - 1);
        updated[data.task.status] = (updated[data.task.status] || 0) + 1;
        return updated;
      });
    }
    return data.task;
  }, [tasks]);

  return {
    tasks,
    stats,
    loading,
    statsLoading,
    fetchTasks,
    fetchStats,
    createTask,
    updateTask,
    deleteTask,
    toggleTask,
  };
};

export default useTasks;
