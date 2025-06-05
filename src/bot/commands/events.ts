import type { Dispatcher } from '@mtcute/dispatcher'
import type { TelegramClient } from '@mtcute/node'
import { html } from '@mtcute/node'

import config from '../../shared/config.js'

export default (client: TelegramClient, dp: Dispatcher) => {
  dp.deps.pelican.onConsole.add((line) => {
    let m
    if ((m = line.match(/\[Server Event\] (.+?) \[[:.0-9a-f\]]+:\d+ joins\.$/i))) {
      client.sendText(config.bot.chatId, html`<b>${m[1]}</b> joined the server`)
      return
    }

    if ((m = line.match(/\[Server Event\] Player (.+?) left\.$/i))) {
      client.sendText(config.bot.chatId, html`<b>${m[1]}</b> left the server`)
      return
    }

    if ((m = line.match(/\[Server Chat\] 0 \| (.+?): (.+)$/i))) {
      client.sendText(config.bot.chatId, html`<b>${m[1]}</b>: ${m[2]}`)
    }

    if (
      (m = line.match(/\[Server Notification\] Message to all in group 0: (A .+? temporal storm is (?:approaching|imminent))$/i)) ||
      (m = line.match(/\[Server Notification\] Message to all in group 0: (The temporal storm seems to be waning)/i))
    ) {
      client.sendText(config.bot.chatId, html`🌪️ <b>${m[1]}</b>`)
    }
  })
}
