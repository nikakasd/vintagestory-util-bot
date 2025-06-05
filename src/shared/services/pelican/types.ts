export interface PelicanOptions {
  url: string
  token: string
}

export interface PelicanResponse<T> {
  data: T
}

export interface PelicanServerWebsocketResponse {
  token: string
  socket: string
}

export interface PelicanWebsocketMessage {
  event: string
  args: string[]
}
