import http from 'http'
import fp from 'fastify-plugin'
import { flashFactory } from './flash'

export = fp<http.Server, http.IncomingMessage, http.ServerResponse, {}>(
  function(fastify, opts = {}, done) {
    const flash = flashFactory()

    fastify.decorateRequest('flash', flash.request)
    fastify.decorateReply('flash', flash.reply)

    fastify.addHook('onRequest', function(request, reply, next) {
      if (!request.session) {
        next(Error('Flash plugin requires a valid session.'))
      }
      next()
    })
    done()
  },
  {
    fastify: '>= 2.1.0',
    name: 'fastify-flash',
  },
)
