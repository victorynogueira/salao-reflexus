'use client'

import { useState, useEffect, useRef } from 'react'
import ClientLayout from '@/components/layout/ClientLayout'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { MessageCircle, Send } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  id: string
  clientId: string
  from: 'client' | 'admin'
  text: string
  read: boolean
  createdAt: string
}

export default function ClientChatPage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [clientId, setClientId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const userStr = localStorage.getItem('client-user')
    if (userStr) {
      const user = JSON.parse(userStr)
      setClientId(user.id)
    }
  }, [])

  useEffect(() => {
    if (!clientId) return
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat?clientId=${clientId}`)
        const data = await res.json()
        setMessages(Array.isArray(data) ? data : [])
      } catch {}
    }
    fetchMessages()
    const interval = setInterval(fetchMessages, 3000)
    return () => clearInterval(interval)
  }, [clientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !clientId || sending) return
    setSending(true)
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, text, from: 'client' }),
      })
      setText('')
      const res = await fetch(`/api/chat?clientId=${clientId}`)
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao enviar:', error)
    } finally {
      setSending(false)
    }
  }

  return (
    <ClientLayout>
      <div className="max-w-2xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Chat</h1>
          <p className="text-gray-500 dark:text-gray-400">Fale com o salão</p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 flex flex-col h-[60vh]">
          <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
              <MessageCircle size={20} className="text-primary-600" />
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-gray-100">Salão Reflexus</p>
              <p className="text-xs text-gray-500">Geralmente responde em alguns minutos</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-gray-400">
                <MessageCircle size={40} className="mb-2 opacity-50" />
                <p className="text-sm">Nenhuma mensagem ainda</p>
                <p className="text-xs">Envie uma mensagem para o salão</p>
              </div>
            )}
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.from === 'client' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                  msg.from === 'client'
                    ? 'bg-primary-600 text-white rounded-br-sm'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
                }`}>
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.from === 'client' ? 'text-primary-200' : 'text-gray-400'}`}>
                    {format(new Date(msg.createdAt), 'HH:mm')}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex gap-2 p-4 border-t border-gray-200 dark:border-gray-700">
            <Input
              placeholder="Digite sua mensagem..."
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              className="flex-1"
            />
            <Button onClick={handleSend} disabled={!text.trim() || sending}>
              <Send size={18} />
            </Button>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}
