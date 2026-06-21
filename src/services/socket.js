import { io } from 'socket.io-client'

import { getSocketBaseUrl } from '../config/apiBase'

export function createSocket(options = {}) {
  return io(getSocketBaseUrl(), {
    transports: ['websocket', 'polling'],
    ...options,
  })
}
