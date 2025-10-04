// ESM Startup Profiler (TypeScript)
// Run with: NODE_OPTIONS="--import file://$PWD/dist/profiling/startup-profiler.mjs" node dist/server.js
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import https from 'node:https';
import { performance } from 'node:perf_hooks';
import async_hooks from 'node:async_hooks';
import inspector from 'node:inspector';
import Module from 'node:module';

// -------------------- config --------------------
const THRESHOLD_MS = Number(process.env.STARTUP_PROFILER_SLOW ?? 15);
const REPORT_TXT = path.resolve(
    process.cwd(),
    process.env.STARTUP_PROFILER_TXT ?? 'startup-report.txt',
);
const TRACE_JSON = path.resolve(
    process.cwd(),
    process.env.STARTUP_PROFILER_TRACE ?? 'startup-trace.json',
);
const CPU_PROFILE = path.resolve(
    process.cwd(),
    process.env.STARTUP_CPU_PROFILE ?? 'startup-cpu.cpuprofile',
);
const STACK_FRAMES = Number(process.env.STARTUP_STACK_FRAMES ?? 6);
// Additional tuning knobs
const MODULE_LOAD_THRESHOLD = Number(process.env.STARTUP_MODULE_THRESHOLD ?? 5); // ms for reporting slow module loads
const ENABLE_PROMISE_STACK_GROUPING = Boolean(
    (process.env.STARTUP_GROUP_PROMISE_STACK ?? '1') !== '0',
);
const MAX_PROMISE_STACKS = Number(process.env.STARTUP_MAX_PROMISE_STACKS ?? 30);
const CAPTURE_MODULE_STACK = Boolean(
    (process.env.STARTUP_MODULE_STACK ?? '1') !== '0',
);
const MIGRATIONS_KEYWORD =
    process.env.STARTUP_MIGRATIONS_KEYWORD ?? '/migrations';

// -------------------- trace helpers (Chrome trace) --------------------
Error.stackTraceLimit = 50;
type TraceEvt =
    | {
          name: string;
          cat: string;
          ph: 'B' | 'E';
          ts: number;
          pid: number;
          tid: number;
          args?: Record<string, unknown>;
      }
    | {
          name: string;
          cat: string;
          ph: 'i';
          s: 't';
          ts: number;
          pid: number;
          tid: number;
          args?: Record<string, unknown>;
      };

const traceEvents: TraceEvt[] = [];
function tsNowUs() {
    return (performance.timeOrigin + performance.now()) * 1000;
}
function traceBegin(
    name: string,
    cat = 'startup',
    args: Record<string, unknown> = {},
) {
    traceEvents.push({
        name,
        cat,
        ph: 'B',
        ts: tsNowUs(),
        pid: process.pid,
        tid: 0,
        args,
    });
}
function traceEnd(
    name: string,
    cat = 'startup',
    args: Record<string, unknown> = {},
) {
    traceEvents.push({
        name,
        cat,
        ph: 'E',
        ts: tsNowUs(),
        pid: process.pid,
        tid: 0,
        args,
    });
}
function traceInstant(
    name: string,
    cat = 'startup',
    args: Record<string, unknown> = {},
) {
    traceEvents.push({
        name,
        cat,
        ph: 'i',
        s: 't',
        ts: tsNowUs(),
        pid: process.pid,
        tid: 0,
        args,
    });
}
traceInstant('process_start');

// -------------------- label context --------------------
// We attribute async work to *who scheduled it* via a label carried on the async tree.
type Ctx = { label: string; stack?: string[] };
const ctxLabel = new Map<number, Ctx>(); // executionAsyncId -> ctx
const parentOf = new Map<number, number>(); // child asyncId -> parent asyncId

function cleanStack(max = STACK_FRAMES): string[] | undefined {
    const raw = (new Error().stack ?? '').split('\n').slice(2);
    const user = raw
        .map((l) => l.trim())
        .filter(
            (l) =>
                !/(node:internal|\/async_hooks|\/perf_hooks|\/inspector|startup-profiler)/.test(
                    l,
                ),
        )
        .map((l) => l.replace(`${process.cwd()}/`, ''))
        .slice(0, max);
    return user.length ? user : undefined;
}

