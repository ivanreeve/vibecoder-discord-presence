import { test } from 'node:test';
import assert from 'node:assert/strict';
import { prettyModel } from '../src/provider/transcript';

test('prettyModel: friendly labels for current model ids', () => {
  const cases: Array<[string, string]> = [
    ['claude-opus-4-8', 'Opus 4.8'],
    ['claude-opus-4-7', 'Opus 4.7'],
    ['claude-fable-5', 'Fable 5'], // single-part version
    ['claude-fable-5[1m]', 'Fable 5'], // Claude Code variant tag dropped
    ['claude-sonnet-5', 'Sonnet 5'],
    ['claude-haiku-4-5-20251001', 'Haiku 4.5'], // trailing date stamp dropped
  ];
  for (const [input, want] of cases) {
    assert.equal(prettyModel(input), want, `prettyModel(${JSON.stringify(input)})`);
  }
});

test('prettyModel: an unrecognized id passes through unchanged', () => {
  assert.equal(prettyModel('gpt-4o'), 'gpt-4o');
  assert.equal(prettyModel('<synthetic>'), '<synthetic>');
});
