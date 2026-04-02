import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import { login as apiLogin, clearToken, getToken, setToken, type LoginRequest } from "@/lib/api";

interface AuthState {
  isAuthenticated: boolean;
  tenantId: string | null;
  username: string | null;
}

interface AuthContextValue extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isAuthenticated: !!getToken(),
    tenantId: null,
    username: null,
  });

  const login = useCallback(async (data: LoginRequest) => {
    await apiLogin(data);
    setState({
      isAuthenticated: true,
      tenantId: data.tenant_id,
      username: data.username,
    });
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setState({ isAuthenticated: false, tenantId: null, username: null });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
