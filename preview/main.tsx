import { StrictMode, useEffect, useMemo, useState } from "react"
import { createRoot } from "react-dom/client"

import { generateIcon, ICON_STYLES, LATEST_ICON_VERSION, PALETTES, type IconStyle, type FunconConfig } from "../src/index.js"
import { Funcon } from "../src/react.js"

const SIZES = [80, 32, 24]
const COUNTS = [100, 200, 400]
const VIEWS = ["all", ...ICON_STYLES, "mixed"]
const FAMILY_LABEL: Record<IconStyle, string> = { geometric: "A · Geometric", abstract: "B · Abstract", color: "C · Color" }
const SAMPLE_NAMES = ["acme", "design", "platform", "marketing", "data-science", "help-center"]

const config = (style: IconStyle, seed: string): FunconConfig => ({ version: LATEST_ICON_VERSION, style, seed })

function readParams() {
  const params = new URLSearchParams(location.search)
  const view = params.get("view") ?? ""
  return {
    view: VIEWS.includes(view) ? view : "all",
    size: Number(params.get("size")) || SIZES[0],
    count: Number(params.get("count")) || COUNTS[0],
    seed: params.get("seed") ?? "funcon",
  }
}

function Segmented<T extends string | number>({ options, value, onChange, unit = "" }: { options: readonly T[]; value: T; onChange: (v: T) => void; unit?: string }) {
  return (
    <div className="segmented">
      {options.map((option) => (
        <button key={option} type="button" aria-pressed={option === value} onClick={() => onChange(option)}>
          {option}
          {unit}
        </button>
      ))}
    </div>
  )
}

function Sheet({ title, configs, size, selected, onSelect }: { title: string; configs: FunconConfig[]; size: number; selected: FunconConfig | null; onSelect: (c: FunconConfig) => void }) {
  return (
    <section>
      <h2>
        {title} <span>· {configs.length}</span>
      </h2>
      <div className="row">
        {configs.map((c) => (
          <button
            key={`${c.style}:${c.seed}`}
            type="button"
            className="icon"
            title={`${c.style} · ${c.seed}`}
            aria-pressed={selected?.seed === c.seed && selected.style === c.style}
            onClick={() => onSelect(c)}
          >
            <Funcon config={c} size={size} label={`${c.style} icon, seed ${c.seed}`} />
          </button>
        ))}
      </div>
    </section>
  )
}

function Detail({ selected }: { selected: FunconConfig }) {
  const composition = useMemo(() => generateIcon(selected), [selected])
  return (
    <section className="card">
      <div className="sizes">
        {[160, ...SIZES].map((size) => (
          <div key={size}>
            <Funcon config={selected} size={size} />
            <small>{size}px</small>
          </div>
        ))}
      </div>
      <dl>
        <dt>Seed</dt>
        <dd>{selected.seed}</dd>
        <dt>Family</dt>
        <dd>{selected.style}</dd>
        <dt>Template</dt>
        <dd>{composition.templateId}</dd>
        <dt>Palette</dt>
        <dd>{composition.paletteId}</dd>
        <dt>Elements</dt>
        <dd>{composition.elements.length}</dd>
      </dl>
      <pre>{JSON.stringify(composition, null, 2)}</pre>
    </section>
  )
}

function InContext({ seed, dark }: { seed: string; dark: boolean }) {
  const colors = dark ? { background: "#171717", color: "#fafafa", borderColor: "#333333" } : { background: "#ffffff", color: "#171717", borderColor: "#e5e5e5" }
  return (
    <div className="list" style={colors}>
      {SAMPLE_NAMES.map((name, i) => (
        <div key={name}>
          <Funcon config={config(ICON_STYLES[i % ICON_STYLES.length], `${seed}-${name}`)} size={24} />
          {name}
        </div>
      ))}
    </div>
  )
}

function App() {
  const [state, setState] = useState(readParams)
  const [selected, setSelected] = useState<FunconConfig | null>(null)
  const [dark, setDark] = useState(false)
  const { view, size, count, seed } = state

  useEffect(() => {
    history.replaceState(null, "", `?${new URLSearchParams({ view, size: String(size), count: String(count), seed })}`)
  }, [view, size, count, seed])
  useEffect(() => {
    document.documentElement.dataset.theme = dark ? "dark" : "light"
  }, [dark])

  const seeds = useMemo(() => Array.from({ length: count }, (_, i) => `${seed}-${i}`), [seed, count])
  const families = ICON_STYLES.filter((style) => view === "all" || view === style)
  const update = (patch: Partial<typeof state>) => setState((prev) => ({ ...prev, ...patch }))

  return (
    <main>
      <header>
        <div className="row between">
          <h1>Funcons</h1>
          <button type="button" className="outline" onClick={() => setDark(!dark)}>
            {dark ? "Light" : "Dark"}
          </button>
        </div>
        <p className="muted">Contact sheet for generator v{LATEST_ICON_VERSION}. Click an icon to inspect it.</p>
      </header>

      <div className="row controls">
        <Segmented options={VIEWS} value={view} onChange={(v) => update({ view: v })} />
        <Segmented options={SIZES} value={size} unit="px" onChange={(v) => update({ size: v })} />
        <Segmented options={COUNTS} value={count} onChange={(v) => update({ count: v })} />
        <div className="row">
          <input aria-label="Seed prefix" value={seed} onChange={(e) => update({ seed: e.target.value })} />
          <button type="button" className="outline" onClick={() => update({ seed: crypto.randomUUID().slice(0, 8) })}>
            Shuffle
          </button>
        </div>
      </div>

      {selected && <Detail selected={selected} />}

      <section>
        <h2>In a list, 24px</h2>
        <div className="row">
          <InContext seed={seed} dark={false} />
          <InContext seed={seed} dark />
        </div>
      </section>

      {families.map((style) => (
        <Sheet key={style} title={FAMILY_LABEL[style]} configs={seeds.map((s) => config(style, s))} size={size} selected={selected} onSelect={setSelected} />
      ))}
      {(view === "all" || view === "mixed") && (
        <Sheet title="Mixed" configs={seeds.map((s, i) => config(ICON_STYLES[i % ICON_STYLES.length], s))} size={size} selected={selected} onSelect={setSelected} />
      )}

      <section>
        <h2>Palettes</h2>
        <div className="row">
          {PALETTES.map((p) => (
            <span key={p.id}>
              <span className="swatch">
                {[p.background, p.primary, p.secondary].map((color) => (
                  <i key={color} style={{ background: color }} />
                ))}
              </span>
              {p.id}
            </span>
          ))}
        </div>
      </section>
    </main>
  )
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
