import type {Handle} from "@sveltejs/kit";

export const RequiredWhitelistedHeaders: ReadonlyArray<string> = [
    'content-range'
]

/**
 * A default implementation of the `handle` hook, in case you don't need to do anything special.
 */
export const allowSupabaseServerSideRequests: Handle = function({event, resolve}) {
    return resolve(event, {
        filterSerializedResponseHeaders(name: string, _value: string): boolean {
            return RequiredWhitelistedHeaders.includes(name);
        }
    })
}