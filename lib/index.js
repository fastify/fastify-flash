"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const fastify_plugin_1 = __importDefault(require("fastify-plugin"));
const flash_1 = require("./flash");
module.exports = fastify_plugin_1.default(function (fastify, opts = {}, done) {
    const flash = flash_1.flashFactory();
    fastify.decorateRequest('flash', flash.request);
    fastify.decorateReply('flash', flash.reply);
    fastify.addHook('preHandler', function (request, reply, next) {
        if (!request.session) {
            next(Error('Flash plugin requires a valid session.'));
        }
        flash.setSession(request.session);
        next();
    });
    done();
}, {
    fastify: '2.x.x',
    name: 'fastify-flash',
    dependencies: ['fastify-session'],
});
//# sourceMappingURL=index.js.map