const doc = `<!DOCTYPE html><html lang="ja">${document.documentElement.innerHTML}</html>`

const form: HTMLFormElement = document.createElement('form')
form.method = 'post'
form.action = 'https://validator.w3.org/nu/'
form.target = '_blank'
form.enctype = 'multipart/form-data'

const showsource = document.createElement('input')
showsource.type = 'hidden'
showsource.name = 'showsource'
showsource.value = 'yes'
form.appendChild(showsource)
const content = document.createElement('input')
content.type = 'hidden'
content.name = 'content'
content.value = doc
form.appendChild(content)

document.body.appendChild(form)

form.submit()

document.body.removeChild(content)
document.body.removeChild(showsource)
document.body.removeChild(form)
