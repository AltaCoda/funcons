import { render } from "@testing-library/react"
import { act } from "react"
import { hydrateRoot, type Root } from "react-dom/client"
import { renderToString } from "react-dom/server"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { generateIcon } from "../generate.js"
import { renderIcon } from "../render/SvgRenderer.js"
import { renderSvgString } from "../render/svgString.js"
import { Funcon } from "../render/Funcon.js"
import { ICON_STYLES } from "../types.js"

const config = { version: 1, style: "abstract", seed: "render-test" } as const

describe("Funcon", () => {
  it.each([24, 32, 80])("renders a square svg at %ipx", (size) => {
    const { container } = render(<Funcon config={config} size={size} />)
    const svg = container.querySelector("svg")!
    expect(svg.getAttribute("width")).toBe(String(size))
    expect(svg.getAttribute("height")).toBe(String(size))
    expect(svg.getAttribute("viewBox")).toBe("0 0 80 80")
  })

  it("is hidden from assistive technology by default", () => {
    const { container } = render(<Funcon config={config} />)
    expect(container.querySelector("svg")!.getAttribute("aria-hidden")).toBe("true")
  })

  it("carries a label when it stands alone", () => {
    const { getByRole } = render(<Funcon config={config} label="Acme" />)
    expect(getByRole("img", { name: "Acme" })).toBeTruthy()
  })

  it("does not change on re-render", () => {
    const { container, rerender } = render(<Funcon config={config} />)
    const before = container.innerHTML
    rerender(<Funcon config={{ ...config }} />)
    expect(container.innerHTML).toBe(before)
  })

  it("hydrates server markup without a mismatch", () => {
    const errors: unknown[] = []
    for (const style of ICON_STYLES) {
      for (let i = 0; i < 50; i++) {
        const element = <Funcon config={{ version: 1, style, seed: `ssr-${i}` }} />
        const host = document.createElement("div")
        host.innerHTML = renderToString(element)
        let root!: Root
        act(() => {
          root = hydrateRoot(host, element, { onRecoverableError: (e) => errors.push(e) })
        })
        act(() => root.unmount())
      }
    }
    expect(errors).toEqual([])
  })

  it("draws a placeholder rather than crashing on a config from a newer generator", () => {
    const { container } = render(<Funcon config={{ version: 999, style: "color", seed: "x" }} size={24} />)
    const svg = container.querySelector("svg")!
    expect(svg.getAttribute("width")).toBe("24")
    expect(svg.querySelector("g")!.childElementCount).toBe(0)
  })

  it("works for any seed string", () => {
    for (const seed of ["", " ", "🎨", "\ud800", "x".repeat(10000)]) {
      expect(() => render(<Funcon config={{ version: 1, style: "color", seed }} />)).not.toThrow()
    }
  })
})

describe("renderSvgString", () => {
  it("matches the React renderer exactly", () => {
    for (const style of ICON_STYLES) {
      for (let i = 0; i < 500; i++) {
        const composition = generateIcon({ version: 1, style, seed: `string-${i}` })
        expect(renderSvgString(composition)).toBe(renderToStaticMarkup(renderIcon(composition)))
        expect(renderSvgString(composition, { size: 32 })).toBe(
          renderToStaticMarkup(renderIcon(composition, { width: 32, height: 32 })),
        )
      }
    }
  })
})
