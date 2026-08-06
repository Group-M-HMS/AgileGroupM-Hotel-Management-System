// TODO(NIBM2-460): once real user accounts exist, replace this handler's body with a proxy
// fetch to the real auth endpoint (or repoint SignUpForm directly at that URL and delete this
// route).

import { createMockUser } from "@/app/api/auth/mockUsers";

const MIN_PASSWORD_LENGTH = 8;

export async function POST(request: Request) {
  const { email, password, firstName, lastName } = await request.json();

  if (typeof password !== "string" || password.length < MIN_PASSWORD_LENGTH) {
    return Response.json(
      { message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters.` },
      { status: 400 }
    );
  }

  const user = createMockUser({
    email: String(email),
    password: String(password),
    firstName: String(firstName),
    lastName: String(lastName),
  });

  if (!user) {
    return Response.json({ message: "An account with this email already exists." }, { status: 409 });
  }

  return Response.json({ ok: true, user });
}
