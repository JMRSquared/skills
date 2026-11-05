import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { describe, it } from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkBlocks, htmlToBlocks, textToBlocks } from './check-copy.mjs';

const script = join(dirname(fileURLToPath(import.meta.url)), 'check-copy.mjs');
const codes = (blocks, options) => checkBlocks(blocks, options).map((hit) => hit.code);

describe('lines the owner rejected', () => {
  it('flags a pair of short sentences', () => {
    assert.ok(codes(['The model writes words. Code decides what happens.']).includes('slogan-pair'));
  });

  it('flags a pair split across two on-screen headings', () => {
    assert.ok(codes(['The model writes words.', 'Code decides what happens.']).includes('slogan-pair'));
  });

  it('flags a count pair used as a heading', () => {
    assert.ok(codes(['Five apps, three packages']).includes('count-pair'));
  });

  it('flags a verbless fragment', () => {
    assert.ok(codes(['Five formats.']).includes('fragment'));
    assert.ok(codes(['Already booked.']).includes('fragment'));
  });

  it('flags the no X, no Y, just Z shape', () => {
    assert.ok(codes(['No fuss. No waiting. Just coffee.']).includes('no-x-just-y'));
  });

  it('flags a refrain when asked to look for repeats', () => {
    const blocks = ['Keep the rule that the model only drafts.', 'Other words go here in this line.', 'Keep the rule that the model only drafts.'];
    assert.ok(codes(blocks, { flagRepeats: true }).includes('repeated-line'));
    assert.ok(!codes(blocks).includes('repeated-line'));
  });
});

describe('the mechanical rules', () => {
  it('flags em dashes and a comma before and', () => {
    assert.ok(codes(['It works — mostly on weekdays when the shop is open.']).includes('em-dash'));
    assert.ok(codes(['We repair bikes, scooters, and prams in the workshop.']).includes('comma-and'));
  });

  it('allows an en dash in a number range', () => {
    assert.deepEqual(codes(['Open from 9–5 on weekdays at the Woodstock shop.']), []);
  });

  it('flags contrasts, stock phrases, puffery and emoji', () => {
    assert.ok(codes(['This is not just a haircut for you today.']).includes('contrast'));
    assert.ok(codes(["Here's the trap with the old approach to this."]).includes('stock-phrase'));
    assert.ok(codes(['A seamless way to book a table for dinner.']).includes('puffery'));
    assert.ok(codes(['Book a table for dinner at the restaurant 🚀']).includes('emoji'));
  });
});

describe('plain copy passes', () => {
  it('passes the rewrites of the rejected lines', () => {
    const blocks = [
      'The language model drafts each reply and normal code checks it before anything is sent.',
      'The code is in five apps and three shared packages.',
      'The webhook checks the signature before it reads the message.',
    ];
    assert.deepEqual(codes(blocks, { flagRepeats: true }), []);
  });

  it('passes short labels and a domain with dots', () => {
    assert.deepEqual(codes(['Prices', 'Find us', 'Bike repairs in Woodstock', 'Visit swiftholding.co.za for a quote today.']), []);
  });

  it('passes a spoken phone number', () => {
    assert.deepEqual(codes(['Call zero seven four, eight four three on any weekday morning.']), []);
  });

  it('passes short instructions that carry a figure', () => {
    assert.deepEqual(codes(['Drop it off by 10. Collect it the same day.']), []);
  });

  it('passes a line broken by hand with a br', () => {
    assert.deepEqual(codes(htmlToBlocks('<h1>Bike repairs<br>in Woodstock.</h1>')), []);
  });

  it('skips code cards that are not in a pre tag', () => {
    assert.deepEqual(codes(['// workspace, and when code outside imports', 'const a = run();']), []);
  });

  it('does not pair voiceover lines across beats', () => {
    const blocks = ['That is how it ends.', 'Flippy asks them first.'];
    assert.deepEqual(codes(blocks, { pairAcrossBlocks: false }), []);
  });

  it('passes a short sentence beside a long one', () => {
    assert.deepEqual(codes(['Flippy introduces people. It looks through your community and asks you before it asks them.']), []);
  });

  it('skips wording on the allow list', () => {
    assert.deepEqual(codes(['No fuss. No waiting. Just coffee.'], { allow: ['No fuss. No waiting. Just coffee.'] }), []);
  });
});

describe('reading files', () => {
  it('reads visible HTML text and skips code, scripts and styles', () => {
    const html = '<html><head><title>x</title><style>a{}</style></head><body><h1>One&nbsp;line</h1><pre>a, and b</pre><script>var a = "b, and c"</script><p>Two <b>words</b></p></body></html>';
    assert.deepEqual(htmlToBlocks(html), ['One line', 'Two words']);
  });

  it('decodes entities so an encoded em dash is still caught', () => {
    assert.ok(codes(htmlToBlocks('<p>It works &mdash; on weekdays at the shop.</p>')).includes('em-dash'));
  });

  it('strips the beat number from a voiceover line', () => {
    assert.deepEqual(textToBlocks('01|First line\n\n02|Second line\n'), ['First line', 'Second line']);
  });
});

describe('command line', () => {
  const folder = mkdtempSync(join(tmpdir(), 'check-copy-'));
  const write = (name, text) => {
    const path = join(folder, name);
    writeFileSync(path, text);
    return path;
  };

  it('exits 1 on hits', () => {
    const result = spawnSync('node', [script, write('bad.txt', 'Five apps, three packages\n')], { encoding: 'utf8' });
    assert.equal(result.status, 1);
    assert.match(result.stdout, /count-pair/);
  });

  it('exits 0 on plain copy', () => {
    const output = execFileSync('node', [script, write('good.txt', 'The code is in five apps and three shared packages.\n')], { encoding: 'utf8' });
    assert.match(output, /nothing a search can catch/);
  });

  it('exits 2 when there is no text, because reading nothing is not a pass', () => {
    assert.equal(spawnSync('node', [script, write('empty.txt', '\n')], { encoding: 'utf8' }).status, 2);
  });

  it('exits 2 on a missing path', () => {
    assert.equal(spawnSync('node', [script, join(folder, 'missing.txt')], { encoding: 'utf8' }).status, 2);
  });

  it('honours the allow file', () => {
    const allow = write('allow.txt', 'Five apps, three packages\n');
    const result = spawnSync('node', [script, '--allow', allow, write('client.txt', 'Five apps, three packages\nWe build apps for the clinic in Soweto.\n')], { encoding: 'utf8' });
    assert.equal(result.status, 0);
  });
});
