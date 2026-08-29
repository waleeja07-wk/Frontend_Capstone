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
            placeholder="Add an anchor task..."
            className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-primary focus:outline-none"
          />
          <button
            type="button"
            onClick={handleAddTask}
            disabled={!draftTask.trim()}
            className="rounded-md border border-border px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100 disabled:cursor-not-allowed disabled:text-neutral-400"
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
              className="flex items-center justify-between gap-3 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground"
            >
              <span>{item}</span>
              <button
                type="button"
                aria-label={`Remove ${item}`}
                onClick={() => handleRemoveItem(index)}
                className="rounded-md px-2 py-1 text-muted transition-colors hover:bg-neutral-100 hover:text-foreground"
              >
                x
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted">
          Add at least one anchor task to save your routine.
        </p>
      )}

      <button
        type="submit"
        disabled={!hasValidItem}
        className="block rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-muted disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500"
      >
        {submitLabel}
      </button>
    </form>
  );
}
