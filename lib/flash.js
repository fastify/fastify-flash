"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
function flashFactory() {
    let currentSession;
    let flashSession;
    return {
        request(type, ...message) {
            if (message.length === 0) {
                throw new Error('Provide a message to flash.');
            }
            if (Array.isArray(message[0])) {
                message[0].forEach(msg => {
                    ;
                    (flashSession[type] = flashSession[type] || []).push(msg);
                });
                return flashSession[type].length;
            }
            console.log('message', message);
            (flashSession[type] = flashSession[type] || []).push(message.length > 1 ? util_1.format.apply(undefined, message) : message[0]);
            console.log('formated', flashSession[type]);
            return flashSession[type].length;
        },
        reply(type) {
            if (!type) {
                const allMessages = flashSession;
                delete currentSession.flash;
                return allMessages;
            }
            const messages = flashSession[type];
            if (Object.keys(flashSession).length === 1) {
                delete currentSession.flash;
            }
            else {
                delete flashSession[type];
            }
            return messages || [];
        },
        setSession(session) {
            currentSession = session;
            flashSession = currentSession.flash || (currentSession.flash = {});
        },
    };
}
exports.flashFactory = flashFactory;
//# sourceMappingURL=flash.js.map