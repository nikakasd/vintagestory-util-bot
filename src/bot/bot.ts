import { join } from 'node:path'

import { autoload } from '@gramio/autoload'
import { Bot } from 'gramio'

import config from '@/shared/config.js'
import { provideLogger } from '@/shared/utilities/logger.js'

import { isWhitelisted } from './utilities/is-whitelisted.js'

export const bot = new Bot(config.bot.token)
  .on('message', (ctx, next) => {
    if (!isWhitelisted(ctx.chatId)) {
      return ctx.send('You are not allowed to use this bot')
    }

    return next()
  })
  .extend(autoload({
    path: join(import.meta.dirname, 'commands'),
  }))

bot.onStart(({ info }) => {
  provideLogger('bot').info(`bot started as @${info.username}`)
})

export type BotType = typeof bot
