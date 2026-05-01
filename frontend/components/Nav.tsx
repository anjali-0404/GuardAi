"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";
import { LoginModal } from "./LoginModal";
import { LogOut, User as UserIcon } from "lucide-react";

export function Nav() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const { user, logout } = useAuth();
  const router = useRouter();

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">C</span>
            </div>
            <a className="flex items-center space-x-2" href="/">
              <span className="font-bold text-xl tracking-tight">CodeGuard<span className="text-primary">AI</span></span>
            </a>
          </div>
          
           <div className="flex items-center gap-6">
             <a href="/#features" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Features</a>
             
             {user ? (
               <div className="flex items-center gap-4">
                 <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent/50 border border-border">
                   <UserIcon className="w-4 h-4 text-primary" />
                   <span className="text-sm font-medium">{user.full_name}</span>
                 </div>
                 <button 
                   onClick={logout}
                   className="p-2 hover:bg-destructive/10 hover:text-destructive rounded-full transition-all"
                   title="Logout"
                 >
                   <LogOut className="w-5 h-5" />
                 </button>
               </div>
             ) : (
               <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setIsLoginOpen(true)}
                   className="bg-primary/10 text-primary hover:bg-primary/20 px-4 py-2 rounded-full text-sm font-bold transition-all border border-primary/20"
                 >
                   Sign In
                 </button>
                 <button 
                   onClick={() => {
                     setIsLoginOpen(false);
                     router.push("/signup");
                   }}
                   className="px-4 py-2 bg-primary text-primary-foreground rounded-full font-bold transition-all hover:shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                 >
                   Sign Up
                 </button>
               </div>
             )}
           </div>
        </div>
      </nav>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
    </>
  );
}
