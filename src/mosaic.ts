;`+
## Mosaic ascii art generate
画面右下に生成されるドロップエリアに画像をドロップすると、その画像をモザイクアートに変換して表示します。
+`

const sheet = new CSSStyleSheet()
sheet.replaceSync(`
.dialog {
  position: fixed;
  max-width: 200px;
  width: 100%;
  height: 240px;
  background-color: #fff;
  border: 1px solid #ccc;
  z-index: 1000;
  bottom: 0;
  right: 0;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
}
.preview-dialog {
  z-index: 1100;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  max-width: 1200px;
  max-height: 1000px;
  width: 100vw;
  height: 100vh;
  background-color: #fff;
  border: 1px solid #ccc;
  border-radius: 4px;
  display: none;
  flex-direction: column;
}  
.preview-dialog[data-fullsize='true'] {
  max-width: none;
  max-height: none;
}
.preview-dialog[data-open='true'] {
  display: flex;
}
.selects {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 16px;
}
.scale {
  flex: 1;
}
.control {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 20px;
  padding: 0 8px
  gap: 16px;
}
.output {
  overflow: auto;
  background-color: #011627;
  color: #d6deeb;
}
.display-area {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  height: 20px;
  padding: 0 8px
}
.paragraph {
  margin: 0;
  padding: 0;
  font-size: 14px;
}
.control-button {
  background-color: inherit;
  border: none;
  cursor: pointer;
  padding: 0;
}
.menu {
  background-color: inherit;
  border: none;
  cursor: pointer;
  padding: 0;
}
.droparea {
  flex: 1;
  display: flex;
  padding: 8px;
  justify-content: center;
  align-items: center;
}
.droparea-inner {
  border: 2px dashed #ccc;
  pointer-events: none;
  flex: 1;
  text-align: center;
  min-height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}
`)

const brights = [
  '$$',
  '@@',
  'BB',
  '%%',
  '88',
  '&&',
  'WW',
  'MM',
  '##',
  '**',
  'oo',
  'aa',
  'hh',
  'kk',
  'bb',
  'dd',
  'pp',
  'qq',
  'ww',
  'mm',
  'ZZ',
  'OO',
  '00',
  'QQ',
  'LL',
  'CC',
  'JJ',
  'UU',
  'YY',
  'XX',
  'zz',
  'cc',
  'vv',
  'uu',
  'nn',
  'xx',
  'rr',
  'jj',
  'ff',
  'tt',
  '//',
  '\\\\',
  '||',
  '((',
  '))',
  '11',
  '{{',
  '}}',
  '[[',
  ']]',
  '??',
  '--',
  '__',
  '++',
  '~~',
  '<<',
  '>>',
  'ii',
  '!!',
  'll',
  'II',
  ';;',
  '::',
  ',,',
  '""',
  '^^',
  '``',
  "''",
  '..',
  '  ',
]

const imageManager = (() => {
  const images = new Map<string, ImageData>()
  let onSet = () => {}
  return {
    set: (name: string, data: ImageData) => {
      images.set(name, data)
      onSet()
    },
    generate: (name: string, scale: number) => {
      const imageData = images.get(name)
      if (!imageData) return
      return mosiac(imageData, scale)
    },
    names: () => images.keys(),
    onSet: (callback: VoidFunction) => {
      onSet = callback
    },
  }
})()

const throttle = <T extends unknown[]>(
  callback: (...args: T) => void,
  delay: number,
) => {
  let timer: number | null = null
  return (...args: T) => {
    if (timer) return
    timer = setTimeout(() => {
      callback(...args)
      timer = null
    }, delay) as unknown as number
  }
}

const mosiac = (imageData: ImageData, scale: number) => {
  const { data, width, height } = imageData
  const ascii = document.createElement('pre')
  ascii.style.fontFamily = 'monospace'
  ascii.style.fontSize = '10px'
  ascii.style.lineHeight = '10px'
  for (let y = 0; y < height; y += scale) {
    let line = ''
    for (let x = 0; x < width; x += scale) {
      let total = 0
      let count = 0
      for (let i = 0; i < scale; i++) {
        for (let j = 0; j < scale; j++) {
          // 境界チェックを追加
          if (y + i >= height || x + j >= width) continue
          const idx = (y + i) * width + (x + j)
          const pixelValue = data[idx * 4]
          // undefinedチェック
          if (pixelValue !== undefined) {
            total += pixelValue
            count++
          }
        }
      }
      // ゼロ除算を防ぐ
      const avg = count > 0 ? total / count : 0
      const index = Math.floor((avg * brights.length) / 256)
      // 配列の範囲外アクセスを防ぐ
      const safeIndex = Math.max(0, Math.min(index, brights.length - 1))
      line += brights[safeIndex]
    }
    const span = document.createElement('span')
    span.textContent = line
    ascii.appendChild(span)
    ascii.appendChild(document.createElement('br'))
  }

  return ascii
}

