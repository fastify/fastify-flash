import fp from 'fastify-plugin'
import { flashFactory } from './flash'

export = fp<{}>(
  function (fastify, opts = {}, done) {
    const flash = flashFactory()

    fastify.decorateRequest('flash', flash.request)
    fastify.decorateReply('flash', flash.reply)

    fastify.addHook('onRequest', function (request, reply, next) {
      if (!request.session) {
        next(Error('Flash plugin requires a valid session.'))
      }
      next()
    })
    done()
  },
  {
    fastify: '4.x',
    name: '@fastify/flash',
  },
)
