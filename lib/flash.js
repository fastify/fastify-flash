"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
function flashFactory() {
    let currentSession;
    return {
        request(type, ...message) {
            if (message.length === 0) {
                throw new Error('Provide a message to flash.');
            }
            if (Array.isArray(message[0])) {
                for (let i = 0; i < message[0].length; i++) {
                    ;
                    (currentSession.flash[type] = currentSession.flash[type] || []).push(message[0][i]);
                }
                return currentSession.flash[type].length;
            }
            ;
            (currentSession.flash[type] = currentSession.flash[type] || []).push(message.length > 1 ? util_1.format.apply(undefined, message) : message[0]);
            return currentSession.flash[type].length;
        },
        reply(type) {
            if (!type) {
                const allMessages = currentSession.flash;
                currentSession.flash = {};
                return allMessages;
            }
            const messages = currentSession.flash[type];
            currentSession.flash[type] = undefined;
            return messages || [];
        },
        setSession(session) {
            currentSession = session;
            currentSession.flash = currentSession.flash || {};
        },
    };
}
exports.flashFactory = flashFactory;
//# sourceMappingURL=flash.js.map