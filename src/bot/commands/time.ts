import type { Dispatcher } from '@mtcute/dispatcher'
import { filters } from '@mtcute/dispatcher'
import { html, type Message, type TelegramClient } from '@mtcute/node'

import { isWhitelisted } from '../utilities/is-whitelisted.js'

export default (client: TelegramClient, dp: Dispatcher) => {
  let timePendingMsg: Message | null = null

  dp.onNewMessage(filters.and(isWhitelisted, filters.command('time')), async (ctx) => {
    if (timePendingMsg) return
    timePendingMsg = await ctx.answerText('connecting to server console, please wait...')
    await dp.deps.pelican.sendCommand('/time')
  })

  dp.deps.pelican.onConsole.add((line) => {
    let m
    if ((m = line.match(/\[Server Notification\] Server time: (.+)/)) && timePendingMsg) {
      client.editMessage({
        message: timePendingMsg,
        text: html`<b>Server time:</b> ${m[1]}`,
      })
      timePendingMsg = null
    }
  })
}
