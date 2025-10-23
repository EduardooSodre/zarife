"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'



import { useRouter } from 'next/navigation'
import Image from 'next/image'


function CheckoutSuccessContent() {
  type OrderItem = {
    id: string;
    product: {
      name: string;
      images?: { url: string }[];
    };
    size?: string;
    color?: string;
    quantity: number;
    price: number;
  };

  type OrderType = {
    id: string;
    status: string;
    total: number;
    items: OrderItem[];
    shippingAddress: string;
    shippingCity: string;
    shippingState: string;
    shippingPostalCode: string;
    shippingCountry: string;
    shippingComplement?: string;
    customerFirstName: string;
    customerLastName: string;
    customerEmail: string;
    customerPhone: string;
    paymentMethod: string;
    notes?: string;
  };

  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');
  const provider = searchParams.get('provider');
  const token = searchParams.get('token') || searchParams.get('paymentId') || searchParams.get('PayerID');
  const [order, setOrder] = useState<OrderType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!orderId) return;
    setIsLoading(true)
    fetch(`/api/orders/${orderId}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setOrder(data)
        } else {
          setOrder(null)
        }
        setIsLoading(false)
      })
      .catch(() => {
        setOrder(null)
        setIsLoading(false)
      })
  }, [orderId])

  // If returned from PayPal with provider=paypal and token, attempt server-side capture
  useEffect(() => {
    if (!orderId || !provider || provider !== 'paypal' || !token) return;
    // Call capture endpoint once (idempotent)
    (async () => {
      try {
        const res = await fetch('/api/paypal/capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId, token })
        });
        const json = await res.json();
        if (!res.ok) {
          console.error('PayPal capture failed on success page', json);
          // reload order to reflect any webhook changes
          const r = await fetch(`/api/orders/${orderId}`);
          const d = await r.json();
          if (d && !d.error) setOrder(d);
          return;
        }

        // Capture succeeded (or already paid) - reload order state
        const r2 = await fetch(`/api/orders/${orderId}`);
        const d2 = await r2.json();
        if (d2 && !d2.error) setOrder(d2);
      } catch (e) {
        console.error('Error calling capture endpoint', e);
      }
    })()
  }, [orderId, provider, token])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center pt-28">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Pedido não encontrado</h2>
          <p className="mb-4">Verifique se o link está correto ou entre em contato com o suporte.</p>
          <Button onClick={() => router.push('/produtos')}>Voltar para loja</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-custom-padding">
      <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-3xl font-light text-primary tracking-wider uppercase mb-2">
            Pedido Confirmado!
          </h1>
          <p className="text-gray-600">
            Obrigado pela sua compra. O seu pedido foi recebido e está a ser processado.
          </p>
        </div>

        {/* Detalhes reais do pedido */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Detalhes do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="text-center">
                <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium">Número do Pedido</p>
                <p className="text-sm text-gray-600">#{order.id.slice(-8).toUpperCase()}</p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <p className="font-medium">Status</p>
                <p className="text-sm text-gray-600">{order.status}</p>
              </div>
              <div className="text-center">
                <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <p className="font-medium">Total</p>
                <p className="text-sm text-gray-600">€{Number(order.total).toFixed(2)}</p>
              </div>
            </div>

            {/* Produtos do pedido */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Produtos</h3>
              <div className="space-y-2">
                {order.items.map((item) => (
                  <div key={item.id} className="flex items-center space-x-3">
                    <div className="relative w-12 h-12 bg-gray-100 rounded">
                      {item.product?.images?.[0]?.url && (
                        <Image src={item.product.images[0].url} alt={item.product.name} fill className="object-cover rounded" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product?.name}</p>
                      {(item.size || item.color) && (
                        <p className="text-xs text-gray-500">
                          {item.size && `Tam: ${item.size}`}
                          {item.size && item.color && ' | '}
                          {item.color && `Cor: ${item.color}`}
                        </p>
                      )}
                      <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                    </div>
                    <p className="text-sm font-medium text-gray-900">
                      €{(Number(item.price) * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Endereço de entrega */}
            <div className="mb-2">
              <h3 className="font-medium mb-1">Entrega</h3>
              <p className="text-sm text-gray-700">
                {order.shippingAddress}, {order.shippingCity}, {order.shippingState}, {order.shippingPostalCode}, {order.shippingCountry}
                {order.shippingComplement && <span> - {order.shippingComplement}</span>}
              </p>
            </div>
            <div className="mb-2">
              <h3 className="font-medium mb-1">Cliente</h3>
              <p className="text-sm text-gray-700">
                {order.customerFirstName} {order.customerLastName} | {order.customerEmail} | {order.customerPhone}
              </p>
            </div>
            <div className="mb-2">
              <h3 className="font-medium mb-1">Pagamento</h3>
              <p className="text-sm text-gray-700">
                {order.paymentMethod}
              </p>
            </div>
            {order.notes && (
              <div className="mb-2">
                <h3 className="font-medium mb-1">Observações</h3>
                <p className="text-sm text-gray-700">{order.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-lg">Próximos Passos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  1
                </div>
                <div>
                  <p className="font-medium">Confirmação por Email</p>
                  <p className="text-sm text-gray-600">
                    Receberá um email de confirmação com todos os detalhes do seu pedido.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Processamento</p>
                  <p className="text-sm text-gray-600">
                    O seu pedido será processado e preparado para envio em até 2 dias úteis.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center text-sm font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Entrega</p>
                  <p className="text-sm text-gray-600">
                    Receberá o código de rastreamento quando o produto for enviado.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center space-y-4">
          <Link href="/produtos">
            <Button className="bg-primary hover:bg-primary/90 text-white px-8 py-3 uppercase tracking-widest">
              Continuar Comprando
            </Button>
          </Link>

          <div>
            <Link href="/meus-pedidos" className="text-sm text-primary hover:underline">
              Ver os Meus Pedidos
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-blue-900 mb-2">Precisa de Ajuda?</h3>
          <p className="text-sm text-blue-700">
            Se tiver alguma dúvida sobre o seu pedido, contacte-nos pelo email{' '}
            <a href="mailto:contato@zarife.com" className="underline">
              contato@zarife.com
            </a>{' '}
            ou pelo telefone +351 912 345 678.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
