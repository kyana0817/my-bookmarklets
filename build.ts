import fs from 'node:fs/promises'
import { createReadStream } from 'node:fs'
import process from 'node:process'
import readline from 'node:readline'
import { exec } from 'node:child_process'
import { promisify } from 'node:util'
const path = './output.json'
const base = './dist'
const source = './src'

const changeExtensio = (file: string) => {
  return file.replace('.js', '.ts')
}
;(async () => {
  console.log('Building...')
  const { stdout, stderr } = await promisify(exec)(
    'pnpm exec bookmarklets-cli src/*.ts',
  )
  console.log('stdout:', stdout)
  console.log('stderr:', stderr)
  console.log('Built!')
  const files = await fs.readdir(base)
  const sources = []
  for (const file of files) {
    const srcPath = `${source}/${changeExtensio(file)}`
    const reader = readline.createInterface({
      input: createReadStream(srcPath),
      output: process.stdout,
      terminal: false,
    })

    const buf = await new Promise<string[]>((resolve) => {
      const buf: string[] = []
      let flag = false
      reader.on('line', (line) => {
        if (line.includes(';`+')) {
          flag = true
          return
        }
        if (flag) {
          if (line.includes('+`')) {
            resolve(buf)
            reader.close()
            reader.removeAllListeners()
            return
          }
          buf.push(line)
        }
      })
      reader.on('close', () => resolve([]))
    })

    sources.push({
      name: file,
      description: buf.join('\n'),
    })
  }
  const output = JSON.stringify(sources)
  await fs.writeFile(path, output)
})()
