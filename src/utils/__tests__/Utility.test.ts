import { getAvailableDriverIds } from 'utils/Utility';

describe('getAvailableDriverIds', () => {
  const originalValue = process.env.REACT_APP_DRIVERS_MAP;

  afterEach(() => {
    process.env.REACT_APP_DRIVERS_MAP = originalValue;
  });

  it('returns sorted IDs from REACT_APP_DRIVERS_MAP', () => {
    process.env.REACT_APP_DRIVERS_MAP = JSON.stringify({ 'b@x.com': 2, 'a@x.com': 1 });
    expect(getAvailableDriverIds()).toEqual([1, 2]);
  });

  it('returns 3 driver IDs when 3 emails are mapped', () => {
    process.env.REACT_APP_DRIVERS_MAP = JSON.stringify({ 'a@x.com': 1, 'b@x.com': 2, 'c@x.com': 3 });
    expect(getAvailableDriverIds()).toEqual([1, 2, 3]);
  });

  it('deduplicates when multiple emails share the same driver ID', () => {
    process.env.REACT_APP_DRIVERS_MAP = JSON.stringify({ 'a@x.com': 1, 'b@x.com': 1, 'c@x.com': 2 });
    expect(getAvailableDriverIds()).toEqual([1, 2]);
  });

  it('returns an empty array when REACT_APP_DRIVERS_MAP is an empty object', () => {
    process.env.REACT_APP_DRIVERS_MAP = '{}';
    expect(getAvailableDriverIds()).toEqual([]);
  });

  it('falls back to [1, 2] when REACT_APP_DRIVERS_MAP contains invalid JSON', () => {
    process.env.REACT_APP_DRIVERS_MAP = 'not-valid-json';
    expect(getAvailableDriverIds()).toEqual([1, 2]);
  });

  it('returns an empty array when REACT_APP_DRIVERS_MAP is undefined', () => {
    delete process.env.REACT_APP_DRIVERS_MAP;
    // undefined ?? '{}' => '{}' => {} => []
    expect(getAvailableDriverIds()).toEqual([]);
  });

  it('sorts IDs in ascending order regardless of insertion order', () => {
    process.env.REACT_APP_DRIVERS_MAP = JSON.stringify({ 'z@x.com': 3, 'm@x.com': 1, 'a@x.com': 2 });
    expect(getAvailableDriverIds()).toEqual([1, 2, 3]);
  });
});
