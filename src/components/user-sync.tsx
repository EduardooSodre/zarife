"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";

export function UserSync() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    async function syncUser() {
      if (isLoaded && user) {
        try {
          const response = await fetch("/api/sync-user", {
            method: "POST",
          });
          
          if (response.ok) {
            const result = await response.json();
            console.log("Usuário sincronizado:", result.message);
          }
        } catch (error) {
          console.error("Erro ao sincronizar usuário:", error);
        }
      }
    }

    syncUser();
  }, [user, isLoaded]);

  return null; // Este componente não renderiza nada
}