function stackSignature(stack?: string[]): string | undefined {
    if (!stack || !stack.length) return undefined;
    return stack
        .slice(0, 4)
        .map((f) => f.replace(/:\d+:\d+\)?$/, ')').replace(/\s+/g, ' '))
        .join(' | ');
}

function setLabelForCurrent(label: string) {
    const id = async_hooks.executionAsyncId();
    ctxLabel.set(id, { label, stack: cleanStack() });
}

function resolveLabelFrom(triggerId?: number): Ctx | undefined {
    let t = triggerId;
    let hops = 0;
    while (typeof t === 'number' && hops < 100) {
        const ctx = ctxLabel.get(t);
        if (ctx) return ctx;
        t = parentOf.get(t);
        hops++;
    }
    return undefined;
}

// -------------------- wrap listen() to mark startup end --------------------
const START = performance.now();
let END: number | null = null;
let listenTarget: {
    proto: 'http' | 'https';
    address: string | null;
    port: number | null;
} | null = null;

function wrapListen(
    proto: 'http' | 'https',
    Cls: typeof http.Server | typeof https.Server,
) {
    const orig = (Cls as any).prototype.listen as http.Server['listen'];
    (Cls as any).prototype.listen = function (...args: any[]) {
        const res = orig.apply(this, args as any);
        const onListening = () => {
            if (END) return;
            END = performance.now();
            try {
                this.removeListener('listening', onListening);
            } catch {}
            const addr = this.address() as any;
            listenTarget = {
                proto,
                address:
                    typeof addr === 'string' ? addr : (addr?.address ?? null),
                port: typeof addr === 'string' ? null : (addr?.port ?? null),
            };
            finalize();
        };
        this.on('listening', onListening);
        traceInstant(`listen_called:${proto}`, 'listen', {
            args: summarizeListenArgs(args),
        });
        return res;
    };
}
function summarizeListenArgs(args: any[]) {
    const out: Record<string, unknown> = {};
    for (const a of args) {
        if (typeof a === 'number') out.port = a;
        else if (typeof a === 'string') out.hostOrPath = a;
    }
    return out;
}
wrapListen('http', http.Server);
wrapListen('https', https.Server);

// Safety net when no server listens (CLIs, failed boots)
process.on('beforeExit', () => {
    if (!END) {
        END = performance.now();
        finalize(true);
    }
});

// -------------------- patch common async APIs (so we can label) --------------------
const g: any = globalThis;

// fetch (undici)
if (typeof g.fetch === 'function') {
    const origFetch = g.fetch.bind(g);
    g.fetch = async (...args: any[]) => {
        const url =
            typeof args[0] === 'string' ? args[0] : (args[0]?.url ?? '');
        setLabelForCurrent(`fetch ${url}`);
        traceBegin(`fetch:${url}`, 'net');
        try {
            return await origFetch(...args);
        } finally {
            traceEnd(`fetch:${url}`, 'net');
        }
    };
}

// timers
for (const name of ['setTimeout', 'setImmediate'] as const) {
    const orig = (g as any)[name].bind(g);
    (g as any)[name] = (fn: Function, ...rest: any[]) => {
        setLabelForCurrent(name);
        return orig(fn, ...rest);
    };
}

// (Optional) add wrappers for SDK init you suspect:
// e.g. before prisma.connect() / otel.start() / redis.connect(), call setLabelForCurrent('prisma.connect').

// -------------------- async_hooks: timing + label inheritance --------------------
type Rec = { type: string; start: number; ctx?: Ctx };
const asyncMap = new Map<number, Rec>();

const metrics = {
    async: { total: 0, time: 0, byType: new Map<string, number>() },
};
const slow: Array<{
    type: string;
    ms: number;
    id: number;
    label?: string;
    stack?: string[];
}> = [];

// Promise stack aggregation
interface PromiseStackAgg {
    time: number;
    count: number;
    stack?: string[];
    label?: string;
}
const promiseStacks = new Map<string, PromiseStackAgg>();

// Module load timing records
interface ModuleLoadRec {
    request: string;
    parent?: string;
    ms: number;
    stack?: string[];
}
const moduleLoads: ModuleLoadRec[] = [];

