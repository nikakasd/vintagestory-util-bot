import type { Dispatcher } from '@mtcute/dispatcher'
import { filters } from '@mtcute/dispatcher'
import { html, type Message, type TelegramClient } from '@mtcute/node'

import { isWhitelisted } from '../utilities/is-whitelisted.js'

export default (client: TelegramClient, dp: Dispatcher) => {
  let onlinePendingMsg: Message | null = null

  dp.onNewMessage(filters.and(isWhitelisted, filters.command('online')), async (ctx) => {
    if (onlinePendingMsg) return
    onlinePendingMsg = await ctx.answerText('connecting to server console, please wait...')
    await dp.deps.pelican.sendCommand('/stats')
  })

  dp.deps.pelican.onConsole.add((line) => {
    let m
    if ((m = line.match(/^Players online: (\d+ \/ \d+ \(.+\))/)) && onlinePendingMsg) {
      client.editMessage({
        message: onlinePendingMsg,
        text: html`<b>Players online:</b> ${m[1]}`,
      })
      onlinePendingMsg = null
    }
  })
}
