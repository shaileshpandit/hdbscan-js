export function euclidean(a: Array<number>, b: Array<number>): number {
    var sum = 0
    for (var n = 0; n < a.length; n++) {
        sum += Math.pow(a[n] - b[n], 2)
    }
    return Math.sqrt(sum);
}