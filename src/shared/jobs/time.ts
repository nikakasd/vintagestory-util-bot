import { bot } from '@/bot/bot.js'

import config from '../config.js'
import { PelicanService } from '../services/pelican/pelican.js'
import type { PelicanWebsocketMessage } from '../services/pelican/types.js'

export async function getServerTime (params: {
  chatId: number
  messageId: number
}) {
  try {
    const pelican = new PelicanService({
      url: config.pelican.url,
      token: config.pelican.token,
    })

    const wsResponse = await pelican.getServerWebsocket(config.pelican.serverId)
    const ws = new WebSocket(wsResponse.data.socket)

    ws.addEventListener('open', () => {
      ws.send(JSON.stringify({
        event: 'auth',
        args: [wsResponse.data.token],
      }))
    })

    ws.addEventListener('message', async (evt) => {
      const { event, args } = JSON.parse(evt.data) as PelicanWebsocketMessage

      if (event === 'auth success') {
        await pelican.sendCommand(config.pelican.serverId, '/time')
      }

      if (event === 'console output' && args[0].match(/Server time: (.+)/)) {
        const time = args[0].match(/Server time: (.+)/)?.[1]
        ws.close()

        await bot.api.editMessageText({
          chat_id: params.chatId,
          message_id: params.messageId,
          text: `<b>Server time:</b> ${time}`,
          parse_mode: 'HTML',
        })
      }
    })
  } catch (error) {
    console.error(error)
  }
}
