"use client";

import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { User, Shield, Zap, Search } from "lucide-react";

export default function Dashboard() {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();
  const [analysisHistory, setAnalysisHistory] = useState<Array<any>>([]);

  useEffect(() => {
    if (!user) {
      router.push("/");
      return;
    }

    // Load analysis history from sessionStorage or localStorage
    const history = JSON.parse(sessionStorage.getItem("analysisHistory") || "[]");
    setAnalysisHistory(history);
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="p-4">Redirecting...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <button 
            onClick={handleLogout}
            className="px-4 py-2 bg-destructive/10 text-destructive rounded hover:bg-destructive/20 transition-colors"
          >
            Logout
          </button>
        </div>

        <div className="grid gap-6">
          {/* User Info Card */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Welcome, {user.full_name || user.username}
            </h2>
            <p className="text-muted-foreground">
              Email: {user.email}
            </p>
            <p className="text-muted-foreground mt-1">
              Member since: {new Date().toLocaleDateString()}
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass rounded-xl p-4 text-center">
              <h3 className="text-lg font-bold">{analysisHistory.length}</h3>
              <p className="text-muted-foreground">Code Analyses</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <h3 className="text-lg font-bold">98%</h3>
              <p className="text-muted-foreground">Security Score</p>
            </div>
            <div className="glass rounded-xl p-4 text-center">
              <h3 className="text-lg font-bold">24/7</h3>
              <p className="text-muted-foreground">Protection Active</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="glass rounded-2xl p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Search className="w-5 h-5 text-primary" />
              Recent Activity
            </h2>
            
            {analysisHistory.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No analysis history yet. Analyze some code to get started!
              </p>
            ) : (
              <div className="space-y-4">
                {analysisHistory.slice(0, 5).map((item, index) => (
                  <div key={index} className="p-4 bg-background/50 rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-medium">{item.language?.toUpperCase() || 'UNKNOWN'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(item.timestamp || Date.now()).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {item.summary || 'Analysis completed'}
                    </p>
                    <div className="mt-2 flex gap-2">
                      <span className="px-2 py-0.5 text-xs rounded 
                        {item.risk_level === 'high' && 'bg-destructive/20 text-destructive'}
                        {item.risk_level === 'medium' && 'bg-warning/20 text-warning'}
                        {item.risk_level === 'low' && 'bg-success/20 text-success'}
                      ">
                        {item.risk_level?.toUpperCase() || 'UNKNOWN'} Risk
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}