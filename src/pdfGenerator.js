// pdfGenerator.js — generates a 5-page branded PDF for the Year in Review
// Style follows the Apollo Burn Sheet from the BFSI Master Platform:
// crisp typography, KPI tile strip, native vector charts, table layouts.

import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ============================================================================
// THEME TOKENS
// ============================================================================
const COLORS = {
  text: [33, 33, 33],
  heading: [15, 15, 15],
  muted: [102, 102, 102],
  faint: [136, 136, 136],
  hairline: [237, 237, 237],
  bgFaint: [248, 248, 248],
  bgBlueFaint: [248, 248, 254],
  borderBlueFaint: [220, 230, 250],
  blue: [47, 106, 227],
  blueDark: [28, 72, 191],
  blueLight: [168, 204, 248],
  teal: [65, 191, 173],
  violet: [138, 98, 214],
  orange: [237, 129, 56],
  green: [45, 122, 58],
  amber: [146, 64, 14],
}

const FONT = 'helvetica'
const PAGE_W = 595.28  // A4 portrait width in pt
const PAGE_H = 841.89  // A4 portrait height in pt
const MARGIN_X = 40
const CONTENT_W = PAGE_W - MARGIN_X * 2

// ============================================================================
// SHARED DRAWING HELPERS
// ============================================================================

function setColor(doc, c, kind = 'text') {
  if (kind === 'text') doc.setTextColor(c[0], c[1], c[2])
  else if (kind === 'fill') doc.setFillColor(c[0], c[1], c[2])
  else if (kind === 'draw') doc.setDrawColor(c[0], c[1], c[2])
}

function drawTuringLogo(doc, x, y, size = 24) {
  // Black rounded square containing a stylized white "T" mark.
  // Approximation of the Turing logo asset using primitives.
  setColor(doc, [15, 15, 15], 'fill')
  doc.roundedRect(x, y, size, size, size * 0.18, size * 0.18, 'F')

  // The white curved swoosh + descending stem (stylized T)
  setColor(doc, [255, 255, 255], 'fill')
  // Top horizontal swoosh — tapered ellipse-like band
  const cx = x + size / 2
  const cyTop = y + size * 0.42
  // Use a thin horizontal ellipse for the top crossbar
  doc.ellipse(cx, cyTop, size * 0.32, size * 0.05, 'F')
  // Descending stem (slight curve approximated as a thin rectangle)
  doc.roundedRect(cx - size * 0.04, y + size * 0.42, size * 0.08, size * 0.32, size * 0.02, size * 0.02, 'F')
}

function drawHeader(doc, pageNum) {
  // Top header band with logo + brand on left, page number / breadcrumb on right
  drawTuringLogo(doc, MARGIN_X, 30, 22)
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.text('TURING', MARGIN_X + 32, 38)
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.text('Annual Review · FY 2025/26', MARGIN_X + 32, 50)

  // Right side
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.text('Gaurav Kumar Singh · Senior Sales Operations Partner', PAGE_W - MARGIN_X, 38, { align: 'right' })
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN_X, 50, { align: 'right' })

  // Hairline
  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, 62, PAGE_W - MARGIN_X, 62)
}

