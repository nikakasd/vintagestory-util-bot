import { getServerTime } from '../../shared/jobs/time.js'
import type { BotType } from '../bot.js'

export default (bot: BotType) => {
  bot.command('time', (ctx) => {
    ctx.send('connecting to server console, please wait...')
      .then((message) => {
        getServerTime({ chatId: message.chatId, messageId: message.id })
      })
  })
}
