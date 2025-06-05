import { TelegramClient } from '@mtcute/node'

import config from '@/shared/config.js'
import { provideLogger } from '@/shared/utilities/logger.js'

import type { PelicanService } from '../shared/services/pelican/pelican.js'

const logger = provideLogger('bot')

declare module '@mtcute/dispatcher' {
  interface DispatcherDependencies {
    pelican: PelicanService
  }
}

export const bot = new TelegramClient({
  storage: '.runtime/session',
  apiId: config.bot.apiId,
  apiHash: config.bot.apiHash,
})

const LEVELS = ['debug', 'info', 'warn', 'error', 'fatal']
bot.log.mgr.handler = (color: number, level: number, tag: string, fmt: string, args: unknown[]) => {
  logger.log(LEVELS[level], `[${tag}] ${fmt}`, ...args)
}
