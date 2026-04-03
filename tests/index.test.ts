import { test, TestContext } from 'node:test'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import Fastify, { type FastifyPluginCallback } from 'fastify'
import querystring from 'node:querystring'
import fastifyFlash from '../src'

const key = readFileSync(join(__dirname, '..', '..', 'secret-key'))

type FlashStore = Record<string, string[] | undefined>
type FlashSession = {
  get<T = FlashStore> (key: string): T
  set (key: string, value: unknown): void
}
type FlashRequest = {
  flash: (type: string, ...message: string[] | [string[]]) => number
  session: FlashSession
}
type FlashReply = {
  flash: (type?: string) => FlashStore | string[]
}

const isRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const ensureFlashRequest = (value: unknown): FlashRequest => {
  if (!isRecord(value) || !('flash' in value) || !('session' in value)) {
    throw new Error('flash request decorators are missing in test setup')
  }

  return value as FlashRequest
}

const ensureFlashReply = (value: unknown): FlashReply => {
  if (!isRecord(value) || !('flash' in value)) {
    throw new Error('flash reply decorators are missing in test setup')
  }

  return value as FlashReply
}

const fastifySession = require('@fastify/secure-session') as FastifyPluginCallback<{ key: Buffer }>

test('should set error message and and clear up after displaying.', async (t: TestContext) => {
  t.plan(5)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })

  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    const count = ensureFlashRequest(req).flash('error', 'Something went wrong')

    t.assert.strictEqual(count, 1)
    t.assert.strictEqual(Object.keys(ensureFlashRequest(req).session.get('flash')).length, 1)
    t.assert.strictEqual(ensureFlashRequest(req).session.get('flash').error!.length, 1)
    const error = ensureFlashReply(reply).flash('error')
    reply.send({ error })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"error":["Something went wrong"]}')
  t.assert.strictEqual(response.statusCode, 200)
})

test('should set multiple flash messages.', async (t: TestContext) => {
  t.plan(5)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    ensureFlashRequest(req).flash('info', 'Welcome')
    const count = ensureFlashRequest(req).flash('info', 'Check out this great new feature')

    t.assert.strictEqual(count, 2)
    t.assert.strictEqual(Object.keys(ensureFlashRequest(req).session.get('flash')).length, 1)
    t.assert.strictEqual(ensureFlashRequest(req).session.get('flash').info!.length, 2)
    const info = ensureFlashReply(reply).flash('info')

    reply.send({ info })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"info":["Welcome","Check out this great new feature"]}')
  t.assert.strictEqual(response.statusCode, 200)
})

test('should set flash messages in one call.', async (t: TestContext) => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    const count = ensureFlashRequest(req).flash('warning', ['username required', 'password required'])
    t.assert.strictEqual(count, 2)

    const warning = ensureFlashReply(reply).flash('warning')
    t.assert.strictEqual(warning.length, 2)

    t.assert.strictEqual(warning[0], 'username required')
    t.assert.strictEqual(warning[1], 'password required')
    reply.send({ warning })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"warning":["username required","password required"]}')
  t.assert.strictEqual(response.statusCode, 200)
})

test('should pass flash between requests.', async (t: TestContext) => {
  t.plan(8)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    const count = ensureFlashRequest(req).flash('warning', ['username required', 'password required'])
    t.assert.strictEqual(count, 2)
    reply.send({})
  })

  fastify.get('/test2', (_, reply) => {
    const warning = ensureFlashReply(reply).flash('warning')
    t.assert.strictEqual(warning.length, 2)

    t.assert.strictEqual(warning[0], 'username required')
    t.assert.strictEqual(warning[1], 'password required')
    reply.send({ warning })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })

  t.assert.strictEqual(response.payload, '{}')
  t.assert.strictEqual(response.statusCode, 200)

  const response2 = await fastify.inject({
    method: 'GET',
    url: '/test2',
    cookies: {
      [(response.headers['set-cookie'] as string).split('=', 1)[0]]: querystring.unescape(
        (response.headers['set-cookie'] as string).split('=', 2)[1]
      ),
    },
  })
  t.assert.strictEqual(response2.payload, '{"warning":["username required","password required"]}')
  t.assert.strictEqual(response2.statusCode, 200)
})

test('should pass flash between requests. / 2', async (t: TestContext) => {
  t.plan(8)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    const count = ensureFlashRequest(req).flash('warning', ['username required', 'password required'])
    ensureFlashRequest(req).flash('info', 'Welcome')
    t.assert.strictEqual(count, 2)
    reply.send({})
  })

  fastify.get('/test2', (_, reply) => {
    const warning = ensureFlashReply(reply).flash('warning')
    t.assert.strictEqual(warning.length, 2)

    t.assert.strictEqual(warning[0], 'username required')
    t.assert.strictEqual(warning[1], 'password required')
    reply.send({ warning })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })

  t.assert.strictEqual(response.payload, '{}')
  t.assert.strictEqual(response.statusCode, 200)

  const response2 = await fastify.inject({
    method: 'GET',
    url: '/test2',
    cookies: {
      [(response.headers['set-cookie'] as string).split('=', 1)[0]]: querystring.unescape(
        (response.headers['set-cookie'] as string).split('=', 2)[1]
      ),
    },
  })
  t.assert.strictEqual(response2.payload, '{"warning":["username required","password required"]}')
  t.assert.strictEqual(response2.statusCode, 200)
})

