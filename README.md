# fastify-flash
The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered.

This plugin is inspired by [connect-flash](https://github.com/jaredhanson/connect-flash).

## Install
`npm install fastify-flash`

## Usage
Flash messages are stored in the session. First we need to register a session plugin, such as [fastify-session](https://www.npmjs.com/package/fastify-session) or [fastify-secure-session](https://www.npmjs.com/package/fastify-secure-session). We also need a cookie plugin to manage sessions: [fastify-cookie](https://www.npmjs.com/package/fastify-cookie).

``` javascript
const fastify = require('fastify')()
const fastifyCookie = require('fastify-cookie')
const fastifySession = require('fastify-session')
const fastifyFlash = require('fastify-flash')

fastify.register(fastifyCookie)
fastify.register(fastifySession, {
    secret: 'cNaoPYAwF60HZJzkcNaoPYAwF60HZJzk',
  })
fastify.register(fastifyFlash)

fastify.get('/test', (req, reply) => {
      req.flash('warning', ['username required', 'password required'])

      const warning = reply.flash('warning')
      reply.send({ warning }) // {"warning":["username required","password required"]}
    })
```

## API
### Set a flash massage(s)
Signature
``` typescript
req.flash(type: string, ...message: string[] | [string[]]): number
```
It can be called in three different ways:
- `req.flash('info', 'Welcome back')`
- `req.flash('warning', ['username required', 'password required'])`
- `req.flash('info', 'Hello %s', 'Jared') // will use util.format to format the string`

`req.flash` returns the number of messages store with provided type.

### Get a flash message(s)
signature
``` typescript
reply.flash(type?: string): { [k: string]: undefined | string[] } | string[]
```
It can be called in two different ways:
- `reply.flash() // returns all messages as object { [k: string]: undefined | string[] }`
- `reply.flash('info') // returns array of messages that are stored with provided type`

