import type { filters, MessageContext } from '@mtcute/dispatcher'

import config from '@/shared/config.js'

export const isWhitelisted: filters.UpdateFilter<MessageContext> = (ctx) => {
  const chatId = ctx.chat.id
  return config.bot.chatId === chatId || config.bot.whitelistedIds.includes(chatId)
}
