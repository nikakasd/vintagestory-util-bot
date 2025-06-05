import { existsSync } from 'fs'
import { loadEnvFile } from 'process'

import env from 'env-var'
if (existsSync('.env')) loadEnvFile('.env')

export default {
  package: {
    name: env.get('npm_package_name').default('unknown').asString(),
    version: env.get('npm_package_version').default('unknown').asString(),
    mode: env.get('NODE_ENV').default('production').asString(),
  },
  bot: {
    token: env.get('BOT_TOKEN').required().asString(),
    apiId: env.get('BOT_API_ID').required().asInt(),
    apiHash: env.get('BOT_API_HASH').required().asString(),
    chatId: env.get('BOT_CHAT_ID').required().asInt(),
    whitelistedIds: env.get('BOT_WHITELISTED_IDS').default('').asArray(',').map(Number),
  },
  pelican: {
    url: env.get('PELICAN_URL').required().asString(),
    token: env.get('PELICAN_TOKEN').required().asString(),
    serverId: env.get('PELICAN_SERVER_ID').required().asString(),
  },
  grafana: {
    url: env.get('GRAFANA_URL').required().asString(),
    datasource: env.get('GRAFANA_DATASOURCE').required().asString(),
  },
}
