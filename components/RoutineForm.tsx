"use client";

import { useState } from "react";

type RoutineFormProps = {
  initialItems?: string[];
  submitLabel: string;
  onSave: (items: string[]) => void;
};

export function RoutineForm({
  initialItems = [],
  submitLabel,
  onSave,
}: RoutineFormProps) {
  const [items, setItems] = useState(
    initialItems.filter((item) => item.trim().length > 0),
  );
  const [draftTask, setDraftTask] = useState("");

  const hasValidItem = items.length > 0;

  function handleAddTask() {
    const trimmed = draftTask.trim();

    if (!trimmed) {
      return;
    }

    setItems((current) => [...current, trimmed]);
    setDraftTask("");
  }

  function handleDraftKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      handleAddTask();
    }
  }

  function handleRemoveItem(index: number) {
    setItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(items);
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div>
        <label htmlFor="task-draft" className="text-sm font-medium text-foreground">
          Anchor tasks
        </label>
        <div className="mt-2 flex gap-2">
          <input
            id="task-draft"
            type="text"
            value={draftTask}
            onChange={(event) => setDraftTask(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            placeholder="Add an anchor task"
            className="flex-1 rounded border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddTask}
            disabled={!draftTask.trim()}
            className="rounded border border-border px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400"
          >
            Add
          </button>
        </div>
      </div>

      {items.length > 0 ? (
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="flex items-center justify-between gap-3 rounded border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            >
              <span>{item}</span>
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => handleRemoveItem(index)}
                className="text-sm text-muted transition-colors hover:text-foreground"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          Add at least one anchor task before saving.
        </p>
      )}

      <button
        type="submit"
        disabled={!hasValidItem}
        className="rounded border border-primary bg-surface-raised px-4 py-2 text-sm font-medium text-primary transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:text-neutral-400"
      >
        {submitLabel}
      </button>
    </form>
  );
}
