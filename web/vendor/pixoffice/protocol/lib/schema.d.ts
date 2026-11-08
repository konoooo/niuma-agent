import { z } from 'zod';
export type JsonValue = string | number | boolean | JsonValue[] | {
    [key: string]: JsonValue;
};
export declare const maxProtocolDepth = 64;
export declare class ProtocolValueFault extends Error {
    readonly path: string;
    constructor(path: string, message: string);
}
/** Inspect raw values before a parser can strip keys or JSON can replace values with null. */
export declare function assertProtocolValue(value: unknown): asserts value is JsonValue;
export declare function assertProtocolObject(value: unknown): asserts value is Record<string, JsonValue>;
export declare function stringifyProtocolObject(value: unknown): string;
/** Local documents may omit optional undefined fields; their encoded data must still be null-free. */
export declare function stringifyDocumentObject(value: unknown, space?: number): string;
export declare function parseProtocolObject(source: string): Record<string, JsonValue>;
export declare const jsonValueSchema: z.ZodPipe<z.ZodUnknown, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>;
export declare const jsonObjectSchema: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
export declare const responseEnvelopeSchema: z.ZodObject<{
    code: z.ZodNumber;
    msg: z.ZodString;
    data: z.ZodPipe<z.ZodUnknown, z.ZodRecord<z.ZodString, z.ZodType<JsonValue, unknown, z.core.$ZodTypeInternals<JsonValue, unknown>>>>;
}, z.core.$strict>;
export declare const idSchema: z.ZodString;
export declare const pointSchema: z.ZodObject<{
    x: z.ZodNumber;
    y: z.ZodNumber;
}, z.core.$strict>;
export declare const boxSchema: z.ZodObject<{
    left: z.ZodNumber;
    top: z.ZodNumber;
    right: z.ZodNumber;
    bottom: z.ZodNumber;
}, z.core.$strict>;
export declare const blockedAreaSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    bounds: z.ZodObject<{
        left: z.ZodNumber;
        top: z.ZodNumber;
        right: z.ZodNumber;
        bottom: z.ZodNumber;
    }, z.core.$strict>;
}, z.core.$strict>;
