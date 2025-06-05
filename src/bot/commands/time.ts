import timeJob from '@/shared/jobs/time.js'

import type { BotType } from '../bot.js'

export default (bot: BotType) => {
  bot.command('time', (ctx) => {
    ctx.send('connecting to server console, please wait...')
      .then((message) => {
        timeJob.add('time', { chatId: message.chatId, messageId: message.id })
      })
  })
}
