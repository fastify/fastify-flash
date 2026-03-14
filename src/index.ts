import type {
  AnyFastifyInstance,
  ApplyDecorators,
  FastifyPluginCallback,
  UnEncapsulatedPlugin
} from 'fastify'
import fp from 'fastify-plugin'
import { flashFactory } from './flash'

declare namespace fastifyFlash {
  export interface FastifyFlashRequestDecorators {
    flash: ReturnType<typeof flashFactory>['request']
  }

  export interface FastifyFlashReplyDecorators {
    flash: ReturnType<typeof flashFactory>['reply']
  }

  export type FastifyFlashPluginDecorators = {
    request: FastifyFlashRequestDecorators
    reply: FastifyFlashReplyDecorators
  }

  export type FastifyFlashPlugin<TInstance extends AnyFastifyInstance = AnyFastifyInstance> = UnEncapsulatedPlugin<
    FastifyPluginCallback<
      {},
      TInstance,
      ApplyDecorators<TInstance, FastifyFlashPluginDecorators>
    >
  >
}

const fastifyFlashPlugin: fastifyFlash.FastifyFlashPlugin = fp(
  function (fastify, _opts, done) {
    const flash = flashFactory()

    const decorated = fastify
      .decorateRequest('flash', flash.request)
      .decorateReply('flash', flash.reply)

    done()
    return decorated
  },
  {
    fastify: '5.x',
    name: '@fastify/flash',
    decorators: {
      request: ['session'],
    },
  }
)

export = fastifyFlashPlugin
