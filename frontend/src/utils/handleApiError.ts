import axios from "axios";

export function handleApiError(err: unknown) {
    if (axios.isAxiosError(err) && err.response) {
        const status = err.response.status;
        switch (status) {
            case 400:
                alert("Invalid input. Please check your fields.");
            break;
            case 401:
                alert("Login failed: incorrect username/email or password.");
            break;
            case 500:
                alert("Server error. Please try again later.");
            break;
            default:
                alert("An unexpected error occurred.");
        }
    } else {
        alert("Network error. Please check your internet connection.");
    }
}
