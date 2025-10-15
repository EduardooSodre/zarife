"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Loader2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UpdateOrderStatusProps {
    orderId: string;
    currentStatus: string;
    currentTrackingCode?: string | null;
    onUpdate?: () => void;
}

export function UpdateOrderStatus({ orderId, currentStatus, currentTrackingCode, onUpdate }: UpdateOrderStatusProps) {
    const [status, setStatus] = useState(currentStatus);
    const [trackingCode, setTrackingCode] = useState(currentTrackingCode || "");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!status) {
            toast({
                variant: "destructive",
                title: "Erro",
                description: "Selecione um status para o pedido",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`/api/admin/orders/${orderId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    status,
                    trackingCode: trackingCode || null,
                }),
            });

            if (!response.ok) {
                throw new Error("Erro ao atualizar pedido");
            }

            toast({
                title: "Pedido atualizado!",
                description: trackingCode
                    ? `Status: ${getStatusLabel(status)}. Código de rastreamento adicionado.`
                    : `Status atualizado para: ${getStatusLabel(status)}`,
            });

            onUpdate?.();
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Erro ao atualizar",
                description: error instanceof Error ? error.message : "Erro desconhecido",
            });
        } finally {
            setLoading(false);
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            SHIPPED: "Enviado",
            DELIVERED: "Entregue",
        };
        return labels[status] || status;
    };

    return (
        <Card className="border-0 shadow-sm">
            <CardHeader className="border-b bg-gray-50">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Truck className="w-5 h-5" />
                    Atualizar Pedido
                </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Status */}
                    <div className="space-y-2">
                        <Label htmlFor="status">Status do Pedido *</Label>
                        <Select value={status} onValueChange={setStatus}>
                            <SelectTrigger id="status" className="border-gray-300 focus:border-primary focus:ring-primary">
                                <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="SHIPPED" className="cursor-pointer hover:bg-purple-50">
                                    <div className="flex items-center gap-2">
                                        <Truck className="w-4 h-4 text-purple-600" />
                                        <span>Enviado</span>
                                    </div>
                                </SelectItem>
                                <SelectItem value="DELIVERED" className="cursor-pointer hover:bg-green-50">
                                    <div className="flex items-center gap-2">
                                        <span className="w-4 h-4 flex items-center justify-center text-green-600">✓</span>
                                        <span>Entregue</span>
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500">
                            Os demais status são atualizados automaticamente pelo sistema.
                        </p>
                    </div>

                    {/* Código de Rastreamento */}
                    <div className="space-y-2">
                        <Label htmlFor="trackingCode">Código de Rastreamento CTT</Label>
                        <Input
                            id="trackingCode"
                            value={trackingCode}
                            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
                            placeholder="Ex: RR123456789PT"
                            className="uppercase"
                        />
                        <p className="text-xs text-gray-500">
                            Adicione o código fornecido pelos CTT. Ao marcar como &quot;Enviado&quot; com código, o cliente será notificado.
                        </p>
                    </div>

                    {/* Preview do Link CTT */}
                    {trackingCode && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                            <p className="text-xs text-blue-800 font-medium mb-1">Preview do Link de Rastreamento:</p>
                            <a
                                href={`https://www.ctt.pt/feapl_2/app/open/cttexpresso/objectSearch/objectSearch.jspx?objects=${trackingCode}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs text-blue-600 hover:text-blue-800 break-all"
                            >
                                Rastrear {trackingCode} no CTT →
                            </a>
                        </div>
                    )}

                    {/* Botão */}
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Atualizando...
                            </>
                        ) : (
                            "Atualizar Pedido"
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
