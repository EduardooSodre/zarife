"use client"

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, Truck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Order {
  id: string
  status: string
  total: number
}

function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<Order | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (orderId) {
      // Aqui você pode buscar os detalhes do pedido se necessário
      // Por enquanto vamos simular
      setOrder({
        id: orderId,
        status: 'PENDING',
        total: 99.99
      })
      setIsLoading(false)
    }
  }, [orderId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center" style={{ paddingTop: '100px' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '100px' }}>
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

        {order && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="text-xl">Detalhes do Pedido</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <Package className="w-8 h-8 text-primary mx-auto mb-2" />
                  <p className="font-medium">Número do Pedido</p>
                  <p className="text-sm text-gray-600">#{order.id.slice(-8).toUpperCase()}</p>
                </div>
                <div className="text-center">
                  <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="font-medium">Status</p>
                  <p className="text-sm text-gray-600">Aguardando Pagamento</p>
                </div>
                <div className="text-center">
                  <Truck className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                  <p className="font-medium">Total</p>
                  <p className="text-sm text-gray-600">€{order.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
  )
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
