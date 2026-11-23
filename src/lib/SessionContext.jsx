import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { services } from "@/services";
import { setServiceHandlers } from "@/services/errors";
import { clearToken, readToken, writeToken } from "./sessionStorage";
import { can, homeForRole, ROLE_LABELS } from "./permissions";

const SessionContext = createContext(null);

export function SessionProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const token = readToken();
    if (!token) {
      setIsLoading(false);
      return () => {
        active = false;
      };
    }
    services.auth
      .me()
      .then((current) => {
        if (active) setUser(current);
      })
      .catch(() => {
        clearToken();
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setServiceHandlers({
      onUnauthorized: () => {
        services.auth.logout().catch(() => {});
        clearToken();
        setUser(null);
        if (typeof window === "undefined") return;
        if (window.location.pathname.startsWith("/login")) return;
        const returnTo = `${window.location.pathname}${window.location.search}`;
        window.location.assign(`/login?expirada=1&returnTo=${encodeURIComponent(returnTo)}`);
      },
      onForbidden: null,
    });
    return () => setServiceHandlers({ onUnauthorized: null, onForbidden: null });
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await services.auth.login(credentials);
    if (response.token) writeToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const logout = useCallback(async () => {
    try {
      await services.auth.logout();
    } catch {
      /* la sesión local se cierra de todos modos */
    }
    clearToken();
    setUser(null);
    if (typeof window !== "undefined") window.location.assign("/login");
  }, []);

  const switchRole = useCallback(async (role) => {
    const response = await services.demo.switchRole(role);
    if (response.token) writeToken(response.token);
    setUser(response.user);
    return response.user;
  }, []);

  const refresh = useCallback(async () => {
    try {
      const current = await services.auth.me();
      setUser(current);
      return current;
    } catch {
      clearToken();
      setUser(null);
      return null;
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      role: user?.role || null,
      roleLabel: user?.role ? ROLE_LABELS[user.role] : "",
      home: user?.role ? homeForRole(user.role) : "/login",
      can: (capability) => (user?.role ? can(user.role, capability) : false),
      login,
      logout,
      switchRole,
      refresh,
    }),
    [user, isLoading, login, logout, switchRole, refresh],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const context = useContext(SessionContext);
  if (!context) throw new Error("useSession debe usarse dentro de SessionProvider");
  return context;
}