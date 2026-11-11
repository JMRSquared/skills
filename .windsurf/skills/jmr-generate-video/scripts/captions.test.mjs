import assert from 'node:assert/strict';
import { test } from 'node:test';
import { alignPauses, captionProblems, pauseAfter, readGroups } from './captions.mjs';

test('groups that end on a whole phrase pass', () => {
  assert.deepEqual(captionProblems(['No power steering', 'the one you pushed', 'more than you drove']), []);
});

test('a group that ends on a word needing the next one is reported', () => {
  const found = captionProblems(['That thing carried the', 'whole family']);
  assert.equal(found.length, 1);
  assert.match(found[0], /ends on "the"/);
});

test('a number split across two groups is reported once', () => {
  const found = captionProblems(['had the Nissan fourteen', 'hundred']);
  assert.equal(found.length, 1);
  assert.match(found[0], /splits a number/);
});

test('the last group may end on any word', () => {
  assert.deepEqual(captionProblems(['do you still miss it', 'tell us which one and']), []);
});

test('a group that ends where the script pauses passes', () => {
  const groups = ['Nobody taught us that', 'The taxi makes its', 'own lane'];
  const pauses = alignPauses(groups, pauseAfter('Welcome to the show! Nobody taught us that. The taxi makes its own lane.'));
  assert.equal(captionProblems(groups, pauses).length, 1);
});

test('a script that does not match the groups is ignored', () => {
  const groups = ['carried the', 'whole family'];
  const pauses = alignPauses(groups, pauseAfter('Something else entirely.'));
  assert.deepEqual(pauses, []);
  assert.equal(captionProblems(groups, pauses).length, 1);
});

test('marked groups are read from data-caption-group', () => {
  const html = '<div data-caption-group><span>Hilux</span> <span>or</span></div><div data-caption-group>Ranger?</div>';
  assert.deepEqual(readGroups(html), ['Hilux or', 'Ranger?']);
});

test('unmarked caption markup is read one group per line, skipping scripts', () => {
  const html = [
    '<div id="cap0"><p><span>For</span> <span>a</span> <span>lot</span> <span>of</span></p></div>',
    '<div id="cap1"><p><span>us</span></p></div>',
    '<script>tl.set("<span>no</span>")</script>',
  ].join('\n');
  assert.deepEqual(readGroups(html), ['For a lot of', 'us']);
});
