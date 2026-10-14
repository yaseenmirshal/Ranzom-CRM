"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Icon from "@/components/ui/Icon";
import Modal from "@/components/ui/Modal";
import DeleteConfirmation from "@/components/ui/DeleteConfirmation";
import { taskRecords } from "@/data/operations-data";

type Task = (typeof taskRecords)[number];
const KEY = "ranzomtech-tasks";
const statuses = ["All tasks", "Pending", "In progress", "Completed"];

function readTasks(): Task[] {
  const value = window.localStorage.getItem(KEY);
  if (!value) return taskRecords;
  const parsed: unknown = JSON.parse(value);
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== "object" || item === null || !("title" in item) || !("status" in item))) throw new Error("Saved tasks could not be loaded.");
  if (parsed.length === 0) return [];
  return (parsed as Task[]).filter((task) => task.id > 6 || task.title === taskRecords[0].title);
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(taskRecords);
  const [status, setStatus] = useState("All tasks");
  const [ownership, setOwnership] = useState("My tasks");
  const [newTaskOpen, setNewTaskOpen] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);

  useEffect(() => { Promise.resolve().then(() => { try { setTasks(readTasks()); } catch (cause) { setError(cause instanceof Error ? cause.message : "Tasks could not be loaded."); } }); }, []);
  const filtered = useMemo(() => tasks.filter((task) =>
    (status === "All tasks" || task.status === status) &&
    (ownership === "Team tasks" || task.owner === "Workspace admin"),
  ), [ownership, status, tasks]);
  const businessTasks = tasks.filter((task) => task.id !== taskRecords[0].id);
  const overdue = businessTasks.filter((task) => task.status !== "Completed" && task.due === "Yesterday").length;

  function update(next: Task[], message: string) {
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
      setTasks(next);
      setNotice(message);
      setError("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Task changes could not be saved.");
    }
  }

  function cycleStatus(task: Task) {
    const nextStatus = task.status === "Pending" ? "In progress" : task.status === "In progress" ? "Completed" : "Pending";
    update(tasks.map((item) => item.id === task.id ? { ...item, status: nextStatus } : item), `Task marked ${nextStatus.toLowerCase()}.`);
  }

  function createTask(task: Task) {
    update([task, ...tasks], "Task added to your workspace.");
    setNewTaskOpen(false);
  }

  function deleteTask(task: Task) {
    const next = tasks.filter((item) => item.id !== task.id);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    setTasks(next);
    setNotice("Record deleted successfully.");
    setError("");
  }

  return <div className="records-page work-page">
    <header className="records-page-header"><div><div className="records-breadcrumb">Delivery <span>/</span> Work management</div><h1>Tasks</h1><p>A clear view of ownership, priorities, and what is due next.</p></div><button className="button-primary" onClick={() => setNewTaskOpen(true)} type="button"><Icon name="plus" size={16} />New task</button></header>
    <div className="task-toolbar"><div className="ownership-switch"><button aria-pressed={ownership === "My tasks"} className={ownership === "My tasks" ? "selected" : ""} onClick={() => setOwnership("My tasks")} type="button">My tasks</button><button aria-pressed={ownership === "Team tasks"} className={ownership === "Team tasks" ? "selected" : ""} onClick={() => setOwnership("Team tasks")} type="button">Team tasks</button></div><div className="task-filter-tabs">{statuses.map((item) => <button aria-pressed={status === item} className={status === item ? "selected" : ""} key={item} onClick={() => setStatus(item)} type="button">{item}{item === "All tasks" && <span>{businessTasks.length}</span>}</button>)}</div></div>
    <div className="task-highlights"><div><span>Open tasks</span><strong>{businessTasks.filter((task) => task.status !== "Completed").length}</strong></div><div className={overdue ? "task-highlight-attention" : ""}><span>Overdue</span><strong>{overdue}</strong></div><div><span>Completed</span><strong>{businessTasks.filter((task) => task.status === "Completed").length}</strong></div></div>
    {error && <div className="inline-error" role="alert">{error}</div>}{notice && <div className="inline-success" role="status"><Icon name="check" size={15} />{notice}<button aria-label="Dismiss message" onClick={() => setNotice("")} type="button">×</button></div>}
    <section className="records-surface task-list-surface"><div className="task-list-heading"><span>{ownership}</span><span>{filtered.filter((task) => task.id !== taskRecords[0].id).length} tasks{filtered.some((task) => task.id === taskRecords[0].id) && " · sample preview shown"}</span></div>{filtered.length ? filtered.map((task) => <article className={`task-record${task.status === "Completed" ? " is-completed" : ""}`} key={task.id}><button aria-label={`Change task status: ${task.title}`} className={`task-check${task.status === "Completed" ? " checked" : ""}`} onClick={() => cycleStatus(task)} type="button">{task.status === "Completed" && <Icon name="check" size={13} />}</button><div className="task-record-main"><strong>{task.title}</strong><span>{task.related}</span></div><span className={`priority-badge priority-${task.priority.toLowerCase()}`}>{task.priority}</span><span className={`task-status-badge task-status-${task.status.toLowerCase().replace(" ", "-")}`}>{task.status}</span><span className={`task-due${task.due === "Yesterday" && task.status !== "Completed" ? " overdue" : ""}`}><Icon name="calendar" size={13} />{task.due}</span><span className="task-assignee"><span className="owner-avatar avatar-blue">{task.owner.split(" ").map((part) => part[0]).join("")}</span>{task.owner}</span><button aria-label={`Advance status for ${task.title}`} className="task-more-action" onClick={() => cycleStatus(task)} type="button"><Icon name="dots" size={16} /></button><button aria-label={`Delete task: ${task.title}`} className="record-delete-action" onClick={() => setDeletingTask(task)} title="Delete task" type="button"><Icon name="trash" size={16} /></button></article>) : <div className="leads-empty-state"><h2>No tasks in this view</h2><p>{tasks.length ? "Change the filters or create a task for your team." : "Create your first task to keep work moving."}</p>{!tasks.length && <button className="button-primary" onClick={() => setNewTaskOpen(true)} type="button"><Icon name="plus" size={15} />New task</button>}</div>}</section>
    {deletingTask && <DeleteConfirmation onClose={() => setDeletingTask(null)} onDelete={() => deleteTask(deletingTask)} />}
    {newTaskOpen && <Modal description="Create a clear next step and assign ownership." onClose={() => setNewTaskOpen(false)} title="New task"><TaskForm onCancel={() => setNewTaskOpen(false)} onCreate={createTask} /></Modal>}
  </div>;
}

function TaskForm({ onCancel, onCreate }: { onCancel: () => void; onCreate: (task: Task) => void }) {
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    onCreate({ id: Date.now(), title: String(data.get("title")), related: String(data.get("related")) || "General", owner: String(data.get("owner")), priority: String(data.get("priority")), due: String(data.get("due")), status: "Pending" });
  }
  return <form className="lead-form" onSubmit={submit}><div className="lead-form-grid"><label className="form-field form-field-full"><span>Task title *</span><input autoFocus name="title" placeholder="e.g. Confirm project timeline" required /></label><label className="form-field form-field-full"><span>Related lead, client, or project</span><input name="related" placeholder="Search or enter a name" /></label><label className="form-field"><span>Assignee</span><select name="owner"><option>Workspace admin</option></select></label><label className="form-field"><span>Priority</span><select name="priority"><option>Normal</option><option>High</option><option>Low</option></select></label><label className="form-field form-field-full"><span>Due date</span><input defaultValue={new Date().toISOString().slice(0, 10)} name="due" type="date" /></label></div><div className="modal-actions"><button className="button-secondary" onClick={onCancel} type="button">Cancel</button><button className="button-primary" type="submit"><Icon name="plus" size={15} />Create task</button></div></form>;
}
