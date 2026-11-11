import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { overlap, readDevices, repeats } from './series.mjs';

const spec = (endCard) => `# Spec

## Devices
- opening: the logo plate stamps over four parked cars
- captions: white words on a cobalt pill near the bottom
- end card: ${endCard}
- call to action: ask which car was theirs
- transitions: whip pans and a light flash

## Sound
`;

test('devices are read from their section', () => {
  const devices = readDevices(spec('a fake comment box types an answer'));
  assert.equal(devices['end card'], 'a fake comment box types an answer');
  assert.equal(Object.keys(devices).length, 5);
});

test('a spec without the section has no devices', () => {
  assert.equal(readDevices('# Spec\n## Sound\n'), null);
});

test('the same device in other words still counts as a repeat', () => {
  assert.ok(overlap('a fake comment box types an answer', 'comment box typing the answer, fake') >= 0.5);
  assert.ok(overlap('a fake comment box types an answer', 'the two trucks swap sides on a split ground') < 0.5);
});

test('a repeat names the earlier film and a fixed device is skipped', () => {
  const earlier = [{ out: 'film-a', devices: readDevices(spec('a fake comment box types an answer')) }];
  const mine = readDevices(spec('the comment box types a fake answer'));
  const keys = repeats(mine, earlier).map((line) => line.split(' ')[0] + ' ' + line.split(' ')[1]);
  assert.ok(keys.includes('end card'));
  mine.opening = 'fixed: the client says Welcome to the show';
  assert.ok(repeats(mine, earlier).every((line) => !line.startsWith('opening')));
});

test('the command logs a new film and refuses the next one that repeats it', () => {
  const root = mkdtempSync(join(tmpdir(), 'series-'));
  const script = fileURLToPath(new URL('./series.mjs', import.meta.url));
  const log = join(root, 'log.jsonl');
  const make = (name, devices) => {
    const out = join(root, 'client', name);
    mkdirSync(join(out, 'composition'), { recursive: true });
    writeFileSync(join(out, 'composition', 'SPEC.md'), devices);
    return spawnSync(process.execPath, [script, out, '--log', log], { encoding: 'utf8' });
  };
  assert.equal(make('one', spec('a fake comment box types an answer')).status, 0);
  const second = make('two', spec('the comment box types a fake answer'));
  assert.equal(second.status, 1);
  assert.match(second.stdout, /SERIES: opening repeats/);
  assert.equal(readFileSync(log, 'utf8').trim().split('\n').length, 1);
});
