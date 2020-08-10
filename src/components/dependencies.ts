import Vue, { Ref, WatchSource } from "vue";
import { braidArrays, range } from "./util";
import { amountOfKeys, arraySize } from "@/components/consts";

export type BenchmarkOptions = {
    sourceTypes: SourceTypes;
    sourceChange: SourceChange;
    vueGlobalName: string;
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

export type Source = Ref<number> | Record<string, number> | Array<number>;

export type VueType = typeof Vue;

export class DependencyCreator {
    constructor(public readonly vueInstance: VueType) {}

    createDependencies(
        sourceTypes: SourceTypes,
        sourceChange: SourceChange,
    ): {
        watchSources: Ref<Source[]>;
        watchSource: WatchSource<Source[]>;
    } {
        const sources: Source[] = [];
        switch (sourceTypes.type) {
            case "mixed": {
                const refs = this.createRefs(sourceTypes.refs);
                const objects = this.createObjects(sourceTypes.objects);
                const arrays = this.createArrays(sourceTypes.arrays);

                // Intertwine the sources, so we arbitrarily remove sources later
                sources.push(...braidArrays<Source>(refs, objects, arrays));

                break;
            }
            case "array": {
                sources.push(...this.createArrays(sourceTypes.amount));
                break;
            }
            case "object": {
                sources.push(...this.createObjects(sourceTypes.amount));
                break;
            }
            case "ref": {
                sources.push(...this.createRefs(sourceTypes.amount));
                break;
            }
        }

        let watchCallCount = 0;
        const watchSources = this.vueInstance.ref<Source[]>(sources);

        return {
            watchSources,
            watchSource: () => {
                watchCallCount++;

                const useSources = (doSkip: (i: number, source: Source) => boolean) => {
                    const newSources = [];
                    for (let i = 0; i < sources.length; i++) {
                        const source = sources[i];
                        if (doSkip(i, source)) continue;
                        this.accessSource(source);
                        newSources.push(source);
                    }
                    watchSources.value = newSources;
                    return newSources;
                };

                switch (sourceChange) {
                    case "no": {
                        // Constant dependencies
                        return useSources(() => false);
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

    mutateSource(source: Source): void {
        if (this.vueInstance.isRef(source)) {
            source.value++;
        } else if (Array.isArray(source)) {
            source[arraySize - 1]++;
        } else {
            source[amountOfKeys - 1 + ""]++;
        }
    }

    private accessSource(source: Source): void {
        if (this.vueInstance.isRef(source)) {
            source.value;
        } else if (Array.isArray(source)) {
            source[arraySize - 1];
        } else {
            source[amountOfKeys - 1 + ""];
        }
    }

    private createRefs(amount: number): Ref<number>[] {
        return range(amount).map((it) => this.vueInstance.ref(it));
    }

    private createObjects(amount: number): Record<string, number>[] {
        return range(amount).map((it) => {
            const obj: Record<string, number> = {};
            for (let i = 0; i < amountOfKeys; i++) {
                obj["" + i] = i * it;
            }
            return this.vueInstance.reactive(obj);
        });
    }

    private createArrays(amount: number): number[][] {
        return range(amount).map((it) => {
            const arr = Array(arraySize);
            for (let i = 0; i < arraySize; i++) {
                arr[i] = i * it;
            }
            return this.vueInstance.reactive(arr);
        });
    }
}
