'use client'

import { useUser } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AdminSetupPage() {
  const { user, isLoaded } = useUser();
  interface User {
    id: string;
    email: string;
    name?: string;
    clerkId: string;
    role: string;
  }

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isLoaded) {
      loadUsers();
    }
  }, [isLoaded]);

  const loadUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();
      setUsers(data.users || []);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
      setLoading(false);
    }
  };

  const makeAdmin = async (clerkId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: clerkId, role: 'ADMIN' })
      });

      if (response.ok) {
        setMessage('✅ Usuário promovido a ADMIN com sucesso!');
        loadUsers();
      } else {
        const data = await response.json();
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch {
      setMessage('❌ Erro ao promover usuário');
    }
  };

  const makeUser = async (clerkId: string) => {
    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUserId: clerkId, role: 'USER' })
      });

      if (response.ok) {
        setMessage('✅ Usuário alterado para USER com sucesso!');
        loadUsers();
      } else {
        const data = await response.json();
        setMessage(`❌ Erro: ${data.error}`);
      }
    } catch {
      setMessage('❌ Erro ao alterar usuário');
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando usuários...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            🔧 Configuração de Administradores
          </h1>

          <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h2 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Página Temporária</h2>
            <p className="text-yellow-700">
              Esta página é apenas para configuração inicial. Use-a para definir quem serão os administradores do sistema.
            </p>
          </div>

          {message && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded">
              <p className="text-blue-800">{message}</p>
            </div>
          )}

          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Usuário Atual:</h3>
            <div className="p-3 bg-blue-50 rounded">
              <p><strong>Email:</strong> {user?.emailAddresses[0]?.emailAddress}</p>
              <p><strong>Nome:</strong> {user?.fullName || 'Não informado'}</p>
              <p><strong>Clerk ID:</strong> {user?.id}</p>
            </div>
          </div>

          <h3 className="text-lg font-semibold mb-4">Todos os Usuários do Sistema:</h3>

          <div className="space-y-3">
            {users.map((u) => (
              <div key={u.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div className="flex-1">
                  <p className="font-medium">{u.email}</p>
                  <p className="text-sm text-gray-600">{u.name || 'Nome não informado'}</p>
                  <p className="text-xs text-gray-500">ID: {u.clerkId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${u.role === 'ADMIN'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-800'
                    }`}>
                    {u.role}
                  </span>
                  <div className="flex gap-2">
                    {u.role !== 'ADMIN' && (
                      <Button
                        onClick={() => makeAdmin(u.clerkId)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700"
                      >
                        Tornar Admin
                      </Button>
                    )}
                    {u.role === 'ADMIN' && (
                      <Button
                        onClick={() => makeUser(u.clerkId)}
                        size="sm"
                        variant="outline"
                      >
                        Remover Admin
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold mb-2">📝 Instruções:</h4>
            <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
              <li>Clique em &quot;Tornar Admin&quot; no seu usuário para ter acesso ao painel</li>
              <li>Após se tornar admin, você pode acessar /admin</li>
              <li>Esta página pode ser removida após a configuração inicial</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
