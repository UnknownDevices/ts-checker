type IntersectionFromUnion<U extends object> = (U extends any ? (k?: U) => void : never) extends (k: infer I) => void ? I : never;
type KeysOfReturnTypes<T> = T extends ((external?: {
    [K: string]: any;
}) => {
    [K in infer Z]?: Checker<any>;
})[] ? Z : never;
type ReturnOfFunction<T> = T extends (...rest: any) => infer E ? E : never;
type Index = string | number | symbol;
export type RawCheck<G extends (NoBindChecker<any> | undefined)[]> = (strict: boolean, value: any, generic?: G, { name, }?: {
    name?: string;
}) => string | undefined;
export interface NoBindChecker<T = any, G extends (NoBindChecker<any> | undefined)[] = []> {
    _rawCheck: RawCheck<G>;
    check: (value: any, generic?: G) => T;
    strictCheck: (value: any, generic?: G) => T;
}
export interface Checker<T, G extends (NoBindChecker<any> | undefined)[] = NoBindChecker<any>[]> extends NoBindChecker<T, G> {
    bind: (generic: G) => NoBindChecker<T, []>;
}
export declare function buildCheckerFromRaw<T, G extends (NoBindChecker<any> | undefined)[]>(rawCheck: RawCheck<G>): Checker<T, G>;
export type CheckersOfBuilders<T extends ((external?: any) => {
    [K: string]: Checker<any>;
})[]> = IntersectionFromUnion<{
    [K in number]: ReturnOfFunction<T[K]>;
}[number]>;
export declare function buildCheckers<T extends ((external?: {
    [K in Z]: Checker<any>;
}) => {
    [K: string]: Checker<any>;
})[], Z extends Index = KeysOfReturnTypes<T>>(...fns: T): { [K in Z]: Checker<any, NoBindChecker<any, []>[]>; };
export declare const PrimitiveCheckers: {
    string: Checker<unknown, []>;
    number: Checker<unknown, []>;
    boolean: Checker<unknown, []>;
    symbol: Checker<unknown, []>;
    bigint: Checker<unknown, []>;
    object: Checker<unknown, []>;
    Array: Checker<unknown, [T?: NoBindChecker<any, []> | undefined]>;
    undefined: Checker<unknown, []>;
};
export {};
