/// <reference types="node" />
import { FastifyRequest, FastifyReply } from 'fastify';
import { IncomingMessage, ServerResponse } from 'http';
export interface ExtendedRequest<T = IncomingMessage> extends FastifyRequest<T> {
    session: {
        flash: {
            [k: string]: string[];
        };
    };
    flash: ReturnType<typeof flashFactory>['request'];
}
export interface ExtendedReply<T = ServerResponse> extends FastifyReply<T> {
    flash: ReturnType<typeof flashFactory>['reply'];
}
export declare function flashFactory(): {
    request(type: string, ...message: string[] | [string[]]): number;
    reply(type?: string | undefined): string[] | {
        [k: string]: string[] | undefined;
    };
    setSession(session: any): void;
};
