// TODO(NIBM2-460): once real user accounts exist, replace this handler's body with a proxy
// fetch to the real auth endpoint (or repoint LoginForm directly at that URL and delete this
// route).

import { verifyMockUser } from "@/app/api/auth/mockUsers";

export async function POST(request: Request) {
  const { email, password } = await request.json();

  const user = verifyMockUser(String(email), String(password));

  if (!user) {
    return Response.json({ message: "Invalid email or password." }, { status: 401 });
  }

  return Response.json({ ok: true, user });
}
