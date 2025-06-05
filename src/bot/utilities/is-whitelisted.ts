import config from '@/shared/config.js'

export const isWhitelisted = (chatId: number) => {
  return config.bot.chatId === chatId || config.bot.whitelistedIds.includes(chatId)
}
