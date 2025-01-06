type IntersectionFromUnion<U extends object> = (
   U extends any ? (k?: U) => void : never
) extends (k: infer I) => void
   ? I
   : never;

type KeysOfReturnTypes<T> = T extends ((external?: { [K: string]: any }) => {
   [K in infer Z]?: Checker;
})[]
   ? Z
   : never;

type ReturnOfFunction<T> = T extends (...rest: any) => infer E ? E : never;

type Index = string | number | symbol;

export type RawCheck<G extends (NoBindChecker | undefined)[] = NoBindChecker[]> = (
   strict: boolean,
   value: any,
   generic?: G,
   {
      // skipShallowStrictCheck,
      name,
   }?: {
      // skipShallowStrictCheck?: boolean;
      name?: string;
   }
) => string | undefined;

export interface NoBindChecker<
   G extends (NoBindChecker | undefined)[] = any[]
> {
   _rawCheck: RawCheck<G>;
   check: (value: any, generic?: G) => void;
   strictCheck: (value: any, generic?: G) => void;
}

export interface Checker<
   G extends (NoBindChecker | undefined)[] = NoBindChecker[]
> extends NoBindChecker<G> {
   bind: (generic: G) => NoBindChecker<[]>;
}

export function buildCheckerFromRaw<G extends (NoBindChecker | undefined)[]>(
   rawCheck: RawCheck<G>
): Checker<G> {
   let checker = {
      _rawCheck: rawCheck,
      check: (value: any, generic: G = [] as any) => {
         let error = rawCheck(false, value, generic);
         if (error) throw new Error(error);
      },
      strictCheck: (value: any, generic: G = [] as any) => {
         let error = rawCheck(true, value, generic);
         if (error) throw new Error(error);
      },
      bind: (generic: G): NoBindChecker => {
         return {
            _rawCheck: (strict, value, _, options) =>
               rawCheck(strict, value, generic, options),
            check: (value: any) => {
               let error = rawCheck(false, value, generic);
               if (error) throw new Error(error);
            },
            strictCheck: (value: any) => (value: any) => {
               let error = rawCheck(true, value, generic);
               if (error) throw new Error(error);
            },
         };
      },
   } as Checker<G>;
   return checker;
}

type CheckersOfBuilders<
   T extends ((external?: any) => {
      [K: string]: Checker;
   })[]
> = IntersectionFromUnion<
   {
      [K in number]: ReturnOfFunction<T[K]>;
   }[number]
>;

export function buildCheckers<
   T extends ((external?: { [K in Z]: Checker }) => {
      [K: string]: Checker;
   })[],
   Z extends Index = KeysOfReturnTypes<T>,
   N = CheckersOfBuilders<T>
>(...fns: T) {
   let checkers = {} as any;
   fns.forEach((createChecker) => {
      Object.assign(checkers, createChecker(checkers));
   });
   return checkers as N;
}

export const PrimitiveCheckers = {
   string: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (typeof value !== "string") {
            return `${name} must be a string`;
         }
      }
   ),
   number: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (typeof value !== "number") {
            return `${name} must be a number`;
         }
      }
   ),
   boolean: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (typeof value !== "boolean") {
            return `${name} must be a boolean`;
         }
      }
   ),
   symbol: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (typeof value !== "symbol") {
            return `${name} must be a symbol`;
         }
      }
   ),
   bigint: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (typeof value !== "bigint") {
            return `${name} must be a bigint`;
         }
      }
   ),
   object: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (value == null || typeof value !== "object") {
            return `${name} must be an object`;
         }
         // TODO: strict
      }
   ),
   Array: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [T?: NoBindChecker] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (!Array.isArray(value)) {
            return `${name} must be an array`;
         }
         if (generic[0]) {
            for (let i = 0; i < value.length; i++) {
               let otherError = generic[0]._rawCheck(strict, value[i], [], {
                  name: name + "[" + i + "]",
               });
               if (otherError) {
                  return otherError;
               }
            }
         }
      }
   ),
   undefined: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: [] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         if (value !== undefined) {
            return `${name} must be undefined`;
         }
      }
   ),
   Union: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: NoBindChecker[] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         let errors = generic.map((checker) =>
            checker._rawCheck(strict, value, [], { name })
         );
         if (errors.every((error) => error)) {
            return errors.join(" or ");
         }
      }
   ),
   Intersection: buildCheckerFromRaw(
      (
         strict: boolean,
         value: any,
         generic: NoBindChecker[] = [],
         { name = "value" }: { name?: string } = {}
      ): string | undefined => {
         for (let checker of generic) {
            let error = checker._rawCheck(strict, value, [], { name });
            if (error) {
               return error;
            }
         }
      }
   ),
   // Map: buildCheckerFromRaw<[T: NoBindChecker]>(
   //    (
   //       strict: boolean,
   //       value: any,
   //       generic: [T?: NoBindChecker] = [],
   //       { name = "value" }: { name?: string } = {}
   //    ): string | undefined => {
   //       if (!(value instanceof Map)) {
   //          return `${name} must be a Map`;
   //       }
   //       if (generic[0]) {
   //          for (let [key, val] of value) {
   //             let error = generic[0]._rawCheck(
   //                strict,
   //                key,
   //                [],
   //                { name: name + "[\"" + key + "\"]" }
   //             )
   //             if (error) {
   //                return `key ${key} in ${value}`;
   //             }
   //             error = generic[0].check(val);
   //             if (error) {
   //                return `Map value ${name} ${error}`;
   //             }
   //          }
   //       }
   //    }
   // ),
};
