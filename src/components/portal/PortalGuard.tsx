import { type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { usePortalSession } from "@/hooks/usePortalSession";
import LoadingScreen from "@/components/LoadingScreen";

/**
 * Client-side gate for portal routes. Real authorization is enforced by
 * Supabase RLS and the edge functions — this only redirects unauthenticated
 * visitors to the login screen so they never see an empty shell.
 */
export default function PortalGuard({ children }: { children: ReactNode }) {
  const { session, loading } = usePortalSession();
  const location = useLocation();

  if (loading) return <LoadingScreen />;

  if (!session) {
    return <Navigate to="/portal/login" replace state={{ from: location.pathname }} />;
  }

  return <>{children}</>;
}
