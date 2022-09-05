import fp from 'fastify-plugin'
import { flashFactory } from './flash'

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
