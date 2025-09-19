// lib/api/auth.ts
export async function loginUser(username: string, password: string) {
  try {
    const res = await fetch('http://localhost:8080/api/signin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
      credentials: 'include',
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Login failed');
    }

    return res;
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(err.message);
    } else {
      throw new Error('Unexpected error occurred');
    }
  }
}
