"use client";

import { createContext, useContext } from "react";
import type { AdvisorProfile, SupabaseAuthUser } from "@/lib/supabase/client";

type AuthContextValue = {
  user: SupabaseAuthUser | null;
  profile: AdvisorProfile | null;
  onLogout: () => void;
};

const AuthContext = createContext<AuthContextValue>({
  user: null,
  profile: null,
  onLogout: () => {}
});

export function AuthProvider({
  children,
  value
}: {
  children: React.ReactNode;
  value: AuthContextValue;
}) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext() {
  return useContext(AuthContext);
}
