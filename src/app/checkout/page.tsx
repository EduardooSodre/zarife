"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useCart } from '@/contexts/cart-context'
import { useUser } from '@clerk/nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, CreditCard, Truck, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

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
  paymentMethod: 'credit' | 'debit' | 'mbway' | 'multibanco' | 'transfer'
  
  // Observações
  notes?: string
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
    paymentMethod: 'credit',
    notes: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderFinished, setOrderFinished] = useState(false)
  const [errors, setErrors] = useState<Partial<CheckoutForm>>({})

  // Cálculos
  const shipping = totalPrice > 50 ? 0 : 9.99
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Preparar dados do pedido
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
          method: form.paymentMethod
        },
        amounts: {
          subtotal: totalPrice,
          shipping: shipping,
          total: total
        },
        notes: form.notes
      }
      
      // Enviar pedido para API
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(orderData)
      })
      
      if (!response.ok) {
        throw new Error('Erro ao processar pedido')
      }
      
      const order = await response.json()
      
  // Limpar carrinho
  clearCart()
  setOrderFinished(true)
  // Redirecionar para página de sucesso
  router.push(`/checkout/success?orderId=${order.id}`)
      
    } catch (error) {
      console.error('Erro no checkout:', error)
      alert('Erro ao processar pedido. Tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50" style={{ paddingTop: '100px' }}>
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/cart" className="inline-flex items-center text-sm text-gray-600 hover:text-primary mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Carrinho
          </Link>
          <h1 className="text-3xl font-light text-primary tracking-wider uppercase">
            Finalizar Compra
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulário de Checkout */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Dados Pessoais */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <MapPin className="w-5 h-5 mr-2" />
                    Dados Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="firstName">Nome *</Label>
                      <Input
                        id="firstName"
                        value={form.firstName}
                        onChange={(e) => handleInputChange('firstName', e.target.value)}
                        className={errors.firstName ? 'border-red-500' : ''}
                      />
                      {errors.firstName && <p className="text-sm text-red-500 mt-1">{errors.firstName}</p>}
                    </div>
                    <div>
                      <Label htmlFor="lastName">Sobrenome *</Label>
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
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="phone">Telefone *</Label>
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
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Truck className="w-5 h-5 mr-2" />
                    Morada de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="address">Morada *</Label>
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
                    <Label htmlFor="complement">Complemento</Label>
                    <Input
                      id="complement"
                      value={form.complement}
                      onChange={(e) => handleInputChange('complement', e.target.value)}
                      placeholder="Apartamento, loja, etc."
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Código Postal *</Label>
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
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        className={errors.city ? 'border-red-500' : ''}
                      />
                      {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city}</p>}
                    </div>
                    <div>
                      <Label htmlFor="state">Distrito *</Label>
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

              {/* Método de Pagamento */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <CreditCard className="w-5 h-5 mr-2" />
                    Método de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Select value={form.paymentMethod} onValueChange={(value: 'credit' | 'debit' | 'mbway' | 'multibanco' | 'transfer') => handleInputChange('paymentMethod', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Cartão de Crédito</SelectItem>
                      <SelectItem value="debit">Cartão de Débito</SelectItem>
                      <SelectItem value="mbway">MB WAY</SelectItem>
                      <SelectItem value="multibanco">Multibanco</SelectItem>
                      <SelectItem value="transfer">Transferência Bancária</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Observações */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Observações</CardTitle>
                </CardHeader>
                <CardContent>
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
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <span>{shipping === 0 ? 'Grátis' : `€${shipping.toFixed(2)}`}</span>
                  </div>
                  {shipping === 0 && (
                    <p className="text-xs text-green-600">
                      ✓ Envio grátis em compras acima de €50
                    </p>
                  )}
                  <Separator />
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>€{total.toFixed(2)}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full bg-primary hover:bg-primary/90 text-white py-3 uppercase tracking-widest"
                >
                  {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Ao finalizar, você concorda com nossos termos e condições.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
