import { supabase } from "./supabase";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface PromptResponse {
    id?: string;
    response: string;
    predicted_complexity: string;
    model_used: string;
    estimated_cost: number;
    savings: number;
    response_time: number;
    input_tokens: number;
    output_tokens: number;
}

export interface HistoryItems extends PromptResponse {
    id: string;
    thread_id?: string;
    prompt: string;
    created_at: string;
    savings: number;
}

export interface Thread {
    id: string,
    title: string,
    created_at: string;
}

async function getAuthToken(): Promise<string> {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        throw new Error("User not authenticated");
    }
    return session.access_token;
}


//To send a New Prompt

export async function submitPrompt(prompt: string, thread_id?: string): Promise<PromptResponse> {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/prompt`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ prompt, thread_id }),
    });
    if (!res.ok) {
        throw new Error("Failed to submit prompt");
    }
    return res.json();

}

// To Fetch History
export async function fetchHistory(): Promise<HistoryItems[]> {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/history`, {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) {
        throw new Error("Failed to fetch history");
    }
    return res.json();
}

export async function createThread(title: string): Promise<Thread> {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/threads?title=${encodeURIComponent(title)}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });
    if (!res.ok) throw new Error("Failed to create thread");
    return res.json();
}

export async function fetchThreads(): Promise<Thread[]> {
    const token = await getAuthToken();
    const res = await fetch(`${API_BASE_URL}/api/threads`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
    });
    if (!res.ok) throw new Error("Failed to fetch threads");
    return res.json();
}


