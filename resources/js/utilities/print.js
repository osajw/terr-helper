import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from './vfs_fonts'
pdfMake.vfs = pdfFonts.pdfMake.vfs
pdfMake.fonts = {
  Roboto: {
    normal: 'Roboto-Regular.ttf',
    bold: 'Roboto-Bold.ttf'
  },
  FiraMono: {
    normal: 'FiraMono-Regular.ttf'
  }
}
const dateHelper = require('../components/mixins/dateHelper').dateHelper.methods

const loadImage = (url) => new Promise((resolve, reject) => {
  const img = new Image()
  img.onload = function () { resolve(this) }
  img.onerror = reject
  img.src = url
})

const getDataUrl = (url) => new Promise((resolve, reject) => {
  if (url.slice(0, 5) === 'data:') { return resolve(url) } // already a data url
  // const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
  const xhr = new XMLHttpRequest()
  xhr.onload = () => {
    var reader = new FileReader()
    reader.onloadend = () => resolve(reader.result)
    reader.readAsDataURL(xhr.response)
  }
  xhr.open('GET', url)
  xhr.responseType = 'blob'
  xhr.send()
})

const getGreeting = () => {
  const today = new Date()
  const curHr = today.getHours()
  const curMn = today.getMinutes()
  if (curHr >= 18 || (curHr === 17 && curMn > 30)) { // after 17h30
    return ['Bonsoir', 'Bonne soirée !']
  }
  if (curHr >= 13) { // after 13h
    return ['Bonjour', 'Bon après-midi !']
  }
  return ['Bonjour', 'Bonne journée !']
}

export async function printTerr (terr, shareTo) {
  const imageUrl = terr.imageUrl
  let landscape = false
  let img, img64
  if (imageUrl) {
    img64 = await getDataUrl(imageUrl)
    img = await loadImage(img64)
    if (img.height > img.width) {
      landscape = true
    }
  }
  const havePlan = terr.npvs.find(n => n.planUrl)
  const npvs = []
  for (let i = 0; i < terr.npvs.length; i++) {
    const npv = terr.npvs[i]
    const img = npv.planUrl ? {
      image: await getDataUrl(npv.planUrl), fit: [250, 250]
    } : ''
    npvs.push([dateHelper.$formatDate(npv.date), npv.address, ...(havePlan ? [img] : [])])
  }
  const margin = 40
  let size = [595.28, 841.89].map(s => s - margin * 2) // size from: https://github.com/bpampuch/pdfmake/blob/master/src/standardPageSizes.js
  if (landscape) { size = size.reverse().map(s => s - 20) }
  const docDefinition = {
    pageOrientation: landscape ? 'landscape' : 'portrait',
    defaultStyle: { font: 'Roboto' },
    styles: {
      header: { fontSize: 18, bold: true },
      tableHeader: { bold: true, fontSize: 13, color: 'black' }
    }
  }
  const npvsTable = npvs.length ? [
    { text: 'Ne pas visiter: ', bold: true },
    {
      table: {
        headerRows: 1,
        body: [
          [
            { text: 'Date', style: 'tableHeader' },
            { text: 'Adresse', style: 'tableHeader' },
            ...(havePlan ? [{ text: 'Plan', style: 'tableHeader' }] : [])
          ],
          ...npvs
        ]
      }
    }
  ] : ' '
  if (img64) {
    if (landscape) {
      docDefinition.content = [{
        layout: 'noBorders',
        table: {
          body: [
            [
              { image: img64, fit: landscape ? size : size },
              {
                stack: [
                  { text: terr.name, style: 'header' },
                  terr.desc,
                  ' ',
                  npvsTable
                ]
              }
            ]
          ]
        }
      }]
    } else {
      docDefinition.content = [
        { text: terr.name, style: 'header' }, terr.desc, ' ', { image: img64, fit: landscape ? size : size }, ' ', npvsTable
      ]
    }
  } else {
    docDefinition.content = [{ text: terr.name, style: 'header' }, terr.desc, ' ', npvsTable]
  }
  if (shareTo) {
    const blob = await new Promise((resolve, reject) => pdfMake.createPdf(docDefinition).getBlob(resolve))
    const file = new File([blob], `${terr.name.split(' ').join('-')}.pdf`, { type: 'application/pdf' })
    const filesArray = [file]
    const greeting = getGreeting()
    const text = `${greeting[0]} ${shareTo.firstname},\nvoici en pièce jointe un territoire\n${greeting[1]}`
    if (navigator.canShare && navigator.canShare({ files: filesArray })) {
      navigator.share({
        text,
        files: filesArray,
        title: terr.name
      })
    }
    return
  }
  pdfMake.createPdf(docDefinition).download(`${terr.name.split(' ').join('-')}.pdf`)
}

