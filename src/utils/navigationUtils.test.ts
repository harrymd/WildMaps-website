import { describe, it, expect } from 'vitest';
import { getNextRoute, getPreviousRoute } from './navigationUtils';

// ─── getNextRoute ──────────────────────────────────────────────────────────────

describe('getNextRoute — region-first ordering', () => {
  it('advances from /region to /subregion', () => {
    expect(getNextRoute('/region', 'region')).toBe('/subregion');
  });

  it('advances from /subregion to /superspecies', () => {
    expect(getNextRoute('/subregion', 'region')).toBe('/superspecies');
  });

  it('advances from /superspecies to /dataset', () => {
    expect(getNextRoute('/superspecies', 'region')).toBe('/dataset');
  });

  it('advances from /dataset to /final', () => {
    expect(getNextRoute('/dataset', 'region')).toBe('/final');
  });

  it('stays on /final when already at the last step', () => {
    expect(getNextRoute('/final', 'region')).toBe('/final');
  });
});

describe('getNextRoute — superspecies-first ordering', () => {
  it('advances from /superspecies to /region', () => {
    expect(getNextRoute('/superspecies', 'superspecies')).toBe('/region');
  });

  it('advances from /region to /subregion', () => {
    expect(getNextRoute('/region', 'superspecies')).toBe('/subregion');
  });

  it('advances from /subregion to /dataset', () => {
    expect(getNextRoute('/subregion', 'superspecies')).toBe('/dataset');
  });

  it('advances from /dataset to /final', () => {
    expect(getNextRoute('/dataset', 'superspecies')).toBe('/final');
  });
});

describe('getNextRoute — edge cases', () => {
  it('defaults to superspecies-first when startingFilter is null', () => {
    expect(getNextRoute('/superspecies', null)).toBe('/region');
  });

  it('returns /final for an unknown route', () => {
    expect(getNextRoute('/unknown', 'region')).toBe('/final');
  });
});

// ─── getPreviousRoute ──────────────────────────────────────────────────────────

describe('getPreviousRoute — region-first ordering', () => {
  it('goes from /subregion back to /region', () => {
    expect(getPreviousRoute('/subregion', 'region')).toBe('/region');
  });

  it('goes from /dataset back to /superspecies', () => {
    expect(getPreviousRoute('/dataset', 'region')).toBe('/superspecies');
  });

  it('goes from /final back to /dataset', () => {
    expect(getPreviousRoute('/final', 'region')).toBe('/dataset');
  });

  it('returns / when already at the first step', () => {
    expect(getPreviousRoute('/region', 'region')).toBe('/');
  });
});

describe('getPreviousRoute — superspecies-first ordering', () => {
  it('goes from /region back to /superspecies', () => {
    expect(getPreviousRoute('/region', 'superspecies')).toBe('/superspecies');
  });

  it('returns / when already at the first step', () => {
    expect(getPreviousRoute('/superspecies', 'superspecies')).toBe('/');
  });
});

describe('getPreviousRoute — edge cases', () => {
  it('returns / for an unknown route', () => {
    expect(getPreviousRoute('/unknown', 'region')).toBe('/');
  });
});