function drawFooter(doc) {
  setColor(doc, COLORS.faint, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.text('Confidential — Annual performance review', MARGIN_X, PAGE_H - 24)
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  doc.text(date, PAGE_W - MARGIN_X, PAGE_H - 24, { align: 'right' })
}

function newPage(doc, pageNum) {
  doc.addPage()
  drawHeader(doc, pageNum)
  drawFooter(doc)
  return 90 // y-cursor after header
}

function eyebrow(doc, text, y) {
  setColor(doc, COLORS.blue, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  doc.text(text.toUpperCase(), MARGIN_X, y, { charSpace: 1 })
  return y + 14
}

function sectionTitle(doc, text, y, size = 22) {
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(size)
  doc.text(text, MARGIN_X, y)
  return y + size * 1.1
}

function paragraph(doc, text, y, opts = {}) {
  const { width = CONTENT_W, size = 10, color = COLORS.text, lineHeight = 1.55, font = 'normal' } = opts
  setColor(doc, color, 'text')
  doc.setFont(FONT, font)
  doc.setFontSize(size)
  const lines = doc.splitTextToSize(text, width)
  lines.forEach((line, i) => {
    doc.text(line, MARGIN_X, y + i * size * lineHeight)
  })
  return y + lines.length * size * lineHeight + 4
}

function bullet(doc, strong, text, y, opts = {}) {
  const { size = 9.5, lineHeight = 1.5, indent = 14 } = opts
  // Blue dot
  setColor(doc, COLORS.blue, 'fill')
  doc.circle(MARGIN_X + 4, y - 3, 1.5, 'F')
  // Bold lead
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(size)
  const strongWidth = doc.getTextWidth(strong)
  doc.text(strong, MARGIN_X + indent, y)
  // Body text wrapping after the bold lead
  setColor(doc, COLORS.text, 'text')
  doc.setFont(FONT, 'normal')
  const remainingFirstLineW = CONTENT_W - indent - strongWidth - 4
  const allLines = doc.splitTextToSize(text, CONTENT_W - indent)
  // First line: portion that fits after the bold lead
  let firstLine = ''
  let restText = text
  if (remainingFirstLineW > 30) {
    const firstLineCandidate = doc.splitTextToSize(text, remainingFirstLineW)
    firstLine = firstLineCandidate[0] || ''
    if (firstLine && text.startsWith(firstLine)) {
      restText = text.slice(firstLine.length).trimStart()
    }
  }
  if (firstLine) {
    doc.text(firstLine, MARGIN_X + indent + strongWidth + 3, y)
  }
  let cursorY = y
  if (restText) {
    const restLines = doc.splitTextToSize(restText, CONTENT_W - indent)
    restLines.forEach((ln, i) => {
      doc.text(ln, MARGIN_X + indent, y + (i + 1) * size * lineHeight)
    })
    cursorY = y + restLines.length * size * lineHeight
  }
  return cursorY + 6
}

function ensureSpace(doc, y, needed, pageCounter) {
  if (y + needed > PAGE_H - 50) {
    pageCounter.value += 1
    return newPage(doc, pageCounter.value)
  }
  return y
}

// ============================================================================
// PAGE 1 — COVER / EXECUTIVE SUMMARY
// ============================================================================

function drawKpiTile(doc, x, y, w, h, tile) {
  const accentColor = {
    blue: COLORS.blue,
    teal: COLORS.teal,
    violet: COLORS.violet,
    orange: COLORS.orange,
  }[tile.accent] || COLORS.blue

  // Card background
  setColor(doc, [255, 255, 255], 'fill')
  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 8, 8, 'FD')

  // Accent square in top-right
  const sqSize = 18
  const lightFill = [
    Math.round(accentColor[0] + (255 - accentColor[0]) * 0.86),
    Math.round(accentColor[1] + (255 - accentColor[1]) * 0.86),
    Math.round(accentColor[2] + (255 - accentColor[2]) * 0.86),
  ]
  setColor(doc, lightFill, 'fill')
  doc.roundedRect(x + w - 14 - sqSize, y + 14, sqSize, sqSize, 4, 4, 'F')

  // Label (uppercase eyebrow)
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(7)
  const labelLines = doc.splitTextToSize(tile.label, w - sqSize - 30)
  labelLines.forEach((ln, i) => {
    doc.text(ln.toUpperCase(), x + 14, y + 22 + i * 9, { charSpace: 0.8 })
  })

  // Big value
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(28)
  doc.text(tile.value, x + 14, y + 60)

  // Sub copy
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  const subLines = doc.splitTextToSize(tile.sub, w - 28)
  subLines.slice(0, 3).forEach((ln, i) => {
    doc.text(ln, x + 14, y + 78 + i * 11)
  })
}

function drawCoverPage(doc, data) {
  drawHeader(doc, 1)
  drawFooter(doc)

  let y = 100

  y = eyebrow(doc, 'FY 2025/26 · Annual Review', y) + 4

  // Hero headline
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(26)
  const heroLines = doc.splitTextToSize(
    'From building dashboards to shipping a platform and owning a vertical.',
    CONTENT_W
  )
  heroLines.forEach((ln, i) => {
    doc.text(ln, MARGIN_X, y + i * 30)
  })
  y += heroLines.length * 30 + 16

  // Subhead
  y = paragraph(
    doc,
    'FY25/26 was the year I expanded scope across three dimensions at once: shipped a production analytics platform for the BFSI vertical, took end-to-end ownership of its revenue forecast, and operationalized cross-channel reporting infrastructure that the business now runs on weekly.',
    y,
    { size: 11, color: COLORS.muted, lineHeight: 1.55 }
  )
  y += 16

  // KPI tiles 2x2
  const tileW = (CONTENT_W - 12) / 2
  const tileH = 110
  data.kpis.forEach((tile, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    drawKpiTile(doc, MARGIN_X + col * (tileW + 12), y + row * (tileH + 12), tileW, tileH, tile)
  })
  y += 2 * tileH + 12 + 16

  // Promotion ask card
  setColor(doc, COLORS.bgBlueFaint, 'fill')
  setColor(doc, COLORS.borderBlueFaint, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 90, 8, 8, 'FD')

  setColor(doc, COLORS.blue, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  doc.text('THE PROMOTION ASK', MARGIN_X + 16, y + 20, { charSpace: 1 })

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(14)
  doc.text('IC4 → IC6', MARGIN_X + 16, y + 40)

  setColor(doc, COLORS.text, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9.5)
  const askLines = doc.splitTextToSize(
    'On the strength of having shipped multi-quarter, multi-stakeholder, function-shaping infrastructure that defines IC6 work at Turing.',
    CONTENT_W - 32
  )
  askLines.forEach((ln, i) => {
    doc.text(ln, MARGIN_X + 16, y + 58 + i * 12)
  })
}

// ============================================================================
// PAGE 2 — THE THREE QUESTIONS
// ============================================================================

function drawQuestionsPage(doc, data, pageCounter) {
  let y = newPage(doc, pageCounter.value)

  y = eyebrow(doc, 'The Three Questions', y) + 2
  y = sectionTitle(doc, 'What I\'m answering, and how.', y, 18) + 6

  data.questions.forEach((q, idx) => {
    y = ensureSpace(doc, y, 130, pageCounter)

    // Number + title
    setColor(doc, COLORS.borderBlueFaint, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(28)
    doc.text(q.number, MARGIN_X, y + 18)

    setColor(doc, COLORS.heading, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(13)
    doc.text(q.title, MARGIN_X + 38, y + 8)

    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(8)
    const subLines = doc.splitTextToSize(q.subtitle, CONTENT_W - 38)
    subLines.forEach((ln, i) => {
      doc.text(ln, MARGIN_X + 38, y + 22 + i * 10)
    })
    y = y + 22 + subLines.length * 10 + 6

    // BLUF box
    setColor(doc, COLORS.bgBlueFaint, 'fill')
    setColor(doc, COLORS.borderBlueFaint, 'draw')
    doc.setLineWidth(0.5)
    const blufLines = doc.splitTextToSize(q.bluf, CONTENT_W - 70)
    const blufBoxH = blufLines.length * 11 + 22
    doc.roundedRect(MARGIN_X, y, CONTENT_W, blufBoxH, 6, 6, 'FD')

    setColor(doc, COLORS.blue, 'fill')
    doc.roundedRect(MARGIN_X + 12, y + 8, 36, 14, 3, 3, 'F')
    setColor(doc, [255, 255, 255], 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(7)
    doc.text('BLUF', MARGIN_X + 30, y + 17, { align: 'center', charSpace: 1 })

    setColor(doc, COLORS.text, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    blufLines.forEach((ln, i) => {
      doc.text(ln, MARGIN_X + 56, y + 17 + i * 11)
    })
    y += blufBoxH + 12
    y += 6
  })
}

// ============================================================================
// PAGE 3 — THE YEAR IN MOTION
// ============================================================================

function drawYearPage(doc, data, pageCounter) {
  let y = newPage(doc, pageCounter.value)

  y = eyebrow(doc, 'The Year in Motion', y) + 2
  y = sectionTitle(doc, 'Foundation → Scale → Ownership → Platform.', y, 18) + 6

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9.5)
  const introLines = doc.splitTextToSize(
    'Each quarter built directly on the last. Highlights from each.',
    CONTENT_W
  )
  introLines.forEach((ln, i) => doc.text(ln, MARGIN_X, y + i * 13))
  y += introLines.length * 13 + 16

  data.quarters.forEach((q) => {
    y = ensureSpace(doc, y, 90, pageCounter)

    // Quarter chip + period
    setColor(doc, COLORS.blue, 'fill')
    doc.roundedRect(MARGIN_X, y, 50, 18, 4, 4, 'F')
    setColor(doc, [255, 255, 255], 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(8)
    doc.text(q.label, MARGIN_X + 25, y + 12, { align: 'center', charSpace: 0.8 })

    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    doc.text(q.period, MARGIN_X + 60, y + 12)

    y += 26

    setColor(doc, COLORS.heading, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(13)
    doc.text(q.headline, MARGIN_X, y)
    y += 18

    q.initiatives.forEach((init) => {
      y = ensureSpace(doc, y, 30, pageCounter)
      y = bullet(doc, init.title, ' — ' + init.impact, y, { size: 8.5 })
    })

    y += 8
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.4)
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)
    y += 14
  })
}

// ============================================================================
// PAGE 4 — BENCHMARKS VS IC6 (with native vector chart)
// ============================================================================

function drawBenchmarkChart(doc, x, y, w, h, benchmarks) {
  const STATUS_SCORE = { negative: 1, wip: 2, positive: 3 }
  const yLabels = { 1: 'Negative', 2: 'WIP', 3: 'Positive' }

  const padding = { top: 24, right: 16, bottom: 30, left: 60 }
  const plotX = x + padding.left
  const plotY = y + padding.top
  const plotW = w - padding.left - padding.right
  const plotH = h - padding.top - padding.bottom

  // Card frame
  setColor(doc, [255, 255, 255], 'fill')
  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 8, 8, 'FD')

  // Title
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.text('IC6 Benchmark Progression', x + 14, y + 18)

  // Y-axis labels and gridlines
  setColor(doc, COLORS.faint, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  ;[1, 2, 3].forEach((v) => {
    const yPx = plotY + plotH - ((v - 0) / 3) * plotH
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.3)
    // Dashed
    const dashPattern = [2, 2]
    doc.setLineDashPattern(dashPattern, 0)
    doc.line(plotX, yPx, plotX + plotW, yPx)
    doc.setLineDashPattern([], 0)
    setColor(doc, COLORS.faint, 'text')
    doc.text(yLabels[v], plotX - 6, yPx + 2, { align: 'right' })
  })

  // Bars per benchmark — last year (light) and this year (dark) side-by-side
  const groupCount = benchmarks.length
  const groupW = plotW / groupCount
  const barW = (groupW - 14) / 2

  benchmarks.forEach((b, i) => {
    const lastH = (STATUS_SCORE[b.last.status] / 3) * plotH
    const nowH = (STATUS_SCORE[b.now.status] / 3) * plotH
    const groupX = plotX + i * groupW + 7

    // Last year (light blue)
    setColor(doc, COLORS.blueLight, 'fill')
    doc.roundedRect(groupX, plotY + plotH - lastH, barW, lastH, 2, 2, 'F')

    // This year (primary blue)
    setColor(doc, COLORS.blue, 'fill')
    doc.roundedRect(groupX + barW + 4, plotY + plotH - nowH, barW, nowH, 2, 2, 'F')

    // Value label above each bar
    setColor(doc, COLORS.faint, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(6.5)
    doc.text(yLabels[STATUS_SCORE[b.last.status]], groupX + barW / 2, plotY + plotH - lastH - 3, { align: 'center' })

    setColor(doc, COLORS.heading, 'text')
    doc.text(yLabels[STATUS_SCORE[b.now.status]], groupX + barW + 4 + barW / 2, plotY + plotH - nowH - 3, { align: 'center' })

    // X-axis label
    setColor(doc, COLORS.text, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(7.5)
    doc.text(b.short, groupX + barW + 2, plotY + plotH + 14, { align: 'center' })
  })

  // Legend
  const legendY = y + h - 12
  setColor(doc, COLORS.blueLight, 'fill')
  doc.circle(plotX + 10, legendY, 3, 'F')
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.text('FY24/25', plotX + 18, legendY + 2.5)

  setColor(doc, COLORS.blue, 'fill')
  doc.circle(plotX + 70, legendY, 3, 'F')
  setColor(doc, COLORS.muted, 'text')
  doc.text('FY25/26', plotX + 78, legendY + 2.5)
}

function drawBenchmarksPage(doc, data, pageCounter) {
  let y = newPage(doc, pageCounter.value)

  y = eyebrow(doc, 'Benchmarks vs IC6', y) + 2
  y = sectionTitle(doc, 'Side-by-side: last year vs this year.', y, 18) + 6

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9.5)
  const introLines = doc.splitTextToSize(
    'Same rubric I self-assessed against last year. Four of five benchmarks moved to Positive. Communication remains the active growth area.',
    CONTENT_W
  )
  introLines.forEach((ln, i) => doc.text(ln, MARGIN_X, y + i * 13))
  y += introLines.length * 13 + 14

  // Stat strip — 3 small cards
  const statW = (CONTENT_W - 16) / 3
  const stats = [
    { label: 'BENCHMARKS AT POSITIVE', value: '4 / 5', color: COLORS.blue },
    { label: 'STATUSES IMPROVED YOY', value: '+4', color: COLORS.teal },
    { label: 'ACTIVE GROWTH AREA', value: '1', color: COLORS.orange },
  ]
  stats.forEach((s, i) => {
    const sx = MARGIN_X + i * (statW + 8)
    setColor(doc, [255, 255, 255], 'fill')
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.5)
    doc.roundedRect(sx, y, statW, 50, 6, 6, 'FD')
    setColor(doc, s.color, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(20)
    doc.text(s.value, sx + statW / 2, y + 26, { align: 'center' })
    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(7)
    doc.text(s.label, sx + statW / 2, y + 42, { align: 'center', charSpace: 0.8 })
  })
  y += 50 + 14

  // Chart
  drawBenchmarkChart(doc, MARGIN_X, y, CONTENT_W, 180, data.benchmarks)
  y += 180 + 14

  // Detail table — autoTable
  const rows = data.benchmarks.map((b) => [
    b.name,
    capitalizeStatus(b.last.status),
    capitalizeStatus(b.now.status),
    b.now.text,
  ])

  autoTable(doc, {
    startY: y,
    head: [['Benchmark', 'FY24/25', 'FY25/26', 'This year']],
    body: rows,
    margin: { left: MARGIN_X, right: MARGIN_X },
    theme: 'grid',
    styles: {
      font: FONT,
      fontSize: 8,
      cellPadding: 6,
      textColor: COLORS.text,
      lineColor: COLORS.hairline,
      lineWidth: 0.3,
      overflow: 'linebreak',
    },
    headStyles: {
      fillColor: COLORS.heading,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 7.5,
      cellPadding: 7,
    },
    columnStyles: {
      0: { cellWidth: 80, fontStyle: 'bold', textColor: COLORS.heading },
      1: { cellWidth: 50, halign: 'center', fontSize: 8 },
      2: { cellWidth: 50, halign: 'center', fontSize: 8, fontStyle: 'bold' },
      3: { cellWidth: 'auto', fontSize: 7.5, textColor: COLORS.text },
    },
    didParseCell: (hookData) => {
      if (hookData.section === 'body' && (hookData.column.index === 1 || hookData.column.index === 2)) {
        const status = hookData.cell.raw.toLowerCase()
        if (status === 'positive') {
          hookData.cell.styles.fillColor = [216, 240, 222]
          hookData.cell.styles.textColor = [30, 106, 44]
        } else if (status === 'wip' || status === 'in progress') {
          hookData.cell.styles.fillColor = [254, 243, 199]
          hookData.cell.styles.textColor = [146, 64, 14]
        } else if (status === 'negative' || status === 'was negative') {
          hookData.cell.styles.fillColor = [254, 226, 226]
          hookData.cell.styles.textColor = [153, 27, 27]
        }
      }
    },
  })
}

function capitalizeStatus(s) {
  if (s === 'wip') return 'WIP'
  if (s === 'positive') return 'Positive'
  if (s === 'negative') return 'Negative'
  return s
}

// ============================================================================
// PAGE 5 — IC6 SCOPE I'M ASKING FOR
// ============================================================================

function drawClosingPage(doc, data, pageCounter) {
  let y = newPage(doc, pageCounter.value)

  y = eyebrow(doc, 'Looking Ahead', y) + 2
  y = sectionTitle(doc, 'IC6 scope, formalized.', y, 18) + 6

  y = paragraph(
    doc,
    'The work I shipped this year already operates at IC6 scope — multi-quarter strategic infrastructure, function-wide impact, and demonstrated multiplier effect. The promotion ask is to formalize that scope, not to grant new scope.',
    y,
    { size: 10, color: COLORS.muted, lineHeight: 1.55 }
  ) + 8

  // 4 forward-ask cards in 2x2
  const cardW = (CONTENT_W - 12) / 2
  const cardH = 110
  data.forwardAsks.forEach((a, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = MARGIN_X + col * (cardW + 12)
    const cy = y + row * (cardH + 12)

    setColor(doc, [255, 255, 255], 'fill')
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.5)
    doc.roundedRect(x, cy, cardW, cardH, 8, 8, 'FD')

    // Number badge
    setColor(doc, COLORS.bgBlueFaint, 'fill')
    doc.roundedRect(x + 14, cy + 14, 26, 22, 4, 4, 'F')
    setColor(doc, COLORS.blue, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    doc.text(String(i + 1).padStart(2, '0'), x + 27, cy + 29, { align: 'center' })

    // Title
    setColor(doc, COLORS.heading, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    const titleLines = doc.splitTextToSize(a.title, cardW - 28)
    titleLines.forEach((ln, lineIdx) => doc.text(ln, x + 14, cy + 52 + lineIdx * 13))
    const titleEnd = cy + 52 + titleLines.length * 13

    // Body
    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(8)
    const bodyLines = doc.splitTextToSize(a.text, cardW - 28)
    bodyLines.slice(0, 4).forEach((ln, lineIdx) => {
      doc.text(ln, x + 14, titleEnd + 8 + lineIdx * 11)
    })
  })
  y += 2 * cardH + 12 + 20

  // Closing card
  setColor(doc, COLORS.bgBlueFaint, 'fill')
  setColor(doc, COLORS.borderBlueFaint, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(MARGIN_X, y, CONTENT_W, 90, 8, 8, 'FD')

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  doc.text('Confident the work this year speaks for itself.', MARGIN_X + 16, y + 26)

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(10)
  doc.text('Looking forward to the conversation.', MARGIN_X + 16, y + 44)

  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X + 16, y + 58, PAGE_W - MARGIN_X - 16, y + 58)

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(7)
  doc.text('GAURAV KUMAR SINGH', MARGIN_X + 16, y + 72, { charSpace: 1 })
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(10)
  doc.text('Senior Sales Operations Partner · Turing', MARGIN_X + 16, y + 84)
}

// ============================================================================
// MAIN ENTRY
// ============================================================================

export function generateReviewPDF(data) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const pageCounter = { value: 1 }

  drawCoverPage(doc, data)

  pageCounter.value = 2
  drawQuestionsPage(doc, data, pageCounter)

  pageCounter.value += 1
  drawYearPage(doc, data, pageCounter)

  pageCounter.value += 1
  drawBenchmarksPage(doc, data, pageCounter)

  pageCounter.value += 1
  drawClosingPage(doc, data, pageCounter)

  doc.save('Gaurav_Kumar_Singh_Year_in_Review_FY25-26.pdf')
}