export async function printS13 ({ territories: terr, peoples, withdrawals }) {
  const todayDate = dateHelper.$formatDate(new Date())
  const wdByTerr = withdrawals.reduce((obj, wd) => {
    if (!obj[wd.territoryId]) { obj[wd.territoryId] = [] }
    obj[wd.territoryId].push(wd)
    return obj
  }, {})
  const nRow = 20
  for (const terrId in wdByTerr) {
    wdByTerr[terrId] = wdByTerr[terrId]
      .sort((a, b) => { // sort by date
        return new Date(a.inAt || a.outAt).getTime() - new Date(b.inAt || b.outAt).getTime()
      })
      .slice(-nRow) // reduce to nRow withdrawals
  }
  const arrowR = { image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAAfElEQVQ4y2NgGPSAiYlJhJOTk4kSM8IYGBh2MjExSVBiwH8GBoaXjIyMHpQYAMO9LCwsbDBJRqgCfMCSgYGhAE3sHCMjY+T///9vMUJNJQd8YWRkzKYodKniBYoDkRQDsEYjMxEGaDMwMPAzMTG5/////wLJgUSNpExbAABs8CFPy3iAAgAAAABJRU5ErkJggg==', fit: [8, 8], margin: [0, 4] }
  const arrowL = { image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsQAAA7EAZUrDhsAAAB8SURBVDhPYxi8gJOTkwkIRKBc0gBQowSQ2gnEYWABUgAjI6MHkHoJxP+BmHgDWFhY2IBULxCDNMIwQQMYwQQjo9r///+XA5lGID4SmADExyFMHACoOQ5IfQZiZJuJxkxAgiJAuRdggNxAxABkRyMyoCghwQBFSZmOgIEBAKKTKbWBGcxNAAAAAElFTkSuQmCC', fit: [8, 8], margin: [0, 4] }
  const dd = {
    pageMargins: [40, 40, 10, 0],
    content: [],
    styles: {
      header: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] },
      bold: { bold: true, fontSize: 12 }
    },
    defaultStyle: {
      fontSize: 9
    }
  }
  const max16Char = str => str.length > 16 ? `${str.slice(0, 16)}…` : str
  const split2Line = (str) => {
    let rows = str.match(/.{1,17}/g)
    if (rows.length === 1) {
      rows = ['', rows[0]]
    } else { rows.splice(2) }
    return rows.map((s, i) => i ? max16Char(s) : s).join('\n')
  }
  const peopleName = (id) => {
    const p = peoples.find(p => p.id === id)
    if (!p) { return 'Personne inconnu' }
    return max16Char(`${p.firstname} ${p.lastname.split(' ').map(s => s.slice(0, 2).toUpperCase()).join(' ')}.`)
  }
  const createPage = (fiveTerr) => {
    dd.content.push({ text: 'Relevé des attributions de territoire', style: 'header' }) // title
    dd.content.push({ // example table
      relativePosition: { x: 180, y: -30 },
      margin: [0, 20],
      table: {
        widths: ['auto', 'auto', 'auto', 40, 40, 'auto', 'auto'],
        body: [
          [{ text: 'Modèle :', style: 'bold' }, { text: 'Nom du proclamateur' }, arrowR, { text: 'J. Dupont', colSpan: 2, alignment: 'center', border: [1, 1, 1, 1] }, {}, {}, {}],
          [{}, { text: 'Date de sortie', alignment: 'right' }, { ...arrowR }, { text: '7/11/96', alignment: 'center', border: [1, 1, 1, 1] }, { text: '8/3/97', alignment: 'center', border: [1, 1, 1, 1] }, arrowL, { text: 'Date de rentrée' }]
        ]
      },
      layout: {
        defaultBorder: false
      }
    })
    dd.content.push({ // table header (terr names)
      font: 'FiraMono',
      table: {
        widths: Array(5).fill(101),
        body: [fiveTerr.map(t => ({ text: t.name ? split2Line(t.name) : '', margin: [4, 0, 0, 0] }))]
      },
      layout: 'noBorders'
    })
    const inOutTable = {
      font: 'FiraMono',
      table: { widths: Array(10).fill(45), body: [] },
      layout: { hLineWidth: i => i % 2 ? 1 : 2, vLineWidth: i => i % 2 ? 1 : 2 }
    }
    const body = inOutTable.table.body
    const getCurrWd = (i, r) => { // get withdrawal given a column and a row
      const currT = fiveTerr[i]
      if (!currT.id) { return null }
      const tWd = wdByTerr[currT.id]
      if (!tWd) { return null }
      return tWd[r]
    }
    for (let r = 0; r < nRow; r++) {
      const peopleLine = []
      for (let i = 0; i < 5; i++) {
        const currWd = getCurrWd(i, r)
        if (!currWd) { peopleLine.push(' '); peopleLine.push(' '); continue }
        const text = peopleName(currWd.peopleId)
        peopleLine.push({ text, colSpan: 2, alignment: 'center' })
        peopleLine.push({ }) // for the colSpan
      }
      const dateLine = []
      for (let i = 0; i < 5; i++) {
        const currWd = getCurrWd(i, r)
        if (!currWd) { dateLine.push(' '); dateLine.push(' '); continue }
        const d1 = currWd.outAt ? dateHelper.$formatDate(currWd.outAt) : '-'
        const d2 = currWd.inAt ? dateHelper.$formatDate(currWd.inAt) : ''
        dateLine.push({ text: d1, alignment: 'center' })
        dateLine.push({ text: d2, alignment: 'center' })
      }
      body.push(peopleLine)
      body.push(dateLine)
    }
    dd.content.push(inOutTable)
    dd.content.push({ // last line
      table: {
        widths: ['*', '*'],
        body: [[{ text: 'S-13-F     7/98' }, { text: `Imprimé le ${todayDate}`, alignment: 'right' }]]
      },
      layout: 'noBorders'
    })
  }

  for (let i = 0; i < terr.length; i += 5) {
    if (i !== 0) { dd.content.push({ text: '', pageBreak: 'before' }) } // force create new page
    const fiveTerr = terr.slice(i, i + 5)
      .concat(Array(5).fill({})).slice(0, 5)
    createPage(fiveTerr)
  }
  pdfMake.createPdf(dd).download(`S-13_${todayDate}.pdf`)
}
