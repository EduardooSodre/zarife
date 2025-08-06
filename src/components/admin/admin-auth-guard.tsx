'use client'

import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface AdminAuthGuardProps {
    children: React.ReactNode;
}

export function AdminAuthGuard({ children }: AdminAuthGuardProps) {
    const { isLoaded, isSignedIn, user } = useUser();
    const router = useRouter();
    const [isChecking, setIsChecking] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAdminStatus = async () => {
            if (isLoaded) {
                if (!isSignedIn) {
                    router.push('/sign-in');
                    return;
                }

                try {
                    // Verificar se o usuário é admin no banco de dados
                    const response = await fetch('/api/auth/check-admin');
                    const data = await response.json();

                    if (!data.isAdmin) {
                        router.push('/');
                        return;
                    }

                    setIsAdmin(true);
                } catch (error) {
                    console.error('Erro ao verificar status de admin:', error);
                    router.push('/');
                    return;
                }

                setIsChecking(false);
            }
        };

        checkAdminStatus();
    }, [isLoaded, isSignedIn, user, router]);

    // Loading state
    if (!isLoaded || isChecking) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Verificando permissões...</p>
                </div>
            </div>
        );
    }

    // Not signed in
    if (!isSignedIn) {
        return null;
    }

    // Not admin
    if (!isAdmin) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
                        <h2 className="text-lg font-semibold mb-2">Acesso Negado</h2>
                        <p className="text-sm">
                            Você não tem permissão para acessar o painel administrativo.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
