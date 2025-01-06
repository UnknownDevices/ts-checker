"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrimitiveCheckers = void 0;
exports.buildCheckerFromRaw = buildCheckerFromRaw;
exports.buildCheckers = buildCheckers;
function buildCheckerFromRaw(rawCheck) {
    let checker = {
        _rawCheck: rawCheck,
        check: (value, generic = []) => {
            let error = rawCheck(false, value, generic);
            if (error)
                throw new Error(error);
        },
        strictCheck: (value, generic = []) => {
            let error = rawCheck(true, value, generic);
            if (error)
                throw new Error(error);
        },
        bind: (generic) => {
            return {
                _rawCheck: (strict, value, _, options) => rawCheck(strict, value, generic, options),
                check: (value) => {
                    let error = rawCheck(false, value, generic);
                    if (error)
                        throw new Error(error);
                },
                strictCheck: (value) => (value) => {
                    let error = rawCheck(true, value, generic);
                    if (error)
                        throw new Error(error);
                },
            };
        },
    };
    return checker;
}
function buildCheckers(...fns) {
    let checkers = {};
    fns.forEach((createChecker) => {
        Object.assign(checkers, createChecker(checkers));
    });
    return checkers;
}
exports.PrimitiveCheckers = {
    string: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (typeof value !== "string") {
            return `${name} must be a string`;
        }
    }),
    number: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (typeof value !== "number") {
            return `${name} must be a number`;
        }
    }),
    boolean: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (typeof value !== "boolean") {
            return `${name} must be a boolean`;
        }
    }),
    symbol: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (typeof value !== "symbol") {
            return `${name} must be a symbol`;
        }
    }),
    bigint: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (typeof value !== "bigint") {
            return `${name} must be a bigint`;
        }
    }),
    object: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (value == null || typeof value !== "object") {
            return `${name} must be an object`;
        }
        // TODO: strict
    }),
    Array: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
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
    }),
    undefined: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        if (value !== undefined) {
            return `${name} must be undefined`;
        }
    }),
    Union: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        let errors = generic.map((checker) => checker._rawCheck(strict, value, [], { name }));
        if (errors.every((error) => error)) {
            return errors.join(" or ");
        }
    }),
    Intersection: buildCheckerFromRaw((strict, value, generic = [], { name = "value" } = {}) => {
        for (let checker of generic) {
            let error = checker._rawCheck(strict, value, [], { name });
            if (error) {
                return error;
            }
        }
    }),
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
