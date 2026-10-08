import { readFile } from 'node:fs/promises';
import { validateDataset } from './dataset-validator.mjs';

const base = JSON.parse(await readFile(new URL('../src/data/synthetic/dev.dataset.json', import.meta.url), 'utf8'));

const cases = [
  {
    name: 'fixture válido',
    mutate: () => structuredClone(base),
    expectError: false,
  },
  {
    name: 'secuencia desordenada',
    mutate: () => {
      const data = structuredClone(base);
      data.patterns[0].stops[1].sequence = 1;
      return data;
    },
    expectedText: 'secuencia no estrictamente creciente',
  },
  {
    name: 'parada inexistente',
    mutate: () => {
      const data = structuredClone(base);
      data.patterns[0].stops[1].stopId = 'stop-que-no-existe';
      return data;
    },
    expectedText: 'parada inexistente',
  },
  {
    name: 'conexión peatonal no sustentada',
    mutate: () => {
      const data = structuredClone(base);
      data.walkingConnections.push({
        id: 'dev-walk-invalid',
        cityId: 'dev-city',
        fromStopId: 'dev-stop-a',
        toStopId: 'stop-que-no-existe',
        bidirectional: true,
        distanceMeters: 50,
        sourceRefIds: ['src-dev-synthetic'],
      });
      return data;
    },
    expectedText: 'toStopId inexistente',
  },
  {
    name: 'sintético marcado publicable',
    mutate: () => {
      const data = structuredClone(base);
      data.publishable = true;
      return data;
    },
    expectedText: 'dataset publicable no puede contener fuentes synthetic',
  },
];

let failed = 0;
for (const testCase of cases) {
  const errors = validateDataset(testCase.mutate());
  const shouldPass = testCase.expectError === false;
  const passed = shouldPass
    ? errors.length === 0
    : errors.some((error) => error.includes(testCase.expectedText));

  if (!passed) {
    failed += 1;
    console.error(`FAIL: ${testCase.name}`);
    console.error(errors);
  } else {
    console.log(`PASS: ${testCase.name}`);
  }
}

if (failed > 0) process.exit(1);
console.log(`OK: ${cases.length} casos del validador`);
