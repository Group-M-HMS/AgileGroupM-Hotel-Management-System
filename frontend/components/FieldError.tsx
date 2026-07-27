export function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="font-outfit text-[13px] text-red-500">{message}</p>;
}
