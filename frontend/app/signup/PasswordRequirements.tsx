const RULES: { label: string; test: (password: string) => boolean }[] = [
  { label: "At least 8 characters", test: p => p.length >= 8 },
  { label: "Includes uppercase and lowercase letters", test: p => /(?=.*[a-z])(?=.*[A-Z])/.test(p) },
  { label: "Includes a number", test: p => /\d/.test(p) },
];

export function PasswordRequirements({ password }: { password: string }) {
  return (
    <ul className="flex flex-col gap-1 pt-1">
      {RULES.map(rule => {
        const met = rule.test(password);
        return (
          <li
            key={rule.label}
            className={`flex items-center gap-1.5 font-jakarta text-[12px] ${
              met ? "text-jungle-light" : "text-jungle/50"
            }`}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "14px" }} aria-hidden="true">
              {met ? "check_circle" : "radio_button_unchecked"}
            </span>
            {rule.label}
          </li>
        );
      })}
    </ul>
  );
}
