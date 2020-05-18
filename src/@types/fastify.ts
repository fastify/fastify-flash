import { flashFactory } from '../flash'

declare module 'fastify' {
  export interface FastifyRequestInterface {
    session: {
      [key: string]: any
      get(key: string): any
      set(key: string, value: any): void
    }
    flash: ReturnType<typeof flashFactory>['request']
  }
  export interface FastifyReplyInterface {
    flash: ReturnType<typeof flashFactory>['reply']
  }
}
