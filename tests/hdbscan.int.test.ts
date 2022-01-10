import { Hdbscan } from '../src/hdbscan'

test('hdbscan', async () => {
    var input = (await import('./data/dense.json')).points;
    var hdbscan = new Hdbscan({
        input,
        minClusterSize: 6,
        minSamples: 6,
        clusterSelectionEpsilon: 0.7,
        clusterSelectionMethod: "leaf",
        debug: true
    });
    const expectedClusters = [
        [3, 10, 19, 25, 31, 34, 40, 45, 54, 68, 70, 77, 98, 112, 115],
        [4, 5, 8, 11, 14, 15, 20, 21, 22, 24, 28, 29, 35, 39, 41, 42, 43, 48, 51, 52, 53, 56, 59, 61, 82, 86],
        [2, 6, 12, 17, 26, 38, 47, 50, 58, 63, 65, 71, 74, 79, 83, 103, 104, 106, 108, 110, 116],
        [0, 7, 13, 18, 27, 32, 36, 46, 49, 55, 57, 60, 62, 64, 66, 72, 75, 76, 80, 85, 88, 90, 91, 92, 94, 95, 97, 102, 105, 107, 113, 117, 118, 119],
        [1, 9, 16, 23, 30, 33, 37, 44, 67, 69, 73, 78, 81, 84, 89, 93, 96, 99, 100, 101, 111, 114, 120]
    ];
    const expectedNoise = [87, 109];
    expect(hdbscan.getClusters().length).toBe(5);
    expect(hdbscan.getNoise().length).toBe(2);
    expect(hdbscan.getClusters()).toStrictEqual(expectedClusters);
    expect(hdbscan.getNoise()).toStrictEqual(expectedNoise);
});