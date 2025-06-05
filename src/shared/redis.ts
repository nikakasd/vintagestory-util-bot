import { Redis } from 'ioredis'

import config from './config.js'

export default new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  db: config.redis.db,
  maxRetriesPerRequest: null,
})