test('should independently set, get and clear flash messages of multiple types.', async (t: TestContext) => {
  t.plan(9)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    ensureFlashRequest(req).flash('info', 'Welcome back')
    ensureFlashRequest(req).flash('notice', 'Last login was yesterday')

    t.assert.strictEqual(Object.keys(ensureFlashRequest(req).session.get('flash')).length, 2)
    t.assert.strictEqual(ensureFlashRequest(req).session.get('flash').info!.length, 1)
    t.assert.strictEqual(ensureFlashRequest(req).session.get('flash').notice!.length, 1)

    const info = ensureFlashReply(reply).flash('info')
    t.assert.strictEqual(info.length, 1)
    t.assert.strictEqual(info[0], 'Welcome back')

    const notice = ensureFlashReply(reply).flash('notice')
    t.assert.strictEqual(notice.length, 1)
    t.assert.strictEqual(notice[0], 'Last login was yesterday')

    reply.send({ info, notice })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"info":["Welcome back"],"notice":["Last login was yesterday"]}')
  t.assert.strictEqual(response.statusCode, 200)
})

test('should return all messages and clear.', async (t: TestContext) => {
  t.plan(5)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    ensureFlashRequest(req).flash('error', 'Database is down')
    ensureFlashRequest(req).flash('error', 'Message queue is down')
    ensureFlashRequest(req).flash('notice', 'Things are looking bleak')

    const msgs = ensureFlashReply(reply).flash()
    t.assert.strictEqual(Object.keys(msgs).length, 2)
    t.assert.strictEqual(msgs['error'].length, 2)
    t.assert.strictEqual(msgs['notice'].length, 1)

    reply.send({ ...msgs })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(
    response.payload,
    '{"error":["Database is down","Message queue is down"],"notice":["Things are looking bleak"]}'
  )
  t.assert.strictEqual(response.statusCode, 200)
})

test('should format messages.', async (t: TestContext) => {
  t.plan(4)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    ensureFlashRequest(req).flash('info', 'Hello %s', 'Jared')
    const jared = ensureFlashReply(reply).flash('info')[0]
    t.assert.strictEqual(jared, 'Hello Jared')

    ensureFlashRequest(req).flash('info', 'Hello %s %s', 'Jared', 'Hanson')
    const jaredHanson = ensureFlashReply(reply).flash('info')[0]

    t.assert.strictEqual(jaredHanson, 'Hello Jared Hanson')

    reply.send({ jared, jaredHanson })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"jared":"Hello Jared","jaredHanson":"Hello Jared Hanson"}')
  t.assert.strictEqual(response.statusCode, 200)
})

test('should return empty array when the type is not set', async (t: TestContext) => {
  t.plan(6)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })

  fastify.register(fastifyFlash)

  fastify.get('/test', (req, reply) => {
    const count = ensureFlashRequest(req).flash('info', 'Hello, world!')

    t.assert.strictEqual(count, 1)
    t.assert.strictEqual(Object.keys(ensureFlashRequest(req).session.get('flash')).length, 1)
    t.assert.strictEqual(ensureFlashRequest(req).session.get('flash').info!.length, 1)
    t.assert.strictEqual(ensureFlashRequest(req).session.get('flash').warning, undefined)
    const warning = ensureFlashReply(reply).flash('warning')
    reply.send({ warning })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"warning":[]}')
  t.assert.strictEqual(response.statusCode, 200)
})

test('should throw error when try to set flash without message.', async (t: TestContext) => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })
  fastify.register(fastifyFlash, {})

  fastify.get('/test', (req) => {
    ensureFlashRequest(req).flash('info')
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"statusCode":500,"error":"Internal Server Error","message":"Provide a message to flash."}')
  t.assert.strictEqual(response.statusCode, 500)
})

test('should return error when session is not defined.', async (t: TestContext) => {
  t.plan(4)
  const fastify = Fastify()
  fastify.decorateRequest('session', null, [])
  fastify.register(fastifyFlash)

  fastify.get('/test', async (req) => {
    ensureFlashRequest(req).flash('error', 'Something went wrong')
  })

  fastify.get('/test2', async (_, reply) => {
    ensureFlashReply(reply).flash('error')
  })

  {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test',
    })
    t.assert.strictEqual(response.payload, '{"statusCode":500,"error":"Internal Server Error","message":"Session not found"}')
    t.assert.strictEqual(response.statusCode, 500)
  }

  {
    const response = await fastify.inject({
      method: 'GET',
      url: '/test2',
    })
    t.assert.strictEqual(response.payload, '{"statusCode":500,"error":"Internal Server Error","message":"Session not found"}')
    t.assert.strictEqual(response.statusCode, 500)
  }
})

test('ensureFlashReply(reply).flash() with no data', async (t: TestContext) => {
  t.plan(2)
  const fastify = Fastify()

  fastify.register(fastifySession, {
    key,
  })

  fastify.register(fastifyFlash)

  fastify.get('/test', (_, reply) => {
    const warning = ensureFlashReply(reply).flash('warning')
    reply.send({ warning })
  })

  const response = await fastify.inject({
    method: 'GET',
    url: '/test',
  })
  t.assert.strictEqual(response.payload, '{"warning":[]}')
  t.assert.strictEqual(response.statusCode, 200)
})
