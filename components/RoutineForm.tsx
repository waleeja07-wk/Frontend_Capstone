"use client";

import { useState } from "react";

type RoutineFormProps = {
  initialItems?: string[];
  submitLabel: string;
  onSave: (items: string[]) => void;
};

export function RoutineForm({
  initialItems = [""],
  submitLabel,
  onSave,
}: RoutineFormProps) {
  const [items, setItems] = useState(initialItems.length > 0 ? initialItems : [""]);

  const hasValidItem = items.some((item) => item.trim().length > 0);

  function handleItemChange(index: number, value: string) {
    setItems((current) =>
      current.map((item, itemIndex) => (itemIndex === index ? value : item)),
    );
  }

  function handleAddItem() {
    setItems((current) => [...current, ""]);
  }

  function handleRemoveItem(index: number) {
    setItems((current) =>
      current.length === 1 ? [""] : current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSave(items);
  }

  return (
    <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Anchor tasks</p>
        {items.map((item, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={item}
              onChange={(event) => handleItemChange(index, event.target.value)}
              placeholder={`Task ${index + 1}`}
              className="flex-1 rounded-md border border-border bg-surface-raised px-3 py-2 text-sm text-foreground placeholder:text-neutral-400 focus:border-primary focus:outline-none"
            />
            <button
              type="button"
              onClick={() => handleRemoveItem(index)}
              className="rounded-md border border-border px-3 py-2 text-sm text-muted transition-colors hover:bg-neutral-100 hover:text-foreground"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={handleAddItem}
        className="rounded-md border border-border px-3 py-2 text-sm text-neutral-700 transition-colors hover:bg-neutral-100"
      >
        Add task
      </button>

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
