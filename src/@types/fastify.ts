import { flashFactory } from '../flash'

declare module 'fastify' {
  export interface FastifyRequest {
    session: {
      [key: string]: any
      get(key: string): any
      set(key: string, value: any): void
    }
    flash: ReturnType<typeof flashFactory>['request']
  }
  export interface FastifyReply {
    flash: ReturnType<typeof flashFactory>['reply']
  }
}
