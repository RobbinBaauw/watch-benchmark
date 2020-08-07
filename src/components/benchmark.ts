import { Ref, ref, reactive, WatchSource } from "vue";

// Amount => 1, 8, 20, 500
// Type => ref, reactive, arrays
// Changing => constant, little change, much change

const amountOfKeys = 100;
const arraySize = 100;

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

export type SourceMutation =
    | {
          type: "mixed";
          noChange: boolean;
          littleChange: boolean;
          lotsOfChange: boolean;
      }
    | {
          type: "no" | "little" | "lots";
      };

type Source = Ref | Record<any, any> | Array<number>;

export function createDependencies(
    sourceTypes: SourceTypes,
    mutation: SourceMutation,
): {
    sources: Source[];
    watchSource: WatchSource<Source[]>;
} {
    const sources: Source[] = [];
    switch (sourceTypes.type) {
        case "mixed": {
            sources.push(createRefs(sourceTypes.refs));
            sources.push(createObjects(sourceTypes.objects));
            sources.push(createArrays(sourceTypes.arrays));
            break;
        }
        case "array": {
            sources.push(createArrays(sourceTypes.amount));
            break;
        }
        case "object": {
            sources.push(createObjects(sourceTypes.amount));
            break;
        }
        case "ref": {
            sources.push(createRefs(sourceTypes.amount));
            break;
        }
    }
    return {
        sources,
        watchSource: () => sources,
    };
}

function createRefs(amount: number) {
    return range(amount).map(it => ref(it));
}

function createObjects(amount: number) {
    return range(amount).map(it => {
        const obj: { [key: string]: number } = {};
        for (let i = 0; i < amountOfKeys; i++) {
            obj["" + i] = i * it;
        }
        return reactive(obj);
    });
}

function createArrays(amount: number) {
    return range(amount).map(it => {
        const arr = Array(arraySize);
        for (let i = 0; i < arraySize; i++) {
            arr[i] = i * it;
        }
        return reactive(arr);
    });
}

function range(n: number) {
    return Array.from({ length: n }, (x, i) => i);
}
