import { readdir } from 'node:fs/promises'

import { Dispatcher } from '@mtcute/dispatcher'

import config from '@/shared/config.js'
import { provideLogger } from '@/shared/utilities/logger.js'

import { bot } from './bot/bot.js'
import { PelicanService } from './shared/services/pelican/pelican.js'

const init = async () => {
  provideLogger('index').info(`starting ${config.package.name} (${config.package.version}) in ${config.package.mode} mode...`)

  const pelican = new PelicanService({
    url: config.pelican.url,
    token: config.pelican.token,
    serverId: config.pelican.serverId,
  })
  pelican.connect()

  const dp = Dispatcher.for(bot)
  dp.inject('pelican', pelican)

  // load commands
  for (const file of await readdir(new URL('./bot/commands', import.meta.url)).then((files) => files.filter((file) => !file.endsWith('.map')))) {
    const command = await import(`./bot/commands/${file}`)
    command.default(bot, dp)
  }

  await bot.start({
    botToken: config.bot.token,
  })
}

init()
