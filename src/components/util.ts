export function range(n: number): number[] {
    return Array.from({ length: n }, (x, i) => i);
}

export function braidArrays<T>(...arrays: T[][]): T[] {
    const braided: T[] = [];
    for (let i = 0; i < Math.max(...arrays.map((a) => a.length)); i++) {
        arrays.forEach((array) => {
            if (array[i] !== undefined) {
                braided.push(array[i]);
            }
        });
    }
    return braided;
}
