import config from '@/shared/config.js'
import { provideLogger } from '@/shared/utilities/logger.js'

import { bot } from './bot/bot.js'

const init = async () => {
  provideLogger('index').info(`starting ${config.package.name} (${config.package.version}) in ${config.package.mode} mode...`)

  await bot.start()
}

init()
