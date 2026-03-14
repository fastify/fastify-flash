import { format } from 'node:util'

type FlashStore = Record<string, string[] | undefined>

type ReplyReturn = FlashStore | string[]

interface SessionLike {
  get (key: string): unknown
  set (key: string, value: unknown): void
}

interface FlashRequestContext {
  session?: SessionLike
}

interface FlashReplyContext {
  request: FlashRequestContext
}

const isObject = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const getFlashStore = (value: unknown): FlashStore => {
  if (!isObject(value)) {
    return {}
  }

  return value as FlashStore
}

export function flashFactory () {
  return {
    request (this: FlashRequestContext, type: string, ...message: string[] | [string[]]): number {
      if (!this.session) {
        throw new Error('Session not found')
      }

      const session = this.session
      let currentSession = getFlashStore(session.get('flash'))

      if (message.length === 0) {
        throw new Error('Provide a message to flash.')
      }

      if (Array.isArray(message[0])) {
        for (let i = 0; i < message[0].length; i++) {
          currentSession = {
            ...currentSession,
            [type]: (currentSession[type] ?? []).concat(message[0][i]),
          }
        }
      } else {
        currentSession = {
          ...currentSession,
          [type]: (currentSession[type] ?? []).concat(
            message.length > 1 ? format.apply(undefined, message) : message[0]
          ),
        }
      }

      session.set('flash', currentSession)
      return currentSession[type]?.length ?? 0
    },

    reply (this: FlashReplyContext, type?: string): ReplyReturn {
      if (!this.request.session) {
        throw new Error('Session not found')
      }

      const session = this.request.session
      if (!type) {
        const allMessages = getFlashStore(session.get('flash'))
        session.set('flash', {})
        return allMessages
      }

      const data = getFlashStore(session.get('flash'))
      const messages = data[type]
      delete data[type]

      session.set('flash', data)

      return messages ?? []
    },
  }
}