const updateOption = (select: HTMLSelectElement) => {
  const names = Array.from(imageManager.names())
  while (select.firstChild) {
    select.removeChild(select.firstChild)
  }
  for (const name of names) {
    const option = document.createElement('option')
    option.value = name
    option.textContent = name
    select.appendChild(option)
  }
}

const createDom = () => {
  const root = document.createElement('div')
  const shadow = root.attachShadow({ mode: 'open' })
  shadow.adoptedStyleSheets = [sheet]

  const dialog = document.createElement('div')
  dialog.classList.add('dialog')
  const displayArea = document.createElement('div')
  displayArea.classList.add('display-area')
  const paragraph = document.createElement('p')
  paragraph.classList.add('paragraph')
  paragraph.textContent = 'images: 0'
  const menu = document.createElement('button')
  menu.classList.add('menu')
  menu.textContent = '|M|'
  displayArea.appendChild(paragraph)
  displayArea.appendChild(menu)
  dialog.appendChild(displayArea)

  const droparea = document.createElement('div')
  droparea.classList.add('droparea')
  const dropareaInner = document.createElement('div')
  dropareaInner.classList.add('droparea-inner')
  dropareaInner.textContent = 'Drop image files here'
  droparea.appendChild(dropareaInner)

  const previewDialog = document.createElement('div')
  previewDialog.classList.add('preview-dialog')
  previewDialog.dataset.open = 'false'
  const selectImage = document.createElement('select')
  const scale = document.createElement('input')
  const control = document.createElement('div')
  const selects = document.createElement('div')
  const close = document.createElement('button')
  close.textContent = 'X'
  close.classList.add('control-button')
  const fullsize = document.createElement('button')
  fullsize.textContent = '[ ]'
  fullsize.classList.add('control-button')
  const output = document.createElement('div')
  scale.type = 'range'
  scale.value = '10'
  scale.step = '1'
  scale.min = '1'
  scale.classList.add('scale')
  control.classList.add('control')
  output.classList.add('output')
  scale.classList.add('scale')
  selects.classList.add('selects')
  updateOption(selectImage)
  imageManager.onSet(() => {
    updateOption(selectImage)
    paragraph.textContent = `images: ${Array.from(imageManager.names()).length}`
  })
  selects.appendChild(selectImage)
  selects.appendChild(scale)
  control.appendChild(selects)
  control.appendChild(fullsize)
  control.appendChild(close)
  previewDialog.appendChild(control)
  previewDialog.appendChild(output)

  const render = throttle((name: string, scale: number) => {
    const ascii = imageManager.generate(name, scale)
    if (!ascii) return
    while (output.firstChild) {
      output.removeChild(output.firstChild)
    }
    output.appendChild(ascii)
  }, 1000)
  selectImage.onchange = () => {
    render(selectImage.value, Number.parseInt(scale.value))
  }
  scale.oninput = () => {
    render(selectImage.value, Number.parseInt(scale.value))
  }
  menu.onclick = () => {
    previewDialog.dataset.open =
      previewDialog.dataset.open === 'true' ? 'false' : 'true'
    render(selectImage.value, Number.parseInt(scale.value))
  }
  close.onclick = () => {
    previewDialog.dataset.open = 'false'
  }
  fullsize.onclick = () => {
    previewDialog.dataset.fullsize =
      previewDialog.dataset.fullsize === 'true' ? 'false' : 'true'
  }
  droparea.ondragenter = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }
  droparea.ondragover = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'copy'
    }
  }
  droparea.ondrop = async (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (!e.dataTransfer) return

    const files = Array.from(e.dataTransfer.files)
    console.log('Dropped files:', files)
    
    for (const file of files) {
      if (!file.type.startsWith('image/')) {
        console.log('Skipping non-image file:', file.name)
        continue
      }
      
      console.log('Processing image:', file.name)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')

      if (!ctx) {
        console.error('Failed to get canvas context')
        continue
      }
      
      const image = new Image()
      const imageUrl = URL.createObjectURL(file)
      
      image.onload = () => {
        console.log('Image loaded:', file.name, `${image.width}x${image.height}`)
        canvas.width = image.width
        canvas.height = image.height
        ctx.drawImage(image, 0, 0)
        imageManager.set(
          file.name,
          ctx.getImageData(0, 0, image.width, image.height),
        )
        URL.revokeObjectURL(imageUrl)
      }
      
      image.onerror = (err) => {
        console.error('Failed to load image:', file.name, err)
        URL.revokeObjectURL(imageUrl)
      }
      
      image.src = imageUrl
    }
  }
  dialog.appendChild(droparea)
  shadow.appendChild(dialog)
  shadow.appendChild(previewDialog)
  document.body.appendChild(root)
}

createDom()
