import { type Dispatcher, filters } from '@mtcute/dispatcher'
import type { TelegramClient } from '@mtcute/node'
import { html } from '@mtcute/node'

import config from '../../shared/config.js'
import { isWhitelisted } from '../utilities/is-whitelisted.js'

export default (client: TelegramClient, dp: Dispatcher) => {
  dp.onNewMessage(filters.and(isWhitelisted, filters.startsWith('!')), async (ctx) => {
    const text = ctx.text.slice(1).trim()
    if (!text || text[0] === '/') return

    await dp.deps.pelican.sendCommand(`[on behalf of ${ctx.sender.username ?? ctx.sender.displayName}] ${text}`)
      .then(() => {
        ctx.react({ emoji: '✍' }).then(() => {
          setTimeout(() => ctx.react({ emoji: null }), 3000)
        }).catch(() => {})
      })
      .catch(() => ctx.react({ emoji: '😡' }).catch(() => {}))
  })

  dp.deps.pelican.onConsole.add((line) => {
    let m
    if ((m = line.match(/\[Server Chat\] 0 \| (.+?): (.+)$/i))) {
      client.sendText(config.bot.chatId, html`<b>${m[1]}</b>: ${m[2]}`)
    }
  })
}
