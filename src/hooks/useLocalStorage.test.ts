import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useLocalStorage } from './useLocalStorage';

describe('useLocalStorage', () => {
  const key = 'test-key';
  const initialValue = { foo: 'bar' };

  beforeEach(() => {
    window.localStorage.clear();
    vi.clearAllMocks();
  });

  it('should return initialValue when localStorage is empty', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toEqual(initialValue);
  });

  it('should return stored value when localStorage has data', () => {
    const storedData = { foo: 'stored' };
    window.localStorage.setItem(key, JSON.stringify(storedData));

    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    expect(result.current[0]).toEqual(storedData);
  });

  it('should update localStorage when setValue is called', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    const newValue = { foo: 'new' };

    act(() => {
      result.current[1](newValue);
    });

    expect(result.current[0]).toEqual(newValue);
    expect(window.localStorage.getItem(key)).toBe(JSON.stringify(newValue));
  });

  it('should handle function updates in setValue', () => {
    const { result } = renderHook(() => useLocalStorage<number>(key, 1));

    act(() => {
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(2);
    expect(window.localStorage.getItem(key)).toBe('2');
  });

  it('should handle multiple function updates in a row', () => {
    const { result } = renderHook(() => useLocalStorage<number>(key, 1));

    act(() => {
      result.current[1]((prev) => prev + 1);
      result.current[1]((prev) => prev + 1);
    });

    expect(result.current[0]).toBe(3);
    expect(window.localStorage.getItem(key)).toBe('3');
  });

  it('should sync when local-storage event is fired', () => {
    const { result: hook1 } = renderHook(() => useLocalStorage(key, initialValue));
    const { result: hook2 } = renderHook(() => useLocalStorage(key, initialValue));

    const newValue = { foo: 'synced' };

    act(() => {
      hook1.current[1](newValue);
    });

    // act ensures useEffects are run
    expect(hook2.current[0]).toEqual(newValue);
  });

  it('should handle storage event from other tabs', () => {
    const { result } = renderHook(() => useLocalStorage(key, initialValue));
    const newValue = { foo: 'external' };

    act(() => {
      window.localStorage.setItem(key, JSON.stringify(newValue));
      window.dispatchEvent(
        new StorageEvent('storage', {
          key: key,
          newValue: JSON.stringify(newValue),
        })
      );
    });

    expect(result.current[0]).toEqual(newValue);
  });
});
