import 'fastify'
import { flashFactory } from '../../src/flash'

declare module 'fastify' {
  export interface FastifyRequest<HttpRequest, Query, Params, Headers, Body> {
    session: {
      flash: {
        [k: string]: string[]
      }
    }
    flash: ReturnType<typeof flashFactory>['request']
  }
  export interface FastifyReply<HttpResponse> {
    flash: ReturnType<typeof flashFactory>['reply']
  }
}
