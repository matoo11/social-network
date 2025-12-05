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

        const responseData = await res.json();

        console.log('Login response:', responseData.data);
        return responseData.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('Unexpected error occurred');
        }
    }
}

export async function registerUser(signUpData: {
    dateOfBirth: string;
    username: string;
    nickname: string;
    email: string;
    password: string;
    confirmPassword: string;
    firstName: string;
    lastName: string;
    gender: string;
}) {
    try {
        console.log('Registering user with data:', signUpData);
        debugger;
        const res = await fetch('http://localhost:8080/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signUpData),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Signup failed');
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

export async function logoutUser() {
    try {
        const res = await fetch('http://localhost:8080/api/signout', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Logout failed');
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

export async function fetchUserData() {
    try {
        const res = await fetch('http://localhost:8080/api/getUserData', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
        });

        console.log('Response received for fetchUserData:', res);

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Fetching user data failed');
        }

        const data = await res.json();
        console.log('Fetched user data:', data);
        return data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('Unexpected error occurred');
        }
    }
}
