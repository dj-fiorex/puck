// mergeWithPriority.ts

export type Priority = 'left' | 'right';
export type ArrayStrategy = 'replace' | 'concat' | 'mergeByIndex';

export interface MergeOptions {
  /**
   * Chi ha priorità quando i due valori sono _non_ unificabili via deep-merge:
   *
   * - "right": vince `right` (default)
   * - "left": vince `left`
   */
  priority?: Priority;

  /**
   * Strategia per gli array quando entrambi i valori sono Array:
   *
   * - "replace": usa quello con priorità (default)
   * - "concat": concatena [ ...left, ...right ]
   * - "mergeByIndex": merge ricorsivo elemento per elemento (fino a max length)
   */
  arrayStrategy?: ArrayStrategy;

  /** Resolver custom di conflitto (più potente della priority). Se ritorni `undefined`, si applica la logica standard. */
  customResolver?: (keyPath: string, leftVal: unknown, rightVal: unknown) => unknown | undefined;
}

// ---------- Helpers ----------
const isPlainObject = (v: unknown): v is Record<string, unknown> =>
  Object.prototype.toString.call(v) === '[object Object]';

// const isMergeableObject = (v: unknown) => v && (isPlainObject(v) || Array.isArray(v));

const joinPath = (base: string, key: string) => (base ? `${base}.${key}` : key);

// ---------- Shallow ----------
/** Merge shallow (primo livello). In caso di conflitto vince `priority`. */
export function mergeShallow<L extends object, R extends object>(
  left: L,
  right: R,
  priority: Priority = 'right',
): L & R {
  return (priority === 'left' ? { ...right, ...left } : { ...left, ...right }) as L & R;
}

// ---------- Deep ----------
/**
 * Deep merge tipizzato. Ritorna un tipo compatto L & R. Gestisce oggetti, array (con più strategie), Date/Map/Set come
 * valori non-mergeabili (si applica priority o customResolver).
 */
export function mergeDeep<L extends object, R extends object>(left: L, right: R, options: MergeOptions = {}): L & R {
  const { priority = 'right', arrayStrategy = 'replace', customResolver } = options;

  const _merge = (a: unknown, b: unknown, path: string): unknown => {
    // custom resolver
    if (customResolver) {
      const resolved = customResolver(path, a, b);
      if (resolved !== undefined) return resolved;
    }

    // Se uno dei due è undefined/null, ritorna l'altro
    if (a === undefined) return b;
    if (b === undefined) return a;

    // Date / Map / Set / Function / non-mergeable: applica priority
    const isSpecial =
      a instanceof Date ||
      b instanceof Date ||
      a instanceof Map ||
      b instanceof Map ||
      a instanceof Set ||
      b instanceof Set ||
      typeof a === 'function' ||
      typeof b === 'function';

    if (isSpecial) {
      return priority === 'right' ? cloneValue(b) : cloneValue(a);
    }

    // Array
    if (Array.isArray(a) && Array.isArray(b)) {
      if (arrayStrategy === 'replace') {
        return priority === 'right' ? b.slice() : a.slice();
      }
      if (arrayStrategy === 'concat') {
        return a.concat(b);
      }
      // mergeByIndex
      const len = Math.max(a.length, b.length);
      const out = new Array(len);
      for (let i = 0; i < len; i++) {
        out[i] = _merge(a[i], b[i], `${path}[${i}]`);
      }
      return out;
    }

    // Oggetti plain
    if (isPlainObject(a) && isPlainObject(b)) {
      const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
      const out: Record<string, unknown> = {};
      for (const k of keys) {
        out[k] = _merge(a[k], b[k], joinPath(path, k));
      }
      return out;
    }

    // Tipi primitivi o misti non mergeabili: applica priority
    return priority === 'right' ? cloneValue(b) : cloneValue(a);
  };

  return _merge(left, right, '') as L & R;
}

// ---------- Utils ----------
function cloneValue<T = unknown>(v: T): T {
  if (v instanceof Date) return new Date(v.getTime()) as T;
  if (v instanceof Map) return new Map(v) as T;
  if (v instanceof Set) return new Set(v) as T;
  if (Array.isArray(v)) return v.slice() as T;
  if (isPlainObject(v)) return { ...v } as T;
  return v;
}