const _load = (Module as any)._load as (
    req: string,
    parent: any,
    isMain: boolean,
) => any;
(Module as any)._load = function (req: string, parent: any, isMain: boolean) {
    const modStart = performance.now();
    const stack = CAPTURE_MODULE_STACK ? cleanStack(6) : undefined;
    // biome-ignore lint/style/noArguments: preserve args
    const mod = _load.apply(this, arguments as any);
    const dt = performance.now() - modStart;
    if (!END && dt >= MODULE_LOAD_THRESHOLD) {
        moduleLoads.push({
            request: req,
            parent: parent?.filename,
            ms: dt,
            stack,
        });
        traceInstant('module_load', 'module', { req, ms: dt });
    }

    if (req === 'db-migrate' && mod && !(mod as any).__startupPatched) {
        (mod as any).__startupPatched = true;
        const origGetInstance = (mod as any).getInstance?.bind(mod);
        if (origGetInstance) {
            (mod as any).getInstance = (...args: any[]) => {
                const inst = origGetInstance(...args);
                for (const m of [
                    'up',
                    'down',
                    'reset',
                    'sync',
                    'connect',
                ] as const) {
                    const fn = (inst as any)[m];
                    if (typeof fn === 'function') {
                        (inst as any)[m] = async function (...fa: any[]) {
                            setLabelForCurrent(`db-migrate ${m}`);
                            traceBegin(`db-migrate:${m}`, 'db');
                            try {
                                return await fn.apply(this, fa);
                            } finally {
                                traceEnd(`db-migrate:${m}`, 'db');
                            }
                        };
                    }
                }
                return inst;
            };
        }
    }

    if (req === 'pg' && mod && !(mod as any).__startupPatched) {
        (mod as any).__startupPatched = true;
        try {
            const { Client, Pool } = mod as any;
            if (Client?.prototype?.connect) {
                const orig = Client.prototype.connect;
                Client.prototype.connect = function (...fa: any[]) {
                    setLabelForCurrent('pg.connect');
                    return orig.apply(this, fa);
                };
            }
            if (Pool?.prototype?.connect) {
                const origP = Pool.prototype.connect;
                Pool.prototype.connect = function (...fa: any[]) {
                    setLabelForCurrent('pg.pool.connect');
                    return origP.apply(this, fa);
                };
            }
        } catch {}
    }

    return mod;
};

// Patch CJS compilation to surface big parse/transform cost
const exts = Module as any;
if (exts?._extensions) {
    for (const [ext, loader] of Object.entries<any>(exts._extensions)) {
        if (typeof loader !== 'function') continue;
        if ((loader as any).__startupPatched) continue;
        exts._extensions[ext] = (m: any, filename: string) => {
            const start = performance.now();
            try {
                return loader(m, filename);
            } finally {
                const dt2 = performance.now() - start;
                if (!END && dt2 >= MODULE_LOAD_THRESHOLD) {
                    moduleLoads.push({
                        request: filename.replace(`${process.cwd()}/`, ''),
                        parent: 'compile',
                        ms: dt2,
                        stack: CAPTURE_MODULE_STACK ? cleanStack(4) : undefined,
                    });
                    traceInstant('module_compile', 'module', {
                        file: filename,
                        ms: dt2,
                    });
                }
            }
        };
        (exts._extensions[ext] as any).__startupPatched = true;
    }
}

// Targeted fs instrumentation (especially for large migrations directory scans)
function markIfMigrations(op: string, target: any) {
    if (typeof target === 'string' && target.includes(MIGRATIONS_KEYWORD)) {
        setLabelForCurrent(`${op}:${path.basename(target)}`);
    }
}
try {
    const origReaddir = fs.readdir.bind(fs);
    fs.readdir = ((...args: Parameters<typeof fs.readdir>) => {
        markIfMigrations('fs.readdir', args[0]);
        return (origReaddir as any)(...(args as any));
    }) as any;
    const origReadFile = fs.readFile.bind(fs);
    fs.readFile = ((...args: Parameters<typeof fs.readFile>) => {
        markIfMigrations('fs.readFile', args[0]);
        return (origReadFile as any)(...(args as any));
    }) as any;
    if (fs.promises) {
        const p = fs.promises as any;
        if (p.readdir) {
            const orig = p.readdir.bind(p);
            p.readdir = async (...args: any[]) => {
                markIfMigrations('fsp.readdir', args[0]);
                return orig(...args);
            };
        }
        if (p.readFile) {
            const orig = p.readFile.bind(p);
            p.readFile = async (...args: any[]) => {
                markIfMigrations('fsp.readFile', args[0]);
                return orig(...args);
            };
        }
    }
} catch {}

