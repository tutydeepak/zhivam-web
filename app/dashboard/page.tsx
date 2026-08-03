"use client";

import { useAuth } from "@/context/AuthContext";

export default function DashboardPage() {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-[#080c14] text-white flex items-center justify-center">
            <div>
                <h1 className="text-2xl font-bold">Welcome, {user?.displayName || user?.email}</h1>
                <p className="text-slate-400 mt-2">You're logged in.</p>
            </div>
        </div>
    );

    
}