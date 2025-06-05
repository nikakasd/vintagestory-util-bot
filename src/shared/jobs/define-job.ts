import { initJobify } from 'jobify'

import redis from '../redis.js'

export default initJobify(redis)
