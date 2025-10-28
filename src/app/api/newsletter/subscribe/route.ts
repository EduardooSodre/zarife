import { NextResponse } from 'next/server'
import fs from 'fs/promises'
import path from 'path'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const email = body?.email?.toString().trim()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const RESEND_FROM = process.env.RESEND_FROM

    // If configured, forward to Resend
    if (RESEND_API_KEY && RESEND_FROM) {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${RESEND_API_KEY}`,
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [email],
          subject: 'Bem-vindo à newsletter da Zarife',
          html: `<p>Olá — obrigado por subscrever a nossa newsletter! 🎉</p>`,
        }),
      })

      if (!res.ok) {
        const text = await res.text().catch(() => '')
        return NextResponse.json({ error: 'Resend error', details: text }, { status: res.status || 500 })
      }

      return NextResponse.json({ ok: true })
    }

    // If not configured, provide a safe local fallback in non-production so developers can test
    if (process.env.NODE_ENV !== 'production') {
      try {
        const tmpDir = path.join(process.cwd(), 'tmp')
        await fs.mkdir(tmpDir, { recursive: true })
        const file = path.join(tmpDir, 'newsletter-subscribers.json')

        let list: Array<{ email: string; ts: string }> = []
        try {
          const txt = await fs.readFile(file, 'utf8')
          list = JSON.parse(txt)
        } catch (e) {
          // ignore - file may not exist or be invalid
        }

        list.push({ email, ts: new Date().toISOString() })
        await fs.writeFile(file, JSON.stringify(list, null, 2), 'utf8')

        console.info(`Saved newsletter subscription locally: ${email}`)
        return NextResponse.json({ ok: true, stored: 'local' })
      } catch (fsErr) {
        console.error('newsletter fs error', fsErr)
        return NextResponse.json({ error: 'Internal error' }, { status: 500 })
      }
    }

    // In production, require configuration
    return NextResponse.json({ error: 'Server not configured' }, { status: 500 })
  } catch (err) {
    console.error('newsletter subscribe error', err)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
