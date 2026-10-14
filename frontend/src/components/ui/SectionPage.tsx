type SectionPageProps = {
  title: string;
  description: string;
};

export default function SectionPage({
  title,
  description,
}: SectionPageProps) {
  return (
    <section className="mx-auto w-full max-w-6xl p-6 sm:p-8">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-2 text-sm text-zinc-500">{description}</p>
    </section>
  );
}
