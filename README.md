# fastify-flash
The flash is a special area of the session used for storing messages. Messages are written to the flash and cleared after being displayed to the user. The flash is typically used in combination with redirects, ensuring that the message is available to the next page that is to be rendered.

This plugin is inspired by [connect-flash](https://github.com/jaredhanson/connect-flash).

## Install
`npm install fastify-flash`

## Usage
Flash messages are stored in the session. First we need to register the session plugin: [fastify-secure-session](https://www.npmjs.com/package/fastify-secure-session).

``` javascript
const fastify = require('fastify')()
const fastifySession = require('fastify-session')
const fastifyFlash = require('fastify-flash')

fastify.register(fastifySession, {
  // adapt this to point to the directory where secret-key is located
  key: fs.readFileSync(path.join(__dirname, 'secret-key')),
  cookie: {
    // options from setCookie, see https://github.com/fastify/fastify-cookie
  }
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

## License

MIT
