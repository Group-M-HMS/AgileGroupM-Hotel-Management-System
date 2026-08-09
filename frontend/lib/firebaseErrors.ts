export function mapFirebaseAuthError(error: unknown, fallback: string): string {
  const code = (error as { code?: string })?.code ?? "";

  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found":
      return "Invalid credentials. Please try again.";
    case "auth/too-many-requests":
      return "Too many attempts. Please wait a moment and try again.";
    case "auth/email-already-in-use":
      return "An account with this email already exists.";
    case "auth/weak-password":
      return "Password is too weak. Please choose a stronger password.";
    case "auth/invalid-email":
      return "Enter a valid email address.";
    default:
      return fallback;
  }
}
