import type { Ffetch } from '@fuman/fetch'
import { ffetchBase } from '@fuman/fetch'
import type { WebSocketConnectionFramed } from '@fuman/net'
import { connectWsFramed, PersistentConnection } from '@fuman/net'
import { asNonNull, Deferred, Emitter } from '@fuman/utils'

import type { PelicanOptions, PelicanResponse, PelicanServerWebsocketResponse, PelicanWebsocketMessage } from './types.js'

export class PelicanService {
  #fetch: Ffetch<object, object>
  #websocket: PersistentConnection<void, WebSocketConnectionFramed>
  #websocketPromise = new Deferred<void>()
  #websocketReady = false
  #websocketToken?: string

  readonly onConsole = new Emitter<string>()

  constructor (private readonly options: PelicanOptions) {
    this.#fetch = ffetchBase.extend({
      baseUrl: `${this.options.url}/api/client`,
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${this.options.token}`,
      },
    })
    this.#websocket = new PersistentConnection<void, WebSocketConnectionFramed>({
      connect: async () => {
        const res = await this.#fetch.get(`/servers/${this.options.serverId}/websocket`).json<PelicanResponse<PelicanServerWebsocketResponse>>()
        this.#websocketToken = res.data.token

        this.#websocketReady = false
        this.#websocketPromise = new Deferred<void>()

        return connectWsFramed({ url: res.data.socket })
      },
      onOpen: this.#onOpen.bind(this),
    })
  }

  async #onOpen (conn: WebSocketConnectionFramed) {
    await conn.writeFrame(JSON.stringify({
      event: 'auth',
      args: [asNonNull(this.#websocketToken)],
    }))

    const successFrame = JSON.parse(await conn.readFrame() as string) as PelicanWebsocketMessage
    if (successFrame.event !== 'auth success') {
      throw new Error(`Unexpected first frame: ${JSON.stringify(successFrame)}`)
    }

    this.#websocketReady = true
    this.#websocketPromise.resolve()

    while (true) {
      const frame = JSON.parse(await conn.readFrame() as string) as PelicanWebsocketMessage
      if (frame.event === 'console output') {
        this.onConsole.emit(frame.args[0])
      }

      if (frame.event === 'token expiring') {
        const res = await this.#fetch.get(`/servers/${this.options.serverId}/websocket`).json<PelicanResponse<PelicanServerWebsocketResponse>>()

        this.#websocketToken = res.data.token

        await conn.writeFrame(JSON.stringify({
          event: 'auth',
          args: [this.#websocketToken],
        }))
      }
    }
  }

  async #waitForWebsocket () {
    if (!this.#websocketReady) {
      await this.#websocketPromise.promise
    }
  }

  connect () {
    return this.#websocket.connect()
  }

  async sendCommand (command: string) {
    await this.#waitForWebsocket()
    return this.#fetch.post(`/servers/${this.options.serverId}/command`, {
      json: { command },
    })
  }
}