const ahook = async_hooks.createHook({
    init(asyncId, type, triggerAsyncId) {
        parentOf.set(asyncId, triggerAsyncId);
        const rec: Rec = { type, start: performance.now() };
        const inherited = resolveLabelFrom(triggerAsyncId);
        if (inherited) {
            rec.ctx = inherited;
        } else if (type === 'PROMISE') {
            // fallback: capture a small user stack so "Sample of slow ops" isn't empty
            rec.ctx = { label: 'promise', stack: cleanStack(12) };
        }
        asyncMap.set(asyncId, rec);
        traceBegin(`async:${type}:${asyncId}`, 'async', {
            type,
            label: inherited?.label,
        });
    },
    destroy(asyncId) {
        const rec = asyncMap.get(asyncId);
        if (!rec) return;
        asyncMap.delete(asyncId);
        const dt = performance.now() - rec.start;
        metrics.async.total++;
        metrics.async.time += dt;
        metrics.async.byType.set(
            rec.type,
            (metrics.async.byType.get(rec.type) ?? 0) + dt,
        );
        const label = rec.ctx?.label;
        const stack = rec.ctx?.stack;
        traceEnd(`async:${rec.type}:${asyncId}`, 'async', {
            dur: dt,
            label,
            stack,
        });
        if (!END && dt >= THRESHOLD_MS) {
            slow.push({ type: rec.type, ms: dt, id: asyncId, label, stack });
            if (ENABLE_PROMISE_STACK_GROUPING && rec.type === 'PROMISE') {
                const sig = stackSignature(stack);
                if (sig) {
                    const agg = promiseStacks.get(sig) || {
                        time: 0,
                        count: 0,
                        stack,
                        label,
                    };
                    agg.time += dt;
                    agg.count += 1;
                    if (!agg.stack && stack) agg.stack = stack;
                    promiseStacks.set(sig, agg);
                }
            }
        }
    },
});
ahook.enable();

// -------------------- CPU profile during startup --------------------
let session: inspector.Session | null = null;
try {
    session = new inspector.Session();
    session.connect();
    await new Promise<void>((r) =>
        session!.post('Profiler.enable', () =>
            session!.post('Profiler.start', () => r()),
        ),
    );
} catch {
    // ignore if inspector unavailable
}

// -------------------- finalize & reporting --------------------
function pct(n: number) {
    return `${((n / Math.max(1, END! - START)) * 100).toFixed(1)}%`;
}

function writeCpuProfile() {
    if (!session) return;
    try {
        session.post('Profiler.stop', (_err: any, payload: any) => {
            try {
                fs.writeFileSync(
                    CPU_PROFILE,
                    JSON.stringify(payload?.profile ?? payload ?? {}),
                );
            } catch {}
            try {
                session?.disconnect();
            } catch {}
            session = null;
        });
    } catch {
        /* ignore */
    }
}

