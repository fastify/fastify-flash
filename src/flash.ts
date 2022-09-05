import { format } from 'util'

type ReplyReturn =
  | {
      [k: string]: string[] | undefined
    }
  | string[]

export function flashFactory() {
  return {
    request(type: string, ...message: string[] | [string[]]): number {
      if (!this.session) {
        throw new Error('Session not found')
      }
      let currentSession = this.session.get('flash')
      if (!currentSession) {
        currentSession = {}
        this.session.set('flash', currentSession)
      }

      if (message.length === 0) {
        throw new Error('Provide a message to flash.')
      }

      if (Array.isArray(message[0])) {
        for (let i = 0; i < message[0].length; i++) {
          currentSession = {
            ...currentSession,
            [type]: (currentSession[type] || []).concat(message[0][i]),
          }
        }
      } else {
        currentSession = {
          ...currentSession,
          [type]: (currentSession[type] || []).concat(
            message.length > 1 ? format.apply(undefined, message) : message[0],
          ),
        }
      }
      this.session.set('flash', currentSession)
      return this.session.get('flash')[type].length
    },

    reply(type?: string): ReplyReturn {
      if (!this.request.session) {
        throw new Error('Session not found')
      }
      if (!type) {
        const allMessages = this.request.session.get('flash')
        this.request.session.set('flash', {})
        return allMessages
      }

      let data = this.request.session.get('flash')
      if (!data)  {
        data = {} 
      }

      const messages = data[type]
      delete data[type]

      this.request.session.set('flash', data)

      return messages || []
    },
  }
}
