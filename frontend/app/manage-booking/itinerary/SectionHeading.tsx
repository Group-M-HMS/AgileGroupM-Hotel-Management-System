export function SectionHeading({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 font-fraunces text-[18px] font-medium text-jungle-dark">
      <span className="material-symbols-outlined text-jungle/60" style={{ fontSize: "20px" }} aria-hidden="true">
        {icon}
      </span>
      {children}
    </h2>
  );
}
