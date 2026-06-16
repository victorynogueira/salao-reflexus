'use client'

import { useState, useEffect } from 'react'
import { Plus, Share, Download, X } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function PWAInstallPrompt() {
  const [showInstall, setShowInstall] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null)

  useEffect(() => {
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true

    setIsIOS(isIOSDevice)
    setIsStandalone(isStandaloneMode)

    if (isStandaloneMode) return

    const dismissed = localStorage.getItem('pwa-install-dismissed')
    const dismissedDate = dismissed ? new Date(dismissed) : null
    if (dismissedDate && Date.now() - dismissedDate.getTime() < 7 * 24 * 60 * 60 * 1000) return

    if (isIOSDevice) {
      setShowInstructions(true)
      return
    }

    const handler = (e: any) => {
      e.preventDefault()
      setDeferredPrompt(e)
      setShowInstall(true)
    }

    window.addEventListener('beforeinstallprompt', handler)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setShowInstall(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShowInstall(false)
    setShowInstructions(false)
    localStorage.setItem('pwa-install-dismissed', new Date().toISOString())
  }

  if (isStandalone) return null
  if (!showInstall && !showInstructions) return null

  return (
    <>
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-slide-in">
        <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-600 to-primary-700 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Download size={20} className="text-white" />
              </div>
              <div>
                <h3 className="text-white font-semibold">Instalar Aplicativo</h3>
                <p className="text-white/80 text-sm">Acesse mais rápido!</p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-white/80 hover:text-white p-1">
              <X size={20} />
            </button>
          </div>

          {isIOS ? (
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Para instalar no iPhone:
              </p>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-lg">1.</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Toque no botão Compartilhar</span>
                <Share size={18} className="text-primary-600 ml-auto" />
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                <span className="text-lg">2.</span>
                <span className="text-sm text-gray-700 dark:text-gray-300">Selecione "Adicionar à Tela de Início"</span>
                <Plus size={18} className="text-primary-600 ml-auto" />
              </div>
              <Button onClick={handleDismiss} className="w-full" size="sm">
                Entendi
              </Button>
            </div>
          ) : (
            <div className="p-4 space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Instale o app para acesso rápido e offline!
              </p>
              <div className="flex gap-2">
                <Button variant="secondary" size="sm" onClick={handleDismiss} className="flex-1">
                  Depois
                </Button>
                <Button size="sm" onClick={handleInstall} className="flex-1">
                  <Download size={16} />
                  Instalar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
