import { format } from 'util'
import { FastifyRequest, FastifyReply } from 'fastify'
import { IncomingMessage, ServerResponse } from 'http'

export interface ExtendedRequest<T = IncomingMessage> extends FastifyRequest<T> {
  session: {
    flash: {
      [k: string]: string[]
    }
  }
  flash: ReturnType<typeof flashFactory>['request']
}

export interface ExtendedReply<T = ServerResponse> extends FastifyReply<T> {
  flash: ReturnType<typeof flashFactory>['reply']
}

export function flashFactory() {
  let currentSession

  return {
    request(type: string, ...message: string[] | [string[]]): number {
      if (message.length === 0) {
        throw new Error('Provide a message to flash.')
      }
      if (Array.isArray(message[0])) {
        for (let i = 0; i < message[0].length; i++) {
          ;(currentSession.flash[type] = currentSession.flash[type] || []).push(message[0][i])
        }
        return currentSession.flash[type].length
      }

      ;(currentSession.flash[type] = currentSession.flash[type] || []).push(
        message.length > 1 ? format.apply(undefined, message) : message[0],
      )

      return currentSession.flash[type].length
    },

    reply(type?: string): typeof currentSession.flash | string[] {
      if (!type) {
        const allMessages = currentSession.flash
        currentSession.flash = {}
        return allMessages
      }

      const messages = currentSession.flash[type]
      currentSession.flash[type] = undefined

      return messages || []
    },

    setSession(session: any) {
      currentSession = session
      currentSession.flash = currentSession.flash || {}
    },
  }
}
