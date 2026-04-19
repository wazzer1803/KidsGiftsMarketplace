type SectionTitleProps = {
  eyebrow?: string;
  title: string;
  subtitle?: string;
};

export default function SectionTitle({ eyebrow, title, subtitle }: SectionTitleProps) {
  return (
    <div className="mb-6 md:mb-8">
      {eyebrow ? (
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-primary">{eyebrow}</p>
      ) : null}
      <h2 className="break-words text-[1.75rem] font-black leading-tight tracking-tight text-on-surface sm:text-3xl md:text-5xl">
        {title}
      </h2>
      {subtitle ? <p className="mt-2 max-w-3xl text-on-surface-variant md:text-lg">{subtitle}</p> : null}
    </div>
  );
}
