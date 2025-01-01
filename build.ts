import fs from 'node:fs/promises'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
const path = './output.json'
const base = './dist'
;(async () => {
  console.log('Building...')
  const { stdout, stderr } = await promisify(exec)(
    'pnpm exec bookmarklets-cli src/*.ts',
  )
  console.log('stdout:', stdout)
  console.log('stderr:', stderr)
  console.log('Built!')
  const files = await fs.readdir(base)
  const output = JSON.stringify(files)
  await fs.writeFile(path, output)
})()
