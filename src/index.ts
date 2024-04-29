import fp from 'fastify-plugin'
import { flashFactory } from './flash'

declare module 'fastify' {
  export interface FastifyRequest {
    flash: ReturnType<typeof flashFactory>['request']
  }
  export interface FastifyReply {
    flash: ReturnType<typeof flashFactory>['reply']
  }
}

export = fp<{}>(
  function (fastify, opts, done) {
    const flash = flashFactory()

    fastify.decorateRequest('flash', flash.request)
    fastify.decorateReply('flash', flash.reply)
    done()
  },
  {
    fastify: '4.x',
    name: '@fastify/flash',
    decorators: {
      request: ['session']
    }
  }
)
