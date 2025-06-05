import type { Ffetch } from '@fuman/fetch'
import { ffetchBase } from '@fuman/fetch'

import type { PelicanOptions, PelicanResponse, PelicanServerWebsocketResponse } from './types.js'

export class PelicanService {
  fetch: Ffetch<object, object>

  constructor (private readonly options: PelicanOptions) {
    this.fetch = ffetchBase.extend({
      baseUrl: `${this.options.url}/api/client`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.options.token}`,
      },
    })
  }

  getServerWebsocket (serverId: string): Promise<PelicanResponse<PelicanServerWebsocketResponse>> {
    return this.fetch.get(`/servers/${serverId}/websocket`).json()
  }

  sendCommand (serverId: string, command: string) {
    return this.fetch.post(`/servers/${serverId}/command`, {
      json: { command },
    })
  }
}
