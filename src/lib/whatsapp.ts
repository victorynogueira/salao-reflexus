const WHATSAPP_PHONE_NUMBER_ID = process.env.WHATSAPP_PHONE_NUMBER_ID
const WHATSAPP_ACCESS_TOKEN = process.env.WHATSAPP_ACCESS_TOKEN
const WHATSAPP_API_URL = 'https://graph.facebook.com/v20.0'

export function isWhatsAppConfigured(): boolean {
  return !!WHATSAPP_PHONE_NUMBER_ID && !!WHATSAPP_ACCESS_TOKEN
}

export async function sendWhatsAppMessage(to: string, message: string): Promise<{ success: boolean; messageId?: string; error?: string }> {
  if (!isWhatsAppConfigured()) {
    return { success: false, error: 'WhatsApp não configurado' }
  }

  try {
    const response = await fetch(`${WHATSAPP_API_URL}/${WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace(/\D/g, ''),
        type: 'text',
        text: { body: message },
      }),
    })

    const data = await response.json()

    if (data.error) {
      console.error('WhatsApp API error:', data.error)
      return { success: false, error: data.error.message || 'Erro ao enviar mensagem' }
    }

    return { success: true, messageId: data.messages?.[0]?.id }
  } catch (error: any) {
    console.error('WhatsApp send error:', error)
    return { success: false, error: error.message || 'Erro ao conectar com WhatsApp' }
  }
}

export function generateCredentialsMessage(name: string, username: string, password: string): string {
  return `Olá, ${name}! 🌸

Seu cadastro no Salão Reflexus foi realizado com sucesso!

🔐 *Seus dados de acesso:*
👤 Usuário: *${username}*
🔑 Senha: *${password}*

Acesse: https://salao-reflexus.vercel.app/cliente

⚠️ No primeiro acesso, você deverá trocar a senha.

Qualquer dúvida, estamos à disposição! 💕`
}

export function generateLoginReminderMessage(name: string, username: string): string {
  return `Olá, ${name}! 🌸

Seus dados de acesso ao Salão Reflexus:

👤 Usuário: *${username}*

Acesse: https://salao-reflexus.vercel.app/cliente

Qualquer dúvida, estamos à disposição! 💕`
}
