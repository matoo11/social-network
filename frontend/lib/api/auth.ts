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
            const errorText = await res.json();
            console.log('Error response body:', errorText.Feedback);
            throw new Error(errorText.Feedback || 'Login failed');
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
    avatarNumber: number;
    aboutMe: string;
}) {
    try {
        console.log('Registering user with data:', signUpData);
        const res = await fetch('http://localhost:8080/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(signUpData),
            credentials: 'include',
        });

        if (!res.ok) {
            const errorText = await res.text();
            
            // Try to parse as JSON to extract error message
            try {
                const errorData = JSON.parse(errorText);
                const errorMessage = errorData.message || errorData.error || errorData.Feedback || 'Signup failed';
                throw new Error(errorMessage);
            } catch {
                // If not JSON, use the text as is
                throw new Error(errorText || 'Signup failed');
            }
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

        if (res.status === 401) {
            throw new Error('unauthorized user');
        }

        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(errorText || 'Fetching user data failed');
        }

        const responseData = await res.json();

        if (!responseData || !responseData.data) {
            throw new Error('Current user is guest');
        }
        
        return responseData.data;
    } catch (err: unknown) {
        if (err instanceof Error) {
            throw new Error(err.message);
        } else {
            throw new Error('Unexpected error occurred');
        }
    }
}
