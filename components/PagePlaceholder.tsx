type PagePlaceholderProps = {
  title: string;
  description?: string;
};

export function PagePlaceholder({ title, description }: PagePlaceholderProps) {
  return (
    <section className="mx-auto w-full max-w-3xl">
      <h1 className="text-2xl font-medium tracking-tight text-foreground md:text-3xl">
        {title}
      </h1>
      <p className="mt-3 text-muted">
        {description ?? "Coming soon — this page is part of the Daybook skeleton."}
      </p>
    </section>
  );
}
