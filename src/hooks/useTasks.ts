import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DerivedTask, Metrics, Task } from '@/types';
import {
  computeAverageROI,
  computePerformanceGrade,
  computeRevenuePerHour,
  computeTimeEfficiency,
  computeTotalRevenue,
  withDerived,
  sortTasks as sortDerived,
} from '@/utils/logic';
import { generateSalesTasks } from '@/utils/seed';

interface UseTasksState {
  tasks: Task[];
  loading: boolean;
  error: string | null;
  derivedSorted: DerivedTask[];
  metrics: Metrics;
  lastDeleted: Task | null;
  addTask: (task: Omit<Task, 'id'> & { id?: string }) => void;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  undoDelete: () => void;
}

const INITIAL_METRICS: Metrics = {
  totalRevenue: 0,
  totalTimeTaken: 0,
  timeEfficiencyPct: 0,
  revenuePerHour: 0,
  averageROI: 0,
  performanceGrade: 'Needs Improvement',
};

// ✅ Shared across all hook instances (StrictMode-safe)
let globalFetched = false;

export function useTasks(): UseTasksState {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastDeleted, setLastDeleted] = useState<Task | null>(null);

  // ---------------- Normalize Tasks ----------------
  function normalizeTasks(input: any[]): Task[] {
    const now = Date.now();
    return (Array.isArray(input) ? input : []).map((t, idx) => {
      const created = t.createdAt
        ? new Date(t.createdAt)
        : new Date(now - (idx + 1) * 24 * 3600 * 1000);
      const completed =
        t.completedAt ||
        (t.status === 'Done'
          ? new Date(created.getTime() + 24 * 3600 * 1000).toISOString()
          : undefined);
      return {
        id: t.id ?? crypto.randomUUID(),
        title: t.title || `Untitled Task ${idx + 1}`,
        revenue: Number(t.revenue) > 0 ? Number(t.revenue) : 100,
        timeTaken: Number(t.timeTaken) > 0 ? Number(t.timeTaken) : 1,
        priority: t.priority || 'Medium',
        status: t.status || 'Todo',
        notes: t.notes || '',
        createdAt: created.toISOString(),
        completedAt: completed,
      } as Task;
    });
  }

  // ---------------- Initial Load ----------------
  useEffect(() => {
    if (globalFetched) {
      console.log('🟡 Skipping duplicate fetch (StrictMode double render)');
      setLoading(false);
      return;
    }
    globalFetched = true;

    let isMounted = true;

    async function load() {
      console.log('🔄 Loading tasks...');
      try {
        const res = await fetch('/tasks.json');
        console.log('📡 Fetch response:', res.status);

        if (!res.ok) throw new Error(`Failed to load tasks.json (${res.status})`);

        const rawText = await res.text();
        console.log('📦 Data preview:', rawText.slice(0, 120) + '...');

        const data = JSON.parse(rawText) as any[];
        const normalized = normalizeTasks(data);
        const finalData =
          normalized.length > 0 ? normalized : generateSalesTasks(20);

        if (isMounted) {
          setTasks(finalData);
          console.log('✅ Tasks loaded:', finalData.length);
        }
      } catch (e: any) {
        console.error('❌ Fetch error:', e);

        if (isMounted) setError(e?.message ?? 'Failed to load tasks');
        const fallback = generateSalesTasks(15);
        if (isMounted) {
          setTasks(fallback);
          console.log('🧩 Fallback tasks generated');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log('🟢 Loading complete');
        }
      }
    }

    load();
    return () => {
      isMounted = false;
    };
  }, []);

  // ---------------- Derived Data ----------------
  const derivedSorted = useMemo<DerivedTask[]>(() => {
    const withRoi = tasks.map(withDerived);
    return sortDerived(withRoi);
  }, [tasks]);

  const metrics = useMemo<Metrics>(() => {
    if (tasks.length === 0) return INITIAL_METRICS;
    const totalRevenue = computeTotalRevenue(tasks);
    const totalTimeTaken = tasks.reduce((s, t) => s + t.timeTaken, 0);
    const timeEfficiencyPct = computeTimeEfficiency(tasks);
    const revenuePerHour = computeRevenuePerHour(tasks);
    const averageROI = computeAverageROI(tasks);
    const performanceGrade = computePerformanceGrade(averageROI);
    return {
      totalRevenue,
      totalTimeTaken,
      timeEfficiencyPct,
      revenuePerHour,
      averageROI,
      performanceGrade,
    };
  }, [tasks]);

  // ---------------- CRUD Actions ----------------
  const addTask = useCallback((task: Omit<Task, 'id'> & { id?: string }) => {
    setTasks((prev) => {
      const id = task.id ?? crypto.randomUUID();
      const timeTaken = task.timeTaken <= 0 ? 1 : task.timeTaken;
      const createdAt = new Date().toISOString();
      const status = task.status;
      const completedAt = status === 'Done' ? createdAt : undefined;
      return [...prev, { ...task, id, timeTaken, createdAt, completedAt }];
    });
  }, []);

  const updateTask = useCallback((id: string, patch: Partial<Task>) => {
    setTasks((prev) => {
      const next = prev.map((t) => {
        if (t.id !== id) return t;
        const merged = { ...t, ...patch } as Task;
        if (
          t.status !== 'Done' &&
          merged.status === 'Done' &&
          !merged.completedAt
        ) {
          merged.completedAt = new Date().toISOString();
        }
        return merged;
      });
      return next.map((t) =>
        t.id === id && (patch.timeTaken ?? t.timeTaken) <= 0
          ? { ...t, timeTaken: 1 }
          : t
      );
    });
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === id) || null;
      setLastDeleted(target);
      return prev.filter((t) => t.id !== id);
    });
  }, []);

  const undoDelete = useCallback(() => {
    if (!lastDeleted) return;
    setTasks((prev) => [...prev, lastDeleted]);
    setLastDeleted(null);
  }, [lastDeleted]);

  // ---------------- Return Hook Values ----------------
  return {
    tasks,
    loading,
    error,
    derivedSorted,
    metrics,
    lastDeleted,
    addTask,
    updateTask,
    deleteTask,
    undoDelete,
  };
}
