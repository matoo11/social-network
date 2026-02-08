/**
 * Wrapper around fetch that automatically redirects to login on 401 Unauthorized
 */
export async function fetchWithAuth(
    input: RequestInfo | URL,
    init?: RequestInit
): Promise<Response> {
    const response = await fetch(input, init);

    // Check for 401 Unauthorized
    if (response.status === 401) {
        // Redirect to login page
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }

    return response;
}
