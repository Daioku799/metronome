import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * LocalStorageと同期するカスタムフック
 * @param key 保存先のキー
 * @param initialValue 初期値
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
  // サーバーサイドレンダリングなどの環境でのエラー回避
  const isServer = typeof window === 'undefined';

  // LocalStorageから値を読み込む関数
  const readValue = useCallback((): T => {
    if (isServer) {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, isServer]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // 最新の値を参照するためのref
  const storedValueRef = useRef<T>(storedValue);
  useEffect(() => {
    storedValueRef.current = storedValue;
  }, [storedValue]);

  // 値を更新し、LocalStorageに保存する関数
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (isServer) {
        return;
      }

      try {
        const valueToStore = value instanceof Function ? value(storedValueRef.current) : value;
        
        // 状態を更新
        setStoredValue(valueToStore);

        // 次の呼び出しのためにrefを同期的に更新
        storedValueRef.current = valueToStore;

        // LocalStorageに保存
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // 同じタブ内の他のフックと同期するためにカスタムイベントを発火
        window.dispatchEvent(new CustomEvent('local-storage', { detail: { key } }));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, isServer]
  );

  // 外部（他のタブや同じタブ内の他フック）からの変更を検知
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent | CustomEvent) => {
      if (event instanceof StorageEvent) {
        // 他のタブからの変更
        if (event.key === key) {
          setStoredValue(readValue());
        }
      } else if (event instanceof CustomEvent) {
        // 同じタブ内の他のフックからの変更
        if (event.detail && (event.detail as { key: string }).key === key) {
          setStoredValue(readValue());
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage', handleStorageChange as EventListener);
    };
  }, [key, readValue]);

  return [storedValue, setValue] as const;
}
