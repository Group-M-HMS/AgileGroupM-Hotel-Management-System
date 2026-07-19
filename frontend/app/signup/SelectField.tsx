"use client";

function ChevronDown() {
  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img src="/icons/chevron-down.svg" alt="" aria-hidden="true" className="h-4 w-4" />
  );
}

export default function SelectField({
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  error,
}: {
  placeholder: string;
  options: string[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  error?: string;
}) {
  const borderCls = error
    ? "border-red-400 focus:border-red-400"
    : "border-sand focus:border-sage";

  return (
    <div className="flex flex-1 min-w-0 flex-col gap-[4px]">
      <div className="relative">
        <select
          value={value}
          onChange={e => onChange(e.target.value)}
          onBlur={onBlur}
          className={`select-field ${borderCls} ${value ? "text-jungle" : "text-jungle/50"}`}
        >
          <option value="" disabled style={{ color: "color-mix(in srgb, var(--color-jungle) 50%, transparent)" }}>
            {placeholder}
          </option>
          {options.map(opt => (
            <option key={opt} value={opt} style={{ color: "var(--color-jungle)" }}>
              {opt}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute right-[16px] top-1/2 -translate-y-1/2">
          <ChevronDown />
        </div>
      </div>
    </div>
  );
}
