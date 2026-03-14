import type { flashFactory } from '../src/flash'

type FlashStore = Record<string, string[] | undefined>
type FlashSession = {
  get<T = FlashStore> (key: string): T
  set (key: string, value: unknown): void
}

type FlashRequestDecorator = ReturnType<typeof flashFactory>['request']
type FlashReplyDecorator = ReturnType<typeof flashFactory>['reply']

declare module 'fastify/types/request' {
  interface BaseFastifyRequest {
    flash: FlashRequestDecorator
    session: FlashSession
  }
}

declare module 'fastify/types/reply' {
  interface BaseFastifyReply {
    flash: FlashReplyDecorator
  }
}
