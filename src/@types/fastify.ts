import { flashFactory } from '../flash'

declare module 'fastify' {
  export interface FastifyRequest<HttpRequest, Query, Params, Headers, Body> {
    session: {
      [key: string]: any
      get(key: string): any
      set(key: string, value: any): void
    }
    flash: ReturnType<typeof flashFactory>['request']
  }
  export interface FastifyReply<HttpResponse> {
    flash: ReturnType<typeof flashFactory>['reply']
  }
}
