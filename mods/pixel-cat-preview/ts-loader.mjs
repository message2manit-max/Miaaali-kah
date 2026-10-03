// Resolves extensionless relative imports to .ts/.tsx so Node's type stripping can run the mod's lib.
import { register } from 'node:module'
register('data:text/javascript,' + encodeURIComponent(`
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
export async function resolve(spec, ctx, next) {
  if ((spec.startsWith('./') || spec.startsWith('../')) && !/\\.[cm]?[jt]sx?$/.test(spec)) {
    for (const ext of ['.ts', '.tsx']) {
      const url = new URL(spec + ext, ctx.parentURL)
      if (fs.existsSync(fileURLToPath(url))) return next(url.href, ctx)
    }
  }
  return next(spec, ctx)
}`), import.meta.url)