function finalize(noListen = false) {
    try {
        ahook.disable();
    } catch {}
    traceInstant('startup_end', 'milestone', { noListen });
    const total = END! - START;

    // Aggregate by label for readability
    const byLabel = new Map<
        string,
        { count: number; time: number; sampleStack?: string[] }
    >();
    for (const s of slow) {
        const key = s.label ?? s.type;
        const agg = byLabel.get(key) ?? {
            count: 0,
            time: 0,
            sampleStack: s.stack,
        };
        agg.count++;
        agg.time += s.ms;
        if (!agg.sampleStack && s.stack) agg.sampleStack = s.stack;
        byLabel.set(key, agg);
    }

    const lines: string[] = [];
    lines.push(`Node ${process.version} | PID ${process.pid}`);
    lines.push(`Startup window: ${total.toFixed(2)} ms`);
    if (listenTarget && !noListen) {
        lines.push(
            `First server listening: ${listenTarget.proto}://${listenTarget.address ?? '0.0.0.0'}:${listenTarget.port ?? ''}`,
        );
    } else {
        lines.push(
            `No server "listening" detected; dumping until process idle.`,
        );
    }
    lines.push('');

    lines.push(`= Async operations before listen =`);
    lines.push(
        `  ops: ${metrics.async.total} | time (sum): ${metrics.async.time.toFixed(2)} ms`,
    );
    if (metrics.async.byType.size) {
        lines.push(`  by type:`);
        for (const [t, ms] of [...metrics.async.byType.entries()].sort(
            (a, b) => b[1] - a[1],
        )) {
            lines.push(`    ${t.padEnd(14)} ${ms.toFixed(2)} ms (${pct(ms)})`);
        }
    }

    lines.push('');
    lines.push(`= Top slow async groups (by label) =`);
    if (byLabel.size === 0) {
        lines.push('  (none over threshold)');
    } else {
        for (const [label, v] of [...byLabel.entries()]
            .sort((a, b) => b[1].time - a[1].time)
            .slice(0, 30)) {
            lines.push(
                `  ${label}: ${v.time.toFixed(2)} ms across ${v.count} ops`,
            );
            if (v.sampleStack)
                for (const f of v.sampleStack.slice(0, 5))
                    lines.push(`      at ${f}`);
        }
    }

    if (slow.length) {
        lines.push('');
        lines.push(`= Sample of slow ops (>${THRESHOLD_MS} ms) =`);
        for (const s of slow.sort((a, b) => b.ms - a.ms).slice(0, 50)) {
            lines.push(
                `  ${s.ms.toFixed(2)} ms  ${s.type}${s.label ? `  [${s.label}]` : ''} (id ${s.id})`,
            );
            if (s.stack?.length)
                for (const f of s.stack.slice(0, 4))
                    lines.push(`      at ${f}`);
        }
    }

    if (ENABLE_PROMISE_STACK_GROUPING && promiseStacks.size) {
        lines.push('');
        lines.push('= Top PROMISE stacks (aggregated) =');
        for (const [sig, agg] of [...promiseStacks.entries()]
            .sort((a, b) => b[1].time - a[1].time)
            .slice(0, MAX_PROMISE_STACKS)) {
            lines.push(
                `  ${agg.time.toFixed(2)} ms across ${agg.count} promises :: ${sig}${agg.label ? ` [label:${agg.label}]` : ''}`,
            );
            if (agg.stack) {
                for (const f of agg.stack.slice(0, 6))
                    lines.push(`      at ${f}`);
            }
        }
    }

    if (moduleLoads.length) {
        lines.push('');
        lines.push('= Slow module loads / compilations =');
        const byReq = new Map<
            string,
            { time: number; count: number; stack?: string[] }
        >();
        for (const m of moduleLoads) {
            const key = m.request;
            const agg = byReq.get(key) || {
                time: 0,
                count: 0,
                stack: m.stack,
            };
            agg.time += m.ms;
            agg.count += 1;
            if (!agg.stack && m.stack) agg.stack = m.stack;
            byReq.set(key, agg);
        }
        for (const [req, agg] of [...byReq.entries()]
            .sort((a, b) => b[1].time - a[1].time)
            .slice(0, 40)) {
            lines.push(
                `  ${agg.time.toFixed(2)} ms across ${agg.count} load(s) :: ${req}`,
            );
            if (agg.stack) {
                for (const f of agg.stack.slice(0, 4))
                    lines.push(`      at ${f}`);
            }
        }
    }

    lines.push('');
    lines.push(
        `Tips: move DB connect/migrations after listen(); lazy-load heavy routes; avoid sync FS; defer remote config/secret fetches; inspect "Slow module loads" and "Top PROMISE stacks" (tune with STARTUP_* env vars).`,
    );

    try {
        fs.writeFileSync(REPORT_TXT, `${lines.join('\n')}\n`, 'utf8');
    } catch {}
    try {
        fs.writeFileSync(
            TRACE_JSON,
            JSON.stringify({ traceEvents }, null, 2),
            'utf8',
        );
    } catch {}
    writeCpuProfile();

    console.error(
        `[startup-profiler] ${total.toFixed(2)} ms before first "listening". Report: ${REPORT_TXT} | Trace: ${TRACE_JSON} | CPU: ${CPU_PROFILE}`,
    );
}
