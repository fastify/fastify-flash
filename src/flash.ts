import { format } from 'node:util'
import type { FastifyRequest, FastifyReply } from 'fastify'

declare module '@fastify/secure-session' {
  interface SessionData {
    flash: { [k: string]: string[] }
  }
}

type FlashData = { [k: string]: string[] }
export type ReplyReturn = FlashData | string[]

export function flashFactory () {
  return {
    request (this: FastifyRequest, type: string, ...message: string[] | [string[]]): number {
      if (!this.session) {
        throw new Error('Session not found')
      }

      let currentSession = this.session.get('flash') || {}

      if (message.length === 0) {
        throw new Error('Provide a message to flash.')
      }

      const messagesToAdd = Array.isArray(message[0])
        ? message[0]
        : [message.length > 1 ? format.apply(undefined, message) : (message[0] as string)]

      currentSession = {
        ...currentSession,
        [type]: (currentSession[type] || []).concat(messagesToAdd)
      }

      this.session.set('flash', currentSession)
      const updatedFlash = this.session.get('flash') || {}
      return updatedFlash[type]?.length ?? 0
    },

    reply (this: FastifyReply, type?: string): ReplyReturn {
      if (!this.request.session) {
        throw new Error('Session not found')
      }

      const session = this.request.session
      const allMessages = session.get('flash') || {}

      if (!type) {
        session.set('flash', {})
        return allMessages
      }

      const messages = allMessages[type] || []
      const { [type]: _, ...remaining } = allMessages

      session.set('flash', remaining)
      return messages
    },
  }
}
