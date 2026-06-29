import { createContext, useContext, useEffect, useState } from "react";
import { watchAuthState, getStaffProfile } from "../lib/auth";

const AuthContext = createContext({ user: null, staff: null, loading: true });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [staff, setStaff] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = watchAuthState(async (u) => {
      setUser(u);
      if (u && !u.isAnonymous) {
        const profile = await getStaffProfile(u.uid);
        setStaff(profile);
      } else {
        setStaff(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider value={{ user, staff, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
