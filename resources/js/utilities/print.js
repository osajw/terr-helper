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
const urlHelper = require('../components/mixins/urlHelper').urlHelper.methods

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
  const imageUrl = urlHelper.$terrUrl(terr.name)
  let landscape = false
  let img, img64
  try {
    img64 = await getDataUrl(imageUrl)
    img = await loadImage(img64)
    if (img.height > img.width) {
      landscape = true
    }
  } catch (error) {
    console.log('print error:', error)
  }
  const planWidth = 150
  const havePlan = terr.npvs.find(n => n.planUrl)
  const npvs = []
  for (let i = 0; i < terr.npvs.length; i++) {
    const npv = terr.npvs[i]
    const img = npv.planUrl ? {
      image: await getDataUrl(urlHelper.$npvUrl(npv.planUrl)), width: planWidth
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
        widths: havePlan ? [54, '*', planWidth] : [60, '*'],
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
    if (wd.deleted_at) { return obj }
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
  }
  const dd = {
    pageMargins: [25, 40, 25, 0],
    content: [],
    styles: {
      header: { fontSize: 16, bold: true, margin: [0, 0, 0, 0] },
      table: {
        fontSize: 9,
        margin: [0, 5, 0, 15],
        font: 'FiraMono'
      }
    },
    defaultStyle: {
      alignment: 'center'
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
    return max16Char(`${p.firstname} ${p.lastname.split(' ').map(s => s.slice(0, 2).toUpperCase()).join(' ')}${p.lastname.slice(-1) === '.' ? '' : '.'}`)
  }
  const createPage = (terrs) => {
    dd.content.push({ text: 'REGISTRE D’ATTRIBUTION DES TERRITOIRES', style: 'header' }) // title
    dd.content.push({
      margin: [-5, 0, 0, -4],
      table: {
        body: [
          [{ text: 'Année de service : ', border: Array(4), bold: 1, fontSize: 14},
           { text: '', border: [0, 0, 0, 1] },
           { text: new Date().getFullYear(), border: [0, 0, 0, 1] },
           { text: '', border: [0, 0, 0, 1] }]
        ]
      },
      layout: { hLineWidth: () => 2 }
    })
    const inOutTable = {
      style: 'table',
      table: { widths: [30, 60, 43, 48, 43, 48, 43, 48, 43, 48], body: [] },
      margin: [0, 10, 0, 6],
      layout: { hLineWidth: i => i % 2 ? 1 : 2, vLineWidth: i => i % 2 ? 1 : 2 }
    }
    const body = inOutTable.table.body
    // header:
    body.push([
      { text: '\nTerr. n°', rowSpan: 2, fillColor: '#d9d9d9', font: 'Roboto' },
      { text: 'Parcouru pour la dernière fois le *', rowSpan: 2, fillColor: '#d9d9d9', font: 'Roboto' },
      ...Array(4).fill(0).reduce(a => [...a, { text: 'Attribué à', colSpan: 2, fillColor: '#d9d9d9', font: 'Roboto' }, ''], [])
    ])
    body.push([ '', '', ...Array(4).fill(0).reduce(a => [...a,
      { text: 'Attribué le', fillColor: '#d9d9d9', font: 'Roboto' },
      { text: 'Entièrement parcouru le', fillColor: '#d9d9d9', font: 'Roboto' },
    ], [])])
    // end header
    const getShortName = (name = '') => name.length > 5 ? name.slice(0, 5) + '…' : name
    for (let r = 0; r < nRow; r++) {
      const currT = terrs[r]
      let wds = (currT ? wdByTerr[currT.id] || [] : []).slice(-5)
      let inAt = ''
      if (wds.length > 4) {
        inAt = dateHelper.$formatDate(wds[0].inAt)
        wds = wds.slice(1) 
      }
      body.push([
        { text: getShortName(currT.name), rowSpan: 2, noWrap: true, margin: [0, 8, 0, 0] },
        { text: inAt, rowSpan: 2, margin: [0, 8, 0, 0] },
        ...Array(4).fill(0).reduce((a, _, i) => [...a,
    		  { text: wds[i] ? peopleName(wds[i].peopleId) : ' ', colSpan: 2 }, ''
    		], [])
      ])
      body.push(['', '', ...Array(4).fill(0).reduce((a, _, i) => [...a,
        { text: wds[i] ? dateHelper.$formatDate(wds[i].outAt) : ' ', fontSize: 8 },
        { text: wds[i] ? dateHelper.$formatDate(wds[i].inAt) : ' ', fontSize: 8 },
      ], [])])
    }
    dd.content.push(inOutTable)
    // last lines:
    dd.content.push({
      text: '* Lorsque vous commencez une nouvelle feuille, notez dans cette colonne la date à laquelle chaque territoire a été entièrement parcouru pour la dernière fois.',
		  alignment: 'left',
		  fontSize: 10,
		  margin: [0, 0, 0, 0]
    })
    dd.content.push({
      text: 'S-13-F 1/22',
		  alignment: 'left',
		  fontSize: 10,
		  margin: [0, 10, 0, 0]
    })
  }

  const sortedTerrs = ([ ...terr ]).sort((a, b) => a.name.localeCompare(b.name))
  for (let i = 0; i < sortedTerrs.length; i += nRow) {
    if (i !== 0) { dd.content.push({ text: '', pageBreak: 'before' }) } // force create new page
    const terrs = sortedTerrs.slice(i, i + nRow)
      .concat(Array(nRow).fill({})).slice(0, nRow)
    createPage(terrs, i)
  }
  pdfMake.createPdf(dd).download(`S-13_${todayDate}.pdf`)
}
