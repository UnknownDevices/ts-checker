type IntersectionFromUnion<U extends object> = (U extends any ? (k?: U) => void : never) extends (k: infer I) => void ? I : never;
type KeysOfReturnTypes<T> = T extends ((external?: {
    [K: string]: any;
}) => {
    [K in infer Z]?: Checker;
})[] ? Z : never;
type ReturnOfFunction<T> = T extends (...rest: any) => infer E ? E : never;
type Index = string | number | symbol;
export type RawCheck<G extends (NoBindChecker | undefined)[] = NoBindChecker[]> = (strict: boolean, value: any, generic?: G, { name, }?: {
    name?: string;
}) => string | undefined;
export interface NoBindChecker<G extends (NoBindChecker | undefined)[] = any[]> {
    _rawCheck: RawCheck<G>;
    check: (value: any, generic?: G) => void;
    strictCheck: (value: any, generic?: G) => void;
}
export interface Checker<G extends (NoBindChecker | undefined)[] = NoBindChecker[]> extends NoBindChecker<G> {
    bind: (generic: G) => NoBindChecker<[]>;
}
export declare function buildCheckerFromRaw<G extends (NoBindChecker | undefined)[]>(rawCheck: RawCheck<G>): Checker<G>;
type CheckersOfBuilders<T extends ((external?: any) => {
    [K: string]: Checker;
})[]> = IntersectionFromUnion<{
    [K in number]: ReturnOfFunction<T[K]>;
}[number]>;
export declare function buildCheckers<T extends ((external?: {
    [K in Z]: Checker;
}) => {
    [K: string]: Checker;
})[], Z extends Index = KeysOfReturnTypes<T>, N = CheckersOfBuilders<T>>(...fns: T): N;
export declare const PrimitiveCheckers: {
    string: Checker<[]>;
    number: Checker<[]>;
    boolean: Checker<[]>;
    symbol: Checker<[]>;
    bigint: Checker<[]>;
    object: Checker<[]>;
    Array: Checker<[T?: NoBindChecker<any[]> | undefined]>;
    undefined: Checker<[]>;
    Union: Checker<NoBindChecker<any[]>[]>;
    Intersection: Checker<NoBindChecker<any[]>[]>;
};
export {};
