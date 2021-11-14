import { Hdbscan } from '../src/hdbscan'

test('hdbscan', async () => {
  var input = (await import('./data/dense.json')).points;
  var hdbscan = new Hdbscan({ input, minClusterSize: 5, debug: true });
  expect(hdbscan.getClusters()).toStrictEqual([
    [
      2, 5, 6, 7, 8, 13, 16,
      17, 18, 25, 27, 29, 32, 35,
      39, 47, 48, 49
    ],
    [
      0, 10, 12, 15, 19,
      22, 38, 40, 41
    ],
    [1, 24, 28, 30, 33, 44],
    [3, 23, 26, 31, 34, 36],
    [
      4, 9, 11, 14, 20,
      21, 37, 43, 45
    ]
  ]);
  expect(hdbscan.getNoise()).toStrictEqual([42, 46]);
});