import { useState, useEffect, useCallback } from 'react';

// Tipos
type SetValue<T> = (value: T | ((val: T) => T)) => void;

interface UseLocalStorageOptions {
  serialize?: (value: any) => string;
  deserialize?: (value: string) => any;
  syncAcrossTabs?: boolean;
}

/**
 * Hook personalizado para gerenciar localStorage de forma segura
 * @param key - Chave do localStorage
 * @param initialValue - Valor inicial se não existir no localStorage
 * @param options - Opções de configuração
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options: UseLocalStorageOptions = {}
): [T, SetValue<T>, () => void] {
  const {
    serialize = JSON.stringify,
    deserialize = JSON.parse,
    syncAcrossTabs = true
  } = options;

  // Função para ler do localStorage de forma segura
  const readValue = useCallback((): T => {
    // Verifica se está no browser
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (item === null) {
        return initialValue;
      }
      return deserialize(item);
    } catch (error) {
      console.warn(`Erro ao ler localStorage para chave "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key, deserialize]);

  // Estado local
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Função para salvar no localStorage
  const setValue: SetValue<T> = useCallback(
    (value) => {
      // Verifica se está no browser
      if (typeof window === 'undefined') {
        console.warn('localStorage não está disponível no servidor');
        return;
      }

      try {
        // Permite função para atualizar baseado no valor anterior
        const newValue = value instanceof Function ? value(storedValue) : value;
        
        // Atualiza o estado local
        setStoredValue(newValue);
        
        // Salva no localStorage
        if (newValue === undefined) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, serialize(newValue));
        }

        // Dispara evento customizado para sincronização entre abas
        if (syncAcrossTabs) {
          window.dispatchEvent(
            new CustomEvent('local-storage-change', {
              detail: { key, newValue }
            })
          );
        }
      } catch (error) {
        console.error(`Erro ao salvar no localStorage para chave "${key}":`, error);
      }
    },
    [key, serialize, storedValue, syncAcrossTabs]
  );

  // Função para remover do localStorage
  const removeValue = useCallback(() => {
    if (typeof window === 'undefined') {
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);

      if (syncAcrossTabs) {
        window.dispatchEvent(
          new CustomEvent('local-storage-change', {
            detail: { key, newValue: undefined }
          })
        );
      }
    } catch (error) {
      console.error(`Erro ao remover do localStorage para chave "${key}":`, error);
    }
  }, [key, initialValue, syncAcrossTabs]);

  // Sincronização entre abas
  useEffect(() => {
    if (!syncAcrossTabs) return;

    const handleStorageChange = (e: StorageEvent | CustomEvent) => {
      let targetKey: string;
      let newValue: any;

      if (e instanceof StorageEvent) {
        // Evento nativo do localStorage
        targetKey = e.key || '';
        newValue = e.newValue;
      } else {
        // Evento customizado
        targetKey = e.detail.key;
        newValue = e.detail.newValue;
      }

      if (targetKey === key) {
        try {
          if (newValue === null || newValue === undefined) {
            setStoredValue(initialValue);
          } else {
            setStoredValue(
              typeof newValue === 'string' ? deserialize(newValue) : newValue
            );
          }
        } catch (error) {
          console.warn(`Erro ao sincronizar localStorage para chave "${key}":`, error);
        }
      }
    };

    // Adiciona listeners
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('local-storage-change', handleStorageChange as EventListener);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('local-storage-change', handleStorageChange as EventListener);
    };
  }, [key, initialValue, deserialize, syncAcrossTabs]);

  // Re-sincroniza quando a aba ganha foco
  useEffect(() => {
    const handleFocus = () => {
      setStoredValue(readValue());
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [readValue]);

  return [storedValue, setValue, removeValue];
}

// Hook específico para arrays (utilitário)
export function useLocalStorageArray<T>(
  key: string,
  initialValue: T[] = []
): [T[], (items: T[]) => void, (item: T) => void, (predicate: (item: T) => boolean) => void, () => void] {
  const [items, setItems, removeItems] = useLocalStorage<T[]>(key, initialValue);

  const addItem = useCallback((item: T) => {
    setItems(prev => [...prev, item]);
  }, [setItems]);

  const removeItem = useCallback((predicate: (item: T) => boolean) => {
    setItems(prev => prev.filter(item => !predicate(item)));
  }, [setItems]);

  return [items, setItems, addItem, removeItem, removeItems];
}

// Hook específico para objetos (utilitário)
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
): [T, (updates: Partial<T>) => void, (property: keyof T) => void, () => void] {
  const [obj, setObj, removeObj] = useLocalStorage<T>(key, initialValue);

  const updateObject = useCallback((updates: Partial<T>) => {
    setObj(prev => ({ ...prev, ...updates }));
  }, [setObj]);

  const removeProperty = useCallback((property: keyof T) => {
    setObj(prev => {
      const { [property]: removed, ...rest } = prev;
      return rest as T;
    });
  }, [setObj]);

  return [obj, updateObject, removeProperty, removeObj];
}

// Utilitários extras
export const localStorageUtils = {
  // Verifica se localStorage está disponível
  isAvailable: (): boolean => {
    try {
      const test = '__localStorage_test__';
      window.localStorage.setItem(test, 'test');
      window.localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  },

  // Obtém uso atual do localStorage
  getUsage: (): { used: number; available: number; percentage: number } => {
    let used = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length + key.length;
      }
    }
    const available = 5 * 1024 * 1024; // 5MB aproximadamente
    return {
      used,
      available,
      percentage: Math.round((used / available) * 100)
    };
  },

  // Limpa dados expirados (se implementado)
  clearExpired: (prefix: string = '') => {
    const now = Date.now();
    const keysToRemove: string[] = [];

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          if (data.expiry && now > data.expiry) {
            keysToRemove.push(key);
          }
        } catch {
          // Ignora erros de parsing
        }
      }
    }

    keysToRemove.forEach(key => localStorage.removeItem(key));
    return keysToRemove.length;
  }
};

export default useLocalStorage;