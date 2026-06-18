'use client'

import { useState, useEffect, useRef } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { MessageCircle, Send, ArrowLeft, Search, Plus } from 'lucide-react'
import { format } from 'date-fns'

interface Message {
  id: string
  clientId: string
  from: 'client' | 'admin'
  text: string
  read: boolean
  createdAt: string
}

interface Conversation {
  clientId: string
  clientName: string
  count: number
  lastMessage: string
  lastTime: string
}

interface ClientSummary {
  id: string
  name: string
  phone: string
}

export default function ChatPanel({ initialClientId }: { initialClientId?: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [totalUnread, setTotalUnread] = useState(0)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(initialClientId || null)
  const [selectedClientName, setSelectedClientName] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [messageText, setMessageText] = useState('')
  const [sending, setSending] = useState(false)
  const [search, setSearch] = useState('')
  const [allClients, setAllClients] = useState<ClientSummary[]>([])
  const [showSearch, setShowSearch] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const hasChatOpen = !initialClientId

  useEffect(() => {
    fetch('/api/clients').then(r => r.json()).then(data => {
      setAllClients(Array.isArray(data) ? data.map((c: any) => ({ id: c.id, name: c.name, phone: c.phone })) : [])
    }).catch(() => {})
  }, [])

  useEffect(() => {
    if (hasChatOpen) {
      fetch('/api/chat/unread').then(r => r.json()).then(data => {
        setConversations(data.conversations || [])
        setTotalUnread(data.total || 0)
      }).catch(() => {})
    }
  }, [hasChatOpen])

  useEffect(() => {
    if (selectedClientId) {
      fetch(`/api/chat?clientId=${selectedClientId}`).then(r => r.json()).then(data => {
        setMessages(Array.isArray(data) ? data : [])
      }).catch(() => {})
    }
  }, [selectedClientId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSelectConversation = async (clientId: string) => {
    setSelectedClientId(clientId)
    const client = allClients.find(c => c.id === clientId)
    if (client) setSelectedClientName(client.name)
    const [msgsRes, unreadRes] = await Promise.all([
      fetch(`/api/chat?clientId=${clientId}`),
      fetch('/api/chat/unread'),
    ])
    const msgs: Message[] = await msgsRes.json()
    setMessages(Array.isArray(msgs) ? msgs : [])
    const unreadData = await unreadRes.json()
    const conv = (unreadData.conversations || []).find((c: any) => c.clientId === clientId)
    if (conv && conv.count > 0 && Array.isArray(msgs)) {
      for (const msg of msgs) {
        if (!msg.read && msg.from === 'client') {
          await fetch(`/api/chat/${msg.id}/read`, { method: 'PUT' })
        }
      }
      fetch('/api/chat/unread').then(r => r.json()).then(data => {
        setConversations(data.conversations || [])
        setTotalUnread(data.total || 0)
      })
    }
    setShowSearch(false)
    setSearch('')
  }

  const handleSend = async () => {
    if (!messageText.trim() || !selectedClientId || sending) return
    setSending(true)
    try {
      await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId: selectedClientId, text: messageText, from: 'admin' }),
      })
      setMessageText('')
      const res = await fetch(`/api/chat?clientId=${selectedClientId}`)
      const data = await res.json()
      setMessages(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Erro ao enviar:', error)
    } finally {
      setSending(false)
    }
  }

  const handleBack = () => {
    setSelectedClientId(null)
    setSelectedClientName('')
    if (hasChatOpen) {
      fetch('/api/chat/unread').then(r => r.json()).then(data => {
        setConversations(data.conversations || [])
        setTotalUnread(data.total || 0)
      })
    }
  }

  const filteredClients = allClients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search)
  )

  const allConversationIds = new Set(conversations.map(c => c.clientId))
  const clientsWithoutChat = filteredClients.filter(c => !allConversationIds.has(c.id))

  if (selectedClientId) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
          {hasChatOpen && (
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ArrowLeft size={18} />
            </Button>
          )}
          <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-semibold text-sm shrink-0">
            {selectedClientName?.charAt(0).toUpperCase() || '?'}
          </div>
          <span className="font-medium text-gray-900 dark:text-gray-100 truncate">
            {selectedClientName || 'Cliente'}
          </span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {messages.length === 0 && (
            <p className="text-center text-gray-400 text-sm py-8">Nenhuma mensagem ainda</p>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.from === 'admin' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-3 py-2 rounded-xl text-sm ${
                msg.from === 'admin'
                  ? 'bg-primary-600 text-white rounded-br-sm'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm'
              }`}>
                <p>{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.from === 'admin' ? 'text-primary-200' : 'text-gray-400'}`}>
                  {format(new Date(msg.createdAt), 'HH:mm')}
                </p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="flex gap-2 p-3 border-t border-gray-200 dark:border-gray-700">
          <Input
            placeholder="Digite sua mensagem..."
            value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
            className="flex-1"
          />
          <Button onClick={handleSend} disabled={!messageText.trim() || sending}>
            <Send size={18} />
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <MessageCircle size={18} />
            Mensagens
            {totalUnread > 0 && (
              <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{totalUnread}</span>
            )}
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowSearch(!showSearch)}>
            <Search size={16} />
          </Button>
        </div>

        {showSearch && (
          <div className="space-y-2">
            <Input
              placeholder="Buscar cliente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && clientsWithoutChat.length > 0 && (
              <div className="max-h-40 overflow-y-auto space-y-1">
                <p className="text-[10px] text-gray-400 font-medium uppercase">Iniciar conversa</p>
                {clientsWithoutChat.slice(0, 10).map(client => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectConversation(client.id)}
                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-semibold text-sm shrink-0">
                      {client.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.phone}</p>
                    </div>
                    <Plus size={14} className="ml-auto text-gray-400" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {conversations.length === 0 ? (
          <div className="text-center py-8">
            <MessageCircle size={32} className="mx-auto mb-2 text-gray-300 dark:text-gray-600" />
            <p className="text-sm text-gray-400">Nenhuma conversa</p>
            <p className="text-xs text-gray-400 mt-1">Busque um cliente acima para iniciar</p>
          </div>
        ) : (
          <div className="space-y-1">
            {conversations.map(conv => (
              <button
                key={conv.clientId}
                onClick={() => handleSelectConversation(conv.clientId)}
                className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 font-semibold shrink-0">
                  {conv.clientName.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">{conv.clientName}</p>
                    {conv.count > 0 && (
                      <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full ml-2">{conv.count}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{conv.lastMessage}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
