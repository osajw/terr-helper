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
      .slice(-nRow) // reduce to nRow withdrawals
  }
  const dd = {
    pageMargins: [10, 40, 10, 0],
    content: [],
    styles: {
      header: { fontSize: 14, bold: true, margin: [0, 0, 0, 10] },
      bold: { bold: true, fontSize: 10 }
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
    return max16Char(`${p.firstname} ${p.lastname.split(' ').map(s => s.slice(0, 2).toUpperCase()).join(' ')}${p.lastname.slice(-1) === '.' ? '' : '.'}`)
  }
  const createPage = (fiveTerr, i) => {
    const margin = [i%2 ? 0 : 30, 0, 0, 0]
    dd.content.push({ text: 'Relevé des attributions de territoire', style: 'header', margin }) // title
    dd.content.push({
      fit: [300, 40],
      margin: [i%2 ? 255 : 282, 0, 0, 0],
      image: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAb4AAAA9CAMAAADlAPwZAAADAFBMVEX///8rKysBAAIoJyh+fn6FhYUkJCSBgYH///n///3V1dX4///EcicJCAkeZbf8///v/v+goKC8vLz5xXPW/P4KN4bt7e0TNIDKei7/+cMnIWjd/P/7/Ptlt/hxJx////X0/////N6wsLDxn0wQTJ771YPP+v9tvveLPA7n/P/3vm32q1jTgTQrFh///vE5Ozm++P///eYZXrDbiz6l8v+F1vx5LhlesPf//Oo+i9n/+8oVQYxQpPVJmu3//NenvdcSIDEZEhf/+9IxftEwTWUdFTL95a4VVKb+76D83I0pGVo6EkvmlUSDTiUYFiCgUBeENwvc7vu52vPW4vFqbGxZWVi9bCdpOhy3+P+roZ8bMFUmFkEpOkBWFjU6Lx5DHhkxGQ88BwSe6P5Hh8T+68Hmw6UIIWI2FVjnpFUeLT0CAQ6c1PlPnub/97llYU0wMTNkHSGAMxYhBgSryObR1uXs4NLf09H64L7/77JiZmbDhkZLDjoECyRtJxCy8P+Q3vz/9OH05NWanZn95Jfkq2o6QkmxcDNTLxqpWhmu9//k8/6w5/3t9vx8zPn67t/T1N/Sz9VamdWBoMjFq6P7zXw8Oiu2ZSHV9v+o3fxXp+nJ0Nb96cilqcgrZrD/9augnqorVJrzxYgYNmdTYmXzsmBQUFBPGBkwBgHO6/yP0/djsOrl5eWHzdg4hNLk2sovdsbCwsKgqLy1nIIaJ2QQFFJgLFECCjiQSDAwLiWSQxP4+PjB6PeXxetJl91jmNDHzbzgxa3UuampqanhtYkxW4N/f39GMXLZm1GNaEZkUTAPERGGx/R0reLe992Ur9Tu1r4qbLvoz7Nmj69eepzzzJlBb5ljZ4nmunSAaF3w+toxfcu5pKh+gKgnWqX33J+wiIEZMHaslGqsfmbIklV4bUV7Oz4zGTMSBAG32tb017GTq6p2lqCViZAzP4vTrYkcNYJHaHGZgmedeVNdUDv0/u3q98rBsMTBqbTZ2YuTcWz9893T8sbI9MWJzLKCgoJujWs++2OSAAALjElEQVR42u2bCVwUVRzH/0zXjivMFhDgArtr3LmLC8gdcqMgh6SggoCgJmCSmCEkUoJEB5mmKJZ5i5VkeaV5VVqZZ3mmZWX3fd/3/83M7uwCYi72cdfe7/Nx573/7vs7733fvLl+ABUVFdXFk32G3aVQhd3TQNVzMauuvCRirgOqnsv+WrgUup7io/h6KHZ39YmFuE1+o/qAadx7jLNy2RgXHwBZb+YmsGb9n/HJXBkmggNZP4ZJ6IiPbahsl3eHb9mJ/gDxv5bDOeTm6QHnk8YvmuLrET5nJ4jPEvDpHgDgNwQfsHffLOCTvoGqL7LBoBvs16nh1tt8/yN8Mc/6Xjx8+vf2Gybd8OHVc/0vF3xlWzY3w7w2O8SXnP4xs3w76N6vLMuvdFaOTf+4bHk5j08oApDD1EHCNz2pmcenev7abA4eefSpkQMVh0dOkfOZX1+yy9PjkUf9oepRBQA7bsrzS7JB//CiN9dA1ciBZPwO488RH/4UCybNhYBm/erjU7i7Hn5mKIhZxg18YQoY9NyF4YvJusmw1+M/W58b5dPdGSX4Nbmt4GO+aTvt7rr5AyYhxq8s8YPK8TMc2zYPy2WcD2aSqrMP4tOIxY5Hn0ujiw/i07eMqi4sUTtqZ00qmjVrknYih4lfSVpxT5xHQJ/+cKOLEzmFxia+mrTfrTY2sbxBuwLHjyW/OHPQL1pVU1p9z2J/qbkQOPVe4Z7tybmJr264X8zSOyN/Jxj0Yl93C/GR1cYvQv/wNtC8uYafNGoAnCZryBx7/dpsdlz68kMKW8FXkvXuH7XONUyCd5uLj66prNWVSeC825x/GTN+4K6szQMQ32CxCIIkfL+HtiO+gNT7wTutzjF1Bjtk/AxZvxQ14EH5BEy7zRRfikKVk+JWO5G71fMJLt5vBzaEaZvW+kVr3lkI81LvlZqfEgLxk8NkvR0U4ZkRBnxeJmveS/bDnrQYHzskys3TFx4bPcBRmz+p6LQ6uTZxUt5+Mse+T2r+KnfUXH9bwRcRPP3vyoh+TEJAZYoaF8eIlrJoculyspJBTfdFfI5isRM+J8e8P2/zDfZSQ3xomCM/yD7sEC8FwOC0EDz3meJzkMNKFwwh6RBchIO8bwkRz31Vb8wq2Bhi0lwIID6NX2xgYJGDAR+mQPXiNYxhVj3tbiE+zGbAlxoCAakhOUEKWb8oGU4QnC24c7azeCYMHmO/uQ7xzWtzVqpayiYiUQ7x4dH3Sa9esx9AfN5isTM+Xc6oQsSngEhPDzN89WnFnfBhCUOELKniRsAXGVoyFFlKzX/kAwK+EiR1szk+O15xOKGumGkhPvww4OszAjdrs6IBD3iyk6qmBNvCp9/KePkjvsissuPftm0sDqjc+Hk6nvuyyvbMTF+qRHzxYhGAnRC3wxQfTKud7jsvrQ5ncLEZvsjQHfL61R7eacWqfs48Pi+lvsmB4IucvIMb69nq5tnKJZPFc9DoZnaC6dEnBmImR8tcoxaw47KFLBbj0/y0APFFm+BTtTiY4/NDuI59bBIfN8R+ogzxwbF7GGbzAU7f+DGTj0fi27m4YJYoEB+IRR5fhBk+dqXWV1dzdWDSAc4MH3uyqLRC6xGTGbtli4AvtqJg/EKCD5YV5msXK9mTuCk55Rcd3pixJT+vTmr+gxBQ5cTOGZseO39UuZDF0sUTz8OtXP1qX/bwGhFf+Pt5j8dPnsh5fzTAMa+YnbBhhKuXUpeTIuJj8extG/jMpXpqEVkg2am3q3m2UxfdhxupeE49+NB9XcT8+ZQ3c4DCkXnQuPqG34FBshkKKOH+0igpoMPvZVNvV0hZwKJLF9kr2oq4xf6arRHC3eq+jMTtHPtKXIVdEl66VMzPaOXGppcWLF8o4oMA7VInG8T3n0k8910EWXbjcNdDEn5pjsxWkBVzGz+JZDhlTacPR/GZih13iIOLKPPbdsuF5z4bfupyGahn+KqWKCm+C5F14bPtZ562KneW4rs8RPHZtJh9V1gs+wyLm1YwXwBVz8XMusZSXckM70Hba4Hqki6e7kxfunheoCg+W5PoT7DYVME2lNgGPre9w1e8ta27R0/wbxSzd44crEeiP0HysFwIvsEvj4Bjhzo/dbEafM9JwUGrj4zcm7ffxHRxAfiwo4bZelwJViTRnwBw95vPDBU8LCrifJE8MWCso29milw0LxBnzK7vko6s+fQQHxna3TPPmO+Go45iKfktJYR/NRdQj7xTLvghD7jvfuNENimO+3WnvEt8Y7+tnkuGTf/OQhX+eDsnpNKsrz6yQNZAkq8o74zPve+LJvjuHACy4CgnCH9hicF0UUWMPPy+jByY4wCGOss7d0Qrz1SMVZGOSkFhRKxCoj8B3xR98+qGT4iHRd84apL2CckTY6zreqNvpl0umBeIM+azvUlHtwV7geB6OfcbBxyxvn37NqWQSb/O/X1tXBBA5LMZcWHCAd8ckPf53tRi8v8dncJ1hS9y8p6Zua+pyVHgMyHv87MfNfOpfshZPjP3jP9hTH4W23fE9+Qw+5fM8UH9nXWR6YnYHd500fDRCjTyAMDbqxO/L3JgDXUZce4InULDxvCi05+SjkpBw4hYgUR/Art7LhcZGoZv0SGgzwx2QpRS8sQY6m6eYXDsqFIwLxBnDHjfci8b7CW6Xs7zvi8y1Bcg/sMBshe2uQYhtZ9+DOXxzfvSqamd02P7ehzgrhdPYt5Y+W5/9HG0q2oOcKqmdj4VvtIVG8lcEa45PvenVzHMMGGHjPgeG92c/JaTzDVIjq99yYlh0Og6bN0SpNC1OEh1NGaInXJMLcYhUmJHTYLCiFjFIir6E0Bz9vvAuGjExwZPDwwsGD/C6Ikx1lU1Sd/M9Y8RzAukryI+0fVynrftK792AnD8EjuNoyfwDANSidBvvYnE2CEuuEQqusCHk8hX54pmKLcP6wCFr3P5VPVpIWKWaQiyA76ZV+BexNnxMuLDD9nuSYFFKWrEN3hMfuD8OA/B1INkjHUsy8VO4VsP8qKa4JOChhGxAon+BLQ+ZJ/KEvBFLerV63a10RNjqKPuXp+bclAwL5jgE10v3ePTbMWjVZWDH+b4bt1ULMtJ8Y/fGiTrPf342cIdXeFjJ1Tu21gOELDUH1F9WHRGyacino7BhWFkIU3x/1f4VvYZMS9t7QP9BHxpa3G/7wPA+UOQiXUBn9gpCZ9J0DAiViDRn6DKTJAnr45GDws45j0OYwfKjZ4YY33Qpjrsf3/BvCDiC0F8ouul+8WT+C3QfBgCHfCtPKOA5NrSioJ1shYHNZ6Fu8KXPHrn1MalSl1LK1b0u9YX+vKp2AZtRb7Wlyzr+HH+xVN27J4I+Q0uPpqmFDUSjAyNUOt/JssBdkmT6SDVkZTYKSO+EJOgMCJWcf9g8CecLLIrLYwgHhZdTUbgFXPkRk+MsU4K2hK5YF7g8d1aO+pxvHQRXC/dmiXCM9s5PIgWq83xYTyMt2Yc3NoqcyV+xa+7wnejsxKHv3jQphkge2oo4C/FVA/OfvuWEMz7tQ/A+S5dxuzbV7pTAdNCY+3mOyuJ6WJZYWnB0gUAJFZR4ABCXcAndkrERzoqBfkRsarbP4C7Zj8geFgEe4zkiTGrS+YFsZEChIiie7MEGtIA9HhX2QFf/cv9AfVbDV6YoKVYlxPUFT78Bv/dO+Q1OfJep9ZnnhZTsZ+mr1NDjB9Zk7u/cZCEXRRNF4KxR4pJdalTUkeloDAil60637archyEy35zfOTqX04CGXvux8FrTCrYsLArfJrGpPlJczTPNgOg56604N37hVRuoaVHlECulc952051sZ55sg1zuE5/XFTe0aEk4TP7Bqd78gkn4Ui5XU5S0WeeXYs+sqai+GxfTNzVFqsHbSsovouiVcOuslR/zcK2FutJoKKioqKioqKioqKioqKioqKioqKioqKioqKioqKiorJy/QPa8yZM+gOoFgAAAABJRU5ErkJggg=='
    })
    dd.content.push({ // table header (terr names)
      font: 'FiraMono',
      table: {
        widths: Array(5).fill(101),
        body: [fiveTerr.map(t => ({ text: t.name ? split2Line(t.name) : '', margin: [4, 0, 0, 0] }))]
      },
      margin,
      layout: 'noBorders'
    })
    const inOutTable = {
      font: 'FiraMono',
      table: { widths: Array(10).fill(45), body: [] },
      margin,
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
      margin,
      layout: 'noBorders'
    })
  }

  const sortedTerrs = ([ ...terr ]).sort((a, b) => a.name.localeCompare(b.name))
  for (let i = 0; i < sortedTerrs.length; i += 5) {
    if (i !== 0) { dd.content.push({ text: '', pageBreak: 'before' }) } // force create new page
    const fiveTerr = sortedTerrs.slice(i, i + 5)
      .concat(Array(5).fill({})).slice(0, 5)
    createPage(fiveTerr, i)
  }
  pdfMake.createPdf(dd).download(`S-13_${todayDate}.pdf`)
}
