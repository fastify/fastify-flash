import fp from 'fastify-plugin'
import { flashFactory, ExtendedRequest } from './flash'

export = fp(
  function(fastify, opts = {}, done) {
    const flash = flashFactory()

    fastify.decorateRequest('flash', flash.request)
    fastify.decorateReply('flash', flash.reply)

    fastify.addHook('onRequest', function(request: ExtendedRequest, reply, next) {
      if (!request.session) {
        next(Error('Flash plugin requires a valid session.'))
      }

      flash.setSession(request.session)

      next()
    })
    done()
  },
  {
    fastify: '2.x.x',
    name: 'fastify-flash',
  },
)
