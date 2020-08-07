import { Ref, ref, reactive, WatchSource, isRef } from "vue";
import { braidArrays, range } from "./util";

// Amount => 1, 8, 20, 500
// Type => ref, reactive, arrays
// Changing => constant, little change, much change

const amountOfKeys = 100;
const arraySize = 100;

export type Benchmark = {
    sourceTypes: SourceTypes;
    sourceChange: SourceChange;
};

export type SourceTypes =
    | {
          type: "mixed";
          refs: number;
          objects: number;
          arrays: number;
      }
    | {
          type: "ref" | "object" | "array";
          amount: number;
      };

export type SourceChange = "no" | "little" | "lots";

type Source = Ref<number> | Record<string, number> | Array<number>;

export function createDependencies(
    sourceTypes: SourceTypes,
    sourceChange: SourceChange,
): {
    sources: Source[];
    watchSource: WatchSource<Source[]>;
} {
    const sources: Source[] = [];
    switch (sourceTypes.type) {
        case "mixed": {
            const refs = createRefs(sourceTypes.refs);
            const objects = createObjects(sourceTypes.objects);
            const arrays = createArrays(sourceTypes.arrays);

            // Intertwine the sources, so we arbitrarily remove sources later
            sources.push(...braidArrays<Source>(refs, objects, arrays));

            break;
        }
        case "array": {
            sources.push(...createArrays(sourceTypes.amount));
            break;
        }
        case "object": {
            sources.push(...createObjects(sourceTypes.amount));
            break;
        }
        case "ref": {
            sources.push(...createRefs(sourceTypes.amount));
            break;
        }
    }

    let watchCallCount = 0;

    return {
        sources,
        watchSource: () => {
            watchCallCount++;
            console.log(watchCallCount);

            function useSources(doSkip: (i: number, source: Source) => boolean) {
                const newSources = [];
                for (let i = 0; i < sources.length; i++) {
                    const source = sources[i];
                    if (doSkip(i, source)) continue;
                    accessSource(source);
                    newSources.push(source);
                }
                return newSources;
            }

            switch (sourceChange) {
                case "no": {
                    // Constant dependencies
                    return useSources((i) => false);
                }
                case "little": {
                    // We skip 1 in 20 dependencies in a rotating fashion
                    return useSources((i) => i % 20 === watchCallCount % 20);
                }
                case "lots": {
                    // We skip 1 in 2 dependencies in a rotating fashion
                    return useSources((i) => i % 2 === watchCallCount % 2);
                }
            }
        },
    };
}

export function mutateSource(source: Source): void {
    if (isRef(source)) {
        source.value++;
    } else if (Array.isArray(source)) {
        source[arraySize - 1] = 100;
    } else {
        source[amountOfKeys - 1 + ""] = 100;
    }
}

function accessSource(source: Source): void {
    if (isRef(source)) {
        source.value;
    } else if (Array.isArray(source)) {
        source[arraySize - 1];
    } else {
        source[amountOfKeys - 1 + ""];
    }
}

function createRefs(amount: number): Ref<number>[] {
    return range(amount).map((it) => ref(it));
}

function createObjects(amount: number): Record<string, number>[] {
    return range(amount).map((it) => {
        const obj: Record<string, number> = {};
        for (let i = 0; i < amountOfKeys; i++) {
            obj["" + i] = i * it;
        }
        return reactive(obj);
    });
}

function createArrays(amount: number): number[][] {
    return range(amount).map((it) => {
        const arr = Array(arraySize);
        for (let i = 0; i < arraySize; i++) {
            arr[i] = i * it;
        }
        return reactive(arr);
    });
}
