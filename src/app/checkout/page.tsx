"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useUser } from '@clerk/nextjs'
// Button component not used here; using plain buttons with branding
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Truck, MapPin } from 'lucide-react'
// Link removed: not used after layout copy
import Image from 'next/image'
import { Button } from '@/components/ui/button'

interface CheckoutForm {
  // Dados pessoais
  firstName: string
  lastName: string
  email: string
  phone: string

  // Endereço de entrega
  address: string
  city: string
  postalCode: string
  state: string
  country: string
  complement?: string

  // Método de pagamento
  // paymentMethod removed: payment provider is chosen at finalização (Stripe / PayPal)

  // Observações
  notes?: string
}

interface OrderResponse {
  id: string
  [key: string]: unknown
}

interface PaymentSession {
  url?: string
  [key: string]: unknown
}

export default function CheckoutPage() {
  const { items, totalPrice, clearCart } = useCart()
  const { user } = useUser()
  const router = useRouter()

  const [form, setForm] = useState<CheckoutForm>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.emailAddresses[0]?.emailAddress || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    state: '',
    country: 'Portugal',
    complement: '',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderFinished, setOrderFinished] = useState(false)
  const [processingProvider, setProcessingProvider] = useState<'stripe' | 'paypal' | null>(null)
  // allow 'multibanco' processing state
  const [processingProviderMulti, setProcessingProviderMulti] = useState<'multibanco' | null>(null)
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})

  // Cálculos
  // Shipping: fixed €8 for Portugal (server also enforces Portugal-only)
  const shipping = 8.0
  const total = totalPrice + shipping

  // Redirecionar se carrinho vazio - usar useEffect para evitar SSR issues
  useEffect(() => {
    if (items.length === 0 && !orderFinished) {
      router.push('/cart')
    }
  }, [items.length, router, orderFinished])

  // Se carrinho vazio, mostrar loading
  if (items.length === 0) {
    return <div>A redirecionar...</div>
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<CheckoutForm> = {}

    if (!form.firstName.trim()) newErrors.firstName = 'Nome é obrigatório'
    if (!form.lastName.trim()) newErrors.lastName = 'Sobrenome é obrigatório'
    if (!form.email.trim()) newErrors.email = 'Email é obrigatório'
    if (!form.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
    if (!form.address.trim()) newErrors.address = 'Morada é obrigatória'
    if (!form.city.trim()) newErrors.city = 'Cidade é obrigatória'
    if (!form.postalCode.trim()) newErrors.postalCode = 'Código postal é obrigatório'
    if (!form.state.trim()) newErrors.state = 'Distrito é obrigatório'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
    // Limpar erro do campo quando usuário digita
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  // createOrder: validates form and creates the order on the server
  const createOrder = async (): Promise<OrderResponse | null> => {
    if (!validateForm()) return null

    try {
      const orderData = {
        items: items.map(item => {
          const variant: Record<string, string> = {};
          if (item.size && item.size !== 'Único') variant.size = item.size;
          if (item.color && item.color !== 'Padrão') variant.color = item.color;
          return {
            productId: item.id,
            quantity: item.quantity,
            price: item.price,
            variant: variant
          };
        }),
        customer: {
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          phone: form.phone
        },
        shipping: {
          address: form.address,
          city: form.city,
          postalCode: form.postalCode,
          state: form.state,
          country: form.country,
          complement: form.complement
        },
        payment: {
          method: 'pending'
        },
        amounts: {
          subtotal: totalPrice,
          shipping: shipping,
          total: total
        },
        notes: form.notes
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      })

      if (!response.ok) {
        // Try to parse JSON error, but server may return HTML (error page)
        const ct = response.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const errBody = await response.json()
          const body = errBody as Record<string, unknown>
          const msg = (body && typeof body === 'object' && (body.error || body.message)) ? (body.error || body.message) as string : 'Erro ao processar pedido'
          throw new Error(msg)
        } else {
          const text = await response.text()
          console.error('Non-JSON error response from /api/orders:', text)
          throw new Error('Resposta inválida do servidor ao criar pedido')
        }
      }

      const ct = response.headers.get('content-type') || ''
      let order: OrderResponse | null = null
      if (ct.includes('application/json')) {
        order = await response.json() as OrderResponse
      } else {
        const text = await response.text()
        console.error('Non-JSON response from /api/orders (expected JSON):', text)
        throw new Error('Resposta inválida do servidor ao criar pedido')
      }
      return order
    } catch (err) {
      console.error('Erro ao criar pedido:', err)
      alert('Erro ao criar pedido. ' + (err instanceof Error ? err.message : ''))
      return null
    }
  }

  // handlePayment: creates order and redirects to selected provider
  const handlePayment = async (provider: 'stripe' | 'paypal') => {
    setProcessingProvider(provider)
    setIsSubmitting(true)
    const order = await createOrder()
    if (!order) {
      setIsSubmitting(false)
      setProcessingProvider(null)
      return
    }

    try {
      const endpoint = provider === 'stripe' ? '/api/stripe/checkout' : '/api/paypal/checkout'
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.id,
          items: items.map(item => ({ name: item.name, price: item.price, quantity: item.quantity })),
          customerEmail: form.email
        })
      })

      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const body = await res.json()
          const msg = (body && typeof body === 'object' && (body.error || body.message)) ? (body.error || body.message) as string : 'Erro ao iniciar pagamento'
          throw new Error(msg)
        } else {
          const text = await res.text()
          console.error(`Non-JSON error response from ${endpoint}:`, text)
          throw new Error('Resposta inválida do servidor ao iniciar pagamento')
        }
      }

      const ct2 = res.headers.get('content-type') || ''
      let data: PaymentSession | null = null
      if (ct2.includes('application/json')) {
        data = await res.json() as PaymentSession
      } else {
        const text = await res.text()
        console.error(`Non-JSON response from ${endpoint} (expected JSON):`, text)
        throw new Error('Resposta inválida do servidor ao iniciar pagamento')
      }

      if (data && data.url) {
        clearCart()
        setOrderFinished(true)
        window.location.href = data.url
        return
      }

      throw new Error('Erro ao criar sessão de pagamento')
    } catch (err) {
      console.error('Erro ao iniciar pagamento:', err)
      alert('Erro ao iniciar pagamento. Tente novamente. ' + (err instanceof Error ? err.message : ''))
    } finally {
      setIsSubmitting(false)
      setProcessingProvider(null)
    }
  }

  // Multibanco handler: creates order then calls our /api/paypal/multibanco endpoint
  const handleMultibanco = async () => {
    setProcessingProviderMulti('multibanco')
    setIsSubmitting(true)

    const order = await createOrder()
    if (!order) {
      setIsSubmitting(false)
      setProcessingProviderMulti(null)
      return
    }

    try {
      const res = await fetch('/api/paypal/multibanco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId: order.id, fullName: `${form.firstName} ${form.lastName}` })
      })

      if (!res.ok) {
        const ct = res.headers.get('content-type') || ''
        if (ct.includes('application/json')) {
          const body = await res.json()
          const msg = (body && typeof body === 'object' && (body.error || body.message)) ? (body.error || body.message) as string : 'Erro ao iniciar Multibanco'
          throw new Error(msg)
        } else {
          const text = await res.text()
          console.error('Non-JSON error response from /api/paypal/multibanco:', text)
          throw new Error('Resposta inválida do servidor ao iniciar Multibanco')
        }
      }

      const data = await res.json()
      if (data && data.redirectUrl) {
        clearCart()
        setOrderFinished(true)
        window.location.href = data.redirectUrl
        return
      }

      throw new Error('Erro ao iniciar Multibanco')
    } catch (err) {
      console.error('Erro ao iniciar Multibanco:', err)
      alert('Erro ao iniciar Multibanco. Tente novamente. ' + (err instanceof Error ? err.message : ''))
    } finally {
      setIsSubmitting(false)
      setProcessingProviderMulti(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6">
          <Button
            variant="ghost"
            onClick={() => router.push('/cart')}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Carrinho
          </Button>
          <h1 className="max-md:text-center text-3xl font-light text-primary tracking-wider uppercase">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Formulário de Checkout */}
          <div className="lg:col-span-2 space-y-6">
            <form className="space-y-6">
              {/* Dados Pessoais */}
              <Card className="bg-white border border-gray-100 rounded-md shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-gray-900 font-medium">
                    <MapPin className="w-5 h-5 mr-2 text-gray-600" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName" className="mb-1 text-sm text-gray-700">Nome *</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName" className="mb-1 text-sm text-gray-700">Sobrenome *</Label>
                      <Input
                        id="lastName"
                        value={form.lastName}
                        onChange={(e) => handleInputChange('lastName', e.target.value)}
                        className={errors.lastName ? 'border-red-500' : ''}
                      />
                      {errors.lastName && <p className="text-sm text-red-500 mt-1">{errors.lastName}</p>}
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email" className="mb-1 text-sm text-gray-700">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={form.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className={errors.email ? 'border-red-500' : ''}
                      />
                      {errors.email && <p className="text-sm text-red-500 mt-1">{errors.email}</p>}
                    </div>
                    <div>
                      <Label htmlFor="phone" className="mb-1 text-sm text-gray-700">Telefone *</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="+351 912 345 678"
                        className={errors.phone ? 'border-red-500' : ''}
                      />
                      {errors.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Endereço de Entrega */}
              <Card className="bg-white border border-gray-100 rounded-md shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg text-gray-900 font-medium">
                    <Truck className="w-5 h-5 mr-2 text-gray-600" />
                    Morada de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-2 space-y-3">
                  <div>
                    <Label htmlFor="address" className="mb-1 text-sm text-gray-700">Morada *</Label>
                    <Input
                      id="address"
                      value={form.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      placeholder="Rua, número, andar"
                      className={errors.address ? 'border-red-500' : ''}
                    />
                    {errors.address && <p className="text-sm text-red-500 mt-1">{errors.address}</p>}
                  </div>
                  <div>
                    <Label htmlFor="complement" className="mb-1 text-sm text-gray-700">Complemento</Label>
                    <Input
                      id="complement"
                      value={form.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      placeholder="Apartamento, loja, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="postalCode" className="mb-1 text-sm text-gray-700">Código Postal *</Label>
                      <Input
                        id="postalCode"
                        value={form.postalCode}
                        onChange={(e) => handleInputChange('postalCode', e.target.value)}
                        placeholder="0000-000"
                        className={errors.postalCode ? 'border-red-500' : ''}
                      />
                      {errors.postalCode && <p className="text-sm text-red-500 mt-1">{errors.postalCode}</p>}
                    </div>
                    <div>
                      <Label htmlFor="city" className="mb-1 text-sm text-gray-700">Cidade *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state" className="mb-1 text-sm text-gray-700">Distrito *</Label>
                      <Select value={form.state} onValueChange={(value) => handleInputChange('state', value)}>
                        <SelectTrigger className={errors.state ? 'border-red-500' : ''}>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Aveiro">Aveiro</SelectItem>
                          <SelectItem value="Beja">Beja</SelectItem>
                          <SelectItem value="Braga">Braga</SelectItem>
                          <SelectItem value="Bragança">Bragança</SelectItem>
                          <SelectItem value="Castelo Branco">Castelo Branco</SelectItem>
                          <SelectItem value="Coimbra">Coimbra</SelectItem>
                          <SelectItem value="Évora">Évora</SelectItem>
                          <SelectItem value="Faro">Faro</SelectItem>
                          <SelectItem value="Guarda">Guarda</SelectItem>
                          <SelectItem value="Leiria">Leiria</SelectItem>
                          <SelectItem value="Lisboa">Lisboa</SelectItem>
                          <SelectItem value="Portalegre">Portalegre</SelectItem>
                          <SelectItem value="Porto">Porto</SelectItem>
                          <SelectItem value="Santarém">Santarém</SelectItem>
                          <SelectItem value="Setúbal">Setúbal</SelectItem>
                          <SelectItem value="Viana do Castelo">Viana do Castelo</SelectItem>
                          <SelectItem value="Vila Real">Vila Real</SelectItem>
                          <SelectItem value="Viseu">Viseu</SelectItem>
                          <SelectItem value="Açores">Açores</SelectItem>
                          <SelectItem value="Madeira">Madeira</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.state && <p className="text-sm text-red-500 mt-1">{errors.state}</p>}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Método de Pagamento removido: escolha do provedor (Stripe / PayPal) na finalização */}

              {/* Observações */}
              <Card className="bg-white border border-gray-100 rounded-md shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg text-gray-900 font-medium">Observações</CardTitle>
                </CardHeader>
                <CardContent className="pt-2">
                  <Textarea
                    value={form.notes}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('notes', e.target.value)}
                    placeholder="Observações sobre a entrega..."
                    rows={3}
                  />
                </CardContent>
              </Card>
            </form>
          </div>

          {/* Resumo do Pedido */}
          <div className="lg:col-span-1 space-y-6">
            <Card className="sticky top-24 bg-white border border-gray-100 rounded-md shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg text-gray-900 font-medium">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="pt-2 space-y-3">
                {/* Produtos */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div key={`${item.id}-${item.size}-${item.color}`} className="flex items-center space-x-3">
                      <div className="relative w-16 h-16 bg-gray-100 rounded">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
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
                        €{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Totais */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>€{totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Envio</span>
                    <span>€{shipping.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <div className="flex flex-col gap-4 items-stretch">
                  {/* Stripe */}
                  <Button
                    onClick={() => handlePayment('stripe')}
                    disabled={isSubmitting}
                    variant="ghost"
                    size="default"
                    className="w-full inline-flex items-center gap-3 text-white rounded-lg px-4 min-h-[56px] shadow-sm hover:shadow-lg transition-shadow duration-150 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-200 disabled:opacity-60"
                    style={{ backgroundColor: 'rgba(100,92,255)', border: '1px solid rgba(0,0,0,0.06)' }}
                    aria-label="Pagar com Stripe"
                  >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
                      <Image src="/stripe-logos/stripe.webp" alt="Stripe" width={34} height={20} className="object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{isSubmitting && processingProvider === 'stripe' ? 'Processando...' : 'Pagar com Stripe'}</div>
                      <div className="text-sm text-white">Cartão de crédito</div>
                    </div>
                  </Button>

                  {/* PayPal */}
                  <Button
                    onClick={() => handlePayment('paypal')}
                    disabled={isSubmitting}
                    variant="ghost"
                    size="default"
                    className="w-full inline-flex items-center gap-3 text-black rounded-lg px-4 min-h-[56px] shadow-sm hover:shadow-lg transition-shadow duration-150 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-200 disabled:opacity-60"
                    style={{ backgroundColor: '#FFC439' }}
                    aria-label="Pagar com PayPal"
                  >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center">
                      <Image src="/paypal-logos/Paypal-2png.webp" alt="PayPal" width={34} height={20} className="object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{isSubmitting && processingProvider === 'paypal' ? 'Processando...' : 'Pagar com PayPal'}</div>
                      <div className="text-sm text-black/85">Checkout seguro</div>
                    </div>
                  </Button>

                  {/* Multibanco */}
                  <Button
                    onClick={() => handleMultibanco()}
                    disabled={isSubmitting}
                    variant="ghost"
                    size="default"
                    className="w-full inline-flex items-center gap-3 text-gray-900 rounded-lg px-4 min-h-[56px] shadow-sm hover:shadow-lg transition-shadow duration-150 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-sky-200 disabled:opacity-60"
                    style={{ backgroundColor: 'rgba(255,255,255,0.94)', border: '1px solid rgba(0,0,0,0.06)' }}
                    aria-label="Pagar com Multibanco"
                  >
                    <div className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded bg-white">
                      <Image src="/multibanco-logos/multiBanco.webp" alt="Multibanco" width={34} height={20} className="object-contain" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="text-base font-semibold">{isSubmitting && processingProviderMulti === 'multibanco' ? 'Processando...' : 'Pagar com Multibanco'}</div>
                      <div className="text-sm text-gray-700">Pagamento por referência</div>
                    </div>
                  </Button>
                </div>

                <p className="text-xs text-gray-500 text-center">
                  Ao finalizar, concorda com os nossos termos e condições.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
