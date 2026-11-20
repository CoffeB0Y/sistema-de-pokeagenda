"use client";
import { useEffect, useSyncExternalStore } from "react";
import {
  isAuthenticated,
  restoreSession,
  subscribeAuth,
} from "../login/auth_service";
import Header from "./Header";
import Footer from "./Footer";
import TrainerShell from "./TrainerShell";

export default function PublicTrainerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authenticated = useSyncExternalStore(
    subscribeAuth,
    isAuthenticated,
    () => false,
  );
  useEffect(() => {
    void restoreSession();
  }, []);
  if (authenticated) return <TrainerShell>{children}</TrainerShell>;
  return (
    <>
      <Header />
      <main className="pk-container pk-page">{children}</main>
      <Footer />
    </>
  );
}
