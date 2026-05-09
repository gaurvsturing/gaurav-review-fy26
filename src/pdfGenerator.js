// pdfGenerator.js — generates a 5-page branded PDF for the Year in Review.
// Style follows the Apollo Burn Sheet from the BFSI Master Platform:
// crisp typography, KPI tile strip, native vector charts, table layouts.
//
// Notes on this revision:
// - Real Turing logo image embedded in every page header (no more primitive recreation)
// - All "→" arrows replaced with ">" since jsPDF's default Helvetica
//   doesn't include those Unicode glyphs
// - Promotion Ask box removed from cover page
// - Page-break guards: every section checks remaining vertical space
//   before drawing and rolls onto a new page if it won't fit
// - Bullet spacing made consistent and overflow-safe
// - Chart Y-axis padding increased so top labels don't collide with bar labels

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
const MARGIN_TOP = 70   // y after header
const MARGIN_BOTTOM = 50 // distance from bottom that triggers page break
const CONTENT_W = PAGE_W - MARGIN_X * 2

// Replace Unicode arrows that don't render in Helvetica with ASCII alternatives
function safeText(s) {
  if (typeof s !== 'string') return s
  return s
    .replace(/→/g, '>')
    .replace(/←/g, '<')
    .replace(/↑/g, '^')
    .replace(/↓/g, 'v')
}

// ============================================================================
// LOGO LOADING
// ============================================================================

async function loadLogoAsDataUrl() {
  try {
    const baseUrl = (typeof import.meta !== 'undefined' && import.meta.env)
      ? import.meta.env.BASE_URL
      : '/'
    const res = await fetch(`${baseUrl}turing-logo.jpg`)
    if (!res.ok) return null
    const blob = await res.blob()
    return await new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  } catch (err) {
    console.warn('Could not load Turing logo for PDF', err)
    return null
  }
}

// ============================================================================
// SHARED DRAWING HELPERS
// ============================================================================

function setColor(doc, c, kind = 'text') {
  if (kind === 'text') doc.setTextColor(c[0], c[1], c[2])
  else if (kind === 'fill') doc.setFillColor(c[0], c[1], c[2])
  else if (kind === 'draw') doc.setDrawColor(c[0], c[1], c[2])
}

function drawHeader(doc, pageNum, logoDataUrl) {
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, 'JPEG', MARGIN_X, 26, 22, 22, undefined, 'FAST')
    } catch (e) {
      setColor(doc, [15, 15, 15], 'fill')
      doc.roundedRect(MARGIN_X, 26, 22, 22, 4, 4, 'F')
    }
  } else {
    setColor(doc, [15, 15, 15], 'fill')
    doc.roundedRect(MARGIN_X, 26, 22, 22, 4, 4, 'F')
  }

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.text('TURING', MARGIN_X + 30, 36)
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.text('Annual Review \u00B7 FY 2025/26', MARGIN_X + 30, 47)

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  doc.text('Gaurav Kumar Singh \u00B7 Senior Sales Operations Partner', PAGE_W - MARGIN_X, 36, { align: 'right' })
  doc.text(`Page ${pageNum}`, PAGE_W - MARGIN_X, 47, { align: 'right' })

  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, 58, PAGE_W - MARGIN_X, 58)
}

function drawFooter(doc) {
  setColor(doc, COLORS.faint, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  doc.text('Confidential \u2014 Annual performance review', MARGIN_X, PAGE_H - 24)
  const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  doc.text(date, PAGE_W - MARGIN_X, PAGE_H - 24, { align: 'right' })
}

function newPage(state) {
  state.doc.addPage()
  state.page += 1
  drawHeader(state.doc, state.page, state.logo)
  drawFooter(state.doc)
  return MARGIN_TOP + 8
}

function ensure(state, y, needed) {
  if (y + needed > PAGE_H - MARGIN_BOTTOM) {
    return newPage(state)
  }
  return y
}

function eyebrow(doc, text, y) {
  setColor(doc, COLORS.blue, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(8)
  doc.text(safeText(text).toUpperCase(), MARGIN_X, y, { charSpace: 1 })
  return y + 14
}

function sectionTitle(doc, text, y, size = 22) {
  // doc.text() places text at the baseline. For an N-pt font, cap-height
  // extends ~0.85*N above the baseline. Push the baseline DOWN by `size`
  // so the heading's top edge clears whatever's above it (e.g. an eyebrow).
  const baseY = y + size
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(size)
  const lines = doc.splitTextToSize(safeText(text), CONTENT_W)
  lines.forEach((ln, i) => {
    doc.text(ln, MARGIN_X, baseY + i * size * 1.1)
  })
  return baseY + (lines.length - 1) * size * 1.1 + size * 0.3 // bottom of last line
}

function paragraph(doc, text, y, opts = {}) {
  const { width = CONTENT_W, size = 10, color = COLORS.text, lineHeight = 1.55, font = 'normal' } = opts
  setColor(doc, color, 'text')
  doc.setFont(FONT, font)
  doc.setFontSize(size)
  const lines = doc.splitTextToSize(safeText(text), width)
  lines.forEach((line, i) => {
    doc.text(line, MARGIN_X, y + i * size * lineHeight)
  })
  return y + lines.length * size * lineHeight + 4
}

// Bullet renderer with proper vertical spacing.
// Strategy: render bold "strong" on the first line, render body text wrapping
// on subsequent lines starting BELOW the strong line. This is slightly less
// compact than inline-bold-then-body but guarantees zero overlap between
// adjacent bullets.
function bullet(state, strong, text, y, opts = {}) {
  const { size = 9, lineHeight = 1.45, indent = 14, gap = 8 } = opts
  const doc = state.doc
  const safeStrong = safeText(strong)
  const safeBody = safeText(text)
  const lineH = size * lineHeight

  // Pre-measure the body wrapped to indent width
  doc.setFont(FONT, 'normal')
  doc.setFontSize(size)

  // Try to inline-fit the body after the bold strong on the first line.
  doc.setFont(FONT, 'bold')
  const strongWidth = doc.getTextWidth(safeStrong)

  doc.setFont(FONT, 'normal')
  const firstLineRemainingW = CONTENT_W - indent - strongWidth - 4

  // Build the full layout in advance:
  //   Line 0: [bold strong] [maybe inline body fragment]
  //   Lines 1..n: rest of body wrapped to (CONTENT_W - indent)
  let firstInline = ''
  let remaining = safeBody
  if (firstLineRemainingW > 60 && remaining.length > 0) {
    const candidate = doc.splitTextToSize(remaining, firstLineRemainingW)
    firstInline = candidate[0] || ''
    if (firstInline) {
      remaining = remaining.slice(firstInline.length).trimStart()
    }
  }

  const restLines = remaining ? doc.splitTextToSize(remaining, CONTENT_W - indent) : []
  const totalLines = 1 + restLines.length // line 0 + wrapped body lines
  const totalHeight = totalLines * lineH

  // Page-break check before we start drawing
  y = ensure(state, y, totalHeight + gap + 4)

  // Blue dot — vertically centered on the first text line (~3pt above baseline)
  setColor(doc, COLORS.blue, 'fill')
  doc.circle(MARGIN_X + 4, y - 3, 1.6, 'F')

  // Line 0 — bold strong
  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(size)
  doc.text(safeStrong, MARGIN_X + indent, y)

  // Line 0 — inline body fragment (if any)
  if (firstInline) {
    setColor(doc, COLORS.text, 'text')
    doc.setFont(FONT, 'normal')
    doc.text(firstInline, MARGIN_X + indent + strongWidth + 3, y)
  }

  // Lines 1..n — wrapped body
  if (restLines.length > 0) {
    setColor(doc, COLORS.text, 'text')
    doc.setFont(FONT, 'normal')
    restLines.forEach((ln, i) => {
      doc.text(ln, MARGIN_X + indent, y + (i + 1) * lineH)
    })
  }

  // Return position BELOW the last line of text, plus a meaningful gap.
  // y + (totalLines - 1) * lineH = baseline of last line.
  // Add lineH so we're below the text body (not on top of it).
  // Add `gap` for breathing room before the next bullet.
  const lastBaseline = y + (totalLines - 1) * lineH
  return lastBaseline + lineH * 0.3 + gap
}

// ============================================================================
// PAGE 1 — COVER / EXECUTIVE SUMMARY (no Promotion Ask)
// ============================================================================

function drawKpiTile(doc, x, y, w, h, tile) {
  const accentColor = {
    blue: COLORS.blue,
    teal: COLORS.teal,
    violet: COLORS.violet,
    orange: COLORS.orange,
  }[tile.accent] || COLORS.blue

  setColor(doc, [255, 255, 255], 'fill')
  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 8, 8, 'FD')

  const sqSize = 18
  const lightFill = [
    Math.round(accentColor[0] + (255 - accentColor[0]) * 0.86),
    Math.round(accentColor[1] + (255 - accentColor[1]) * 0.86),
    Math.round(accentColor[2] + (255 - accentColor[2]) * 0.86),
  ]
  setColor(doc, lightFill, 'fill')
  doc.roundedRect(x + w - 14 - sqSize, y + 14, sqSize, sqSize, 4, 4, 'F')

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(7)
  const labelMaxW = w - 28 - sqSize - 8
  const labelLines = doc.splitTextToSize(safeText(tile.label).toUpperCase(), labelMaxW)
  labelLines.slice(0, 2).forEach((ln, i) => {
    doc.text(ln, x + 14, y + 22 + i * 9, { charSpace: 0.8 })
  })

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(28)
  doc.text(safeText(tile.value), x + 14, y + 60)

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(8.5)
  const subLines = doc.splitTextToSize(safeText(tile.sub), w - 28)
  subLines.slice(0, 3).forEach((ln, i) => {
    doc.text(ln, x + 14, y + 78 + i * 11)
  })
}

function drawCoverPage(state) {
  const doc = state.doc
  drawHeader(doc, 1, state.logo)
  drawFooter(doc)

  let y = MARGIN_TOP + 20

  y = eyebrow(doc, 'FY 2025/26 \u00B7 Annual Review', y)
  // The hero uses doc.text() which positions text at the BASELINE.
  // For a 26pt font, the cap-height extends ~22pt above the baseline.
  // We need to push the hero's baseline DOWN by at least 26pt so the cap-height
  // doesn't overlap with the eyebrow above.
  y += 32

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(26)
  const heroLines = doc.splitTextToSize(
    safeText('From building dashboards to shipping a platform and owning a vertical.'),
    CONTENT_W
  )
  heroLines.forEach((ln, i) => {
    doc.text(ln, MARGIN_X, y + i * 30)
  })
  y += heroLines.length * 30 + 16

  y = paragraph(
    doc,
    'FY25/26 was the year I expanded scope across three dimensions at once: shipped a production analytics platform for the BFSI vertical, took end-to-end ownership of its revenue forecast, and operationalized cross-channel reporting infrastructure that the business now runs on weekly.',
    y,
    { size: 11, color: COLORS.muted, lineHeight: 1.55 }
  )
  y += 16

  const tileW = (CONTENT_W - 12) / 2
  const tileH = 110
  state.data.kpis.forEach((tile, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    drawKpiTile(doc, MARGIN_X + col * (tileW + 12), y + row * (tileH + 12), tileW, tileH, tile)
  })
  // Promotion ask box removed per request
}

// ============================================================================
// PAGE 2 — THE THREE QUESTIONS
// ============================================================================

function drawQuestionsPage(state) {
  const doc = state.doc
  let y = newPage(state)

  y = eyebrow(doc, 'The Three Questions', y) + 2
  y = sectionTitle(doc, 'What I\'m answering, and how.', y, 18) + 8

  // Tagline under heading
  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9.5)
  const taglineLines = doc.splitTextToSize(
    safeText('Each answer leads with a BLUF (Bottom Line Up Front) summary \u2014 the format I adopted this year as a direct response to Amar Duggal and Michael Wang\'s brevity coaching.'),
    CONTENT_W
  )
  taglineLines.forEach((ln, i) => doc.text(ln, MARGIN_X, y + i * 13))
  y += taglineLines.length * 13 + 18

  state.data.questions.forEach((q) => {
    // Pre-measure header/subtitle/BLUF; content sections rendered after with ensure() guards
    doc.setFont(FONT, 'bold'); doc.setFontSize(13)
    const titleH = 16
    doc.setFont(FONT, 'normal'); doc.setFontSize(8)
    const subLines = doc.splitTextToSize(safeText(q.subtitle), CONTENT_W - 38)
    const subH = subLines.length * 10
    doc.setFontSize(9)
    const blufLines = doc.splitTextToSize(safeText(q.bluf), CONTENT_W - 70)
    const blufH = blufLines.length * 11 + 22
    const blockH = titleH + subH + 12 + blufH + 18

    y = ensure(state, y, blockH)

    // Number
    setColor(doc, COLORS.borderBlueFaint, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(28)
    doc.text(q.number, MARGIN_X, y + 18)

    // Title
    setColor(doc, COLORS.heading, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(13)
    doc.text(safeText(q.title), MARGIN_X + 38, y + 8)

    // Subtitle
    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(8)
    subLines.forEach((ln, i) => {
      doc.text(ln, MARGIN_X + 38, y + 22 + i * 10)
    })
    y = y + 22 + subLines.length * 10 + 8

    // BLUF box
    setColor(doc, COLORS.bgBlueFaint, 'fill')
    setColor(doc, COLORS.borderBlueFaint, 'draw')
    doc.setLineWidth(0.5)
    doc.roundedRect(MARGIN_X, y, CONTENT_W, blufH, 6, 6, 'FD')

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
    y += blufH + 12

    // Render the question's content sections — heading + 1-2 line description
    if (q.sections && q.sections.length > 0) {
      q.sections.forEach((sec) => {
        if (!sec.heading) return // skip continuation sections (e.g. Q2 second prose block)

        // Pre-build the description: first sentence of prose, OR list of bullet titles
        let description = ''
        if (sec.prose) {
          // Take the first 1-2 sentences (up to ~180 chars)
          const firstSentence = sec.prose.split(/(?<=\.)\s/)[0] || sec.prose
          description = firstSentence.length > 200
            ? firstSentence.slice(0, 197).trimEnd() + '...'
            : firstSentence
        } else if (sec.bullets && sec.bullets.length > 0) {
          // List the bold lead-ins of each bullet, comma-separated
          const titles = sec.bullets.map(b => (b.strong || '').replace(/[.\u2014]+$/, '').trim())
          description = titles.join(' \u00B7 ')
        }

        // Reserve enough vertical space for heading + description
        doc.setFont(FONT, 'normal'); doc.setFontSize(8.5)
        const descLines = description ? doc.splitTextToSize(safeText(description), CONTENT_W - 14) : []
        const blockH = 16 + descLines.length * 11 + 6
        y = ensure(state, y, blockH)

        // Heading with bullet marker
        setColor(doc, COLORS.blue, 'fill')
        doc.circle(MARGIN_X + 4, y - 2, 1.6, 'F')

        setColor(doc, COLORS.heading, 'text')
        doc.setFont(FONT, 'bold')
        doc.setFontSize(9.5)
        const headingLines = doc.splitTextToSize(safeText(sec.heading), CONTENT_W - 14)
        headingLines.forEach((ln, i) => doc.text(ln, MARGIN_X + 14, y + i * 12))
        y += headingLines.length * 12 + 4

        // Description (1-2 lines, muted color)
        if (descLines.length > 0) {
          setColor(doc, COLORS.muted, 'text')
          doc.setFont(FONT, 'normal')
          doc.setFontSize(8.5)
          descLines.forEach((ln, i) => doc.text(ln, MARGIN_X + 14, y + i * 11))
          y += descLines.length * 11 + 8
        }
      })
    }

    y += 12 // gap between questions
  })
}

// ============================================================================
// PAGE 3 — THE YEAR IN MOTION
// ============================================================================

function drawYearPage(state) {
  const doc = state.doc
  let y = newPage(state)

  y = eyebrow(doc, 'The Year in Motion', y) + 2
  y = sectionTitle(doc, 'Foundation > Scale > Ownership > Platform.', y, 18) + 8

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9.5)
  const introLines = doc.splitTextToSize(
    'Each quarter built directly on the last. Highlights from each.',
    CONTENT_W
  )
  introLines.forEach((ln, i) => doc.text(ln, MARGIN_X, y + i * 13))
  y += introLines.length * 13 + 16

  state.data.quarters.forEach((q) => {
    // Comfortable spacing — same as the version the user approved
    const chipBlockH = 18 + 16 // chip height + breathing room before heading
    const headlineH = 14
    const bulletSize = 8.5
    const bulletLineHRatio = 1.45
    const bulletLineH = bulletSize * bulletLineHRatio
    const bulletGap = 5

    // Measure each initiative's actual rendered height
    let bulletsTotalH = 0
    q.initiatives.forEach((init) => {
      const safeStrong = safeText(init.title)
      const safeBody = safeText('\u2014 ' + init.impact)

      doc.setFont(FONT, 'bold'); doc.setFontSize(bulletSize)
      const strongWidth = doc.getTextWidth(safeStrong)
      doc.setFont(FONT, 'normal')

      const indent = 14
      const firstLineRemainingW = CONTENT_W - indent - strongWidth - 4
      let firstInline = ''
      let remaining = safeBody
      if (firstLineRemainingW > 60 && remaining.length > 0) {
        const candidate = doc.splitTextToSize(remaining, firstLineRemainingW)
        firstInline = candidate[0] || ''
        if (firstInline) remaining = remaining.slice(firstInline.length).trimStart()
      }
      const restLines = remaining ? doc.splitTextToSize(remaining, CONTENT_W - indent) : []
      const totalLines = 1 + restLines.length
      bulletsTotalH += totalLines * bulletLineH + bulletGap
    })

    const dividerH = 14
    const totalQuarterH = chipBlockH + headlineH + bulletsTotalH + dividerH

    const pageContentH = PAGE_H - MARGIN_TOP - MARGIN_BOTTOM - 20
    if (totalQuarterH <= pageContentH) {
      y = ensure(state, y, totalQuarterH)
    }

    // === Draw the quarter ===
    setColor(doc, COLORS.blue, 'fill')
    doc.roundedRect(MARGIN_X, y, 50, 18, 4, 4, 'F')
    setColor(doc, [255, 255, 255], 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(8)
    doc.text(q.label, MARGIN_X + 25, y + 12, { align: 'center', charSpace: 0.8 })

    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(9)
    doc.text(safeText(q.period), MARGIN_X + 60, y + 12)

    y += chipBlockH

    setColor(doc, COLORS.heading, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(13)
    doc.text(safeText(q.headline), MARGIN_X, y)
    y += headlineH

    q.initiatives.forEach((init) => {
      y = bullet(state, init.title, '\u2014 ' + init.impact, y, {
        size: bulletSize,
        lineHeight: bulletLineHRatio,
        gap: bulletGap,
      })
    })

    y += 6
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.4)
    doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)
    y += 14
  })
}

// ============================================================================
// PAGE 4 — BENCHMARKS VS IC6
// ============================================================================

function drawBenchmarkChart(doc, x, y, w, h, benchmarks) {
  const STATUS_SCORE = { negative: 1, wip: 2, positive: 3 }
  const yLabels = { 1: 'Negative', 2: 'WIP', 3: 'Positive' }

  const padding = { top: 38, right: 16, bottom: 36, left: 60 }
  const plotX = x + padding.left
  const plotY = y + padding.top
  const plotW = w - padding.left - padding.right
  const plotH = h - padding.top - padding.bottom

  setColor(doc, [255, 255, 255], 'fill')
  setColor(doc, COLORS.hairline, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(x, y, w, h, 8, 8, 'FD')

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(11)
  doc.text('IC6 Benchmark Progression', x + 14, y + 20)

  setColor(doc, COLORS.faint, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(7.5)
  ;[1, 2, 3].forEach((v) => {
    const yPx = plotY + plotH - (v / 3) * plotH
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.3)
    doc.setLineDashPattern([2, 2], 0)
    doc.line(plotX, yPx, plotX + plotW, yPx)
    doc.setLineDashPattern([], 0)
    setColor(doc, COLORS.faint, 'text')
    doc.text(yLabels[v], plotX - 6, yPx + 2, { align: 'right' })
  })

  const groupCount = benchmarks.length
  const groupW = plotW / groupCount
  const barW = (groupW - 14) / 2

  benchmarks.forEach((b, i) => {
    const lastH = (STATUS_SCORE[b.last.status] / 3) * plotH
    const nowH = (STATUS_SCORE[b.now.status] / 3) * plotH
    const groupX = plotX + i * groupW + 7

    setColor(doc, COLORS.blueLight, 'fill')
    doc.roundedRect(groupX, plotY + plotH - lastH, barW, lastH, 2, 2, 'F')

    setColor(doc, COLORS.blue, 'fill')
    doc.roundedRect(groupX + barW + 4, plotY + plotH - nowH, barW, nowH, 2, 2, 'F')

    setColor(doc, COLORS.faint, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(6.5)
    doc.text(yLabels[STATUS_SCORE[b.last.status]], groupX + barW / 2, plotY + plotH - lastH - 4, { align: 'center' })

    setColor(doc, COLORS.heading, 'text')
    doc.text(yLabels[STATUS_SCORE[b.now.status]], groupX + barW + 4 + barW / 2, plotY + plotH - nowH - 4, { align: 'center' })

    setColor(doc, COLORS.text, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(7.5)
    doc.text(b.short, groupX + barW + 2, plotY + plotH + 14, { align: 'center' })
  })

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

function capitalizeStatus(s) {
  if (s === 'wip') return 'WIP'
  if (s === 'positive') return 'Positive'
  if (s === 'negative') return 'Negative'
  return s
}

function drawBenchmarksPage(state) {
  const doc = state.doc
  let y = newPage(state)

  y = eyebrow(doc, 'Benchmarks vs IC6', y) + 2
  y = sectionTitle(doc, 'Side-by-side: last year vs this year.', y, 18) + 8

  setColor(doc, COLORS.muted, 'text')
  doc.setFont(FONT, 'normal')
  doc.setFontSize(9.5)
  const introLines = doc.splitTextToSize(
    'Same rubric I self-assessed against last year. Four of five benchmarks moved to Positive. Communication remains the active growth area.',
    CONTENT_W
  )
  introLines.forEach((ln, i) => doc.text(ln, MARGIN_X, y + i * 13))
  y += introLines.length * 13 + 14

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

  drawBenchmarkChart(doc, MARGIN_X, y, CONTENT_W, 195, state.data.benchmarks)
  y += 195 + 14

  const rows = state.data.benchmarks.map((b) => [
    b.name,
    capitalizeStatus(b.last.status),
    capitalizeStatus(b.now.status),
    safeText(b.now.text),
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
        } else if (status === 'wip') {
          hookData.cell.styles.fillColor = [254, 243, 199]
          hookData.cell.styles.textColor = [146, 64, 14]
        } else if (status === 'negative') {
          hookData.cell.styles.fillColor = [254, 226, 226]
          hookData.cell.styles.textColor = [153, 27, 27]
        }
      }
    },
  })
}

// ============================================================================
// PAGE 5 — IC6 SCOPE I'M ASKING FOR (uniform 2x2 cards sized to tallest content)
// ============================================================================

function drawClosingPage(state) {
  const doc = state.doc
  let y = newPage(state)

  y = eyebrow(doc, 'Looking Ahead', y) + 2
  y = sectionTitle(doc, 'IC6 scope, formalized.', y, 18) + 8

  y = paragraph(
    doc,
    'The work I shipped this year already operates at IC6 scope \u2014 multi-quarter strategic infrastructure, function-wide impact, and demonstrated multiplier effect. The promotion ask is to formalize that scope, not to grant new scope.',
    y,
    { size: 10, color: COLORS.muted, lineHeight: 1.55 }
  ) + 8

  const cardW = (CONTENT_W - 12) / 2
  const innerW = cardW - 28
  const titleSize = 11
  const titleLineH = 13
  const bodySize = 8
  const bodyLineH = 11
  const cardTopOffset = 52  // y inside card where title starts (after number badge)
  const cardPadBottom = 14

  // Pre-measure each card's required height; use the max for uniform 2x2 grid
  let maxNeededH = 0
  state.data.forwardAsks.forEach((a) => {
    doc.setFont(FONT, 'bold'); doc.setFontSize(titleSize)
    const titleLines = doc.splitTextToSize(safeText(a.title), innerW)
    doc.setFont(FONT, 'normal'); doc.setFontSize(bodySize)
    const bodyLines = doc.splitTextToSize(safeText(a.text), innerW)
    const needed = cardTopOffset + titleLines.length * titleLineH + 8 + bodyLines.length * bodyLineH + cardPadBottom
    if (needed > maxNeededH) maxNeededH = needed
  })
  const cardH = Math.max(maxNeededH, 110)

  // Make sure all 4 cards + closing card fit; if not, reflow to a fresh page
  const closingH = 90
  const totalH = 2 * cardH + 12 + 20 + closingH
  if (y + totalH > PAGE_H - MARGIN_BOTTOM) {
    y = newPage(state)
    y = eyebrow(doc, 'Looking Ahead', y) + 2
    y = sectionTitle(doc, 'IC6 scope, formalized.', y, 18) + 8
  }

  state.data.forwardAsks.forEach((a, i) => {
    const col = i % 2
    const row = Math.floor(i / 2)
    const x = MARGIN_X + col * (cardW + 12)
    const cy = y + row * (cardH + 12)

    setColor(doc, [255, 255, 255], 'fill')
    setColor(doc, COLORS.hairline, 'draw')
    doc.setLineWidth(0.5)
    doc.roundedRect(x, cy, cardW, cardH, 8, 8, 'FD')

    setColor(doc, COLORS.bgBlueFaint, 'fill')
    doc.roundedRect(x + 14, cy + 14, 26, 22, 4, 4, 'F')
    setColor(doc, COLORS.blue, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(11)
    doc.text(String(i + 1).padStart(2, '0'), x + 27, cy + 29, { align: 'center' })

    setColor(doc, COLORS.heading, 'text')
    doc.setFont(FONT, 'bold')
    doc.setFontSize(titleSize)
    const titleLines = doc.splitTextToSize(safeText(a.title), innerW)
    titleLines.forEach((ln, lineIdx) => doc.text(ln, x + 14, cy + cardTopOffset + lineIdx * titleLineH))
    const titleEnd = cy + cardTopOffset + titleLines.length * titleLineH

    setColor(doc, COLORS.muted, 'text')
    doc.setFont(FONT, 'normal')
    doc.setFontSize(bodySize)
    const bodyLines = doc.splitTextToSize(safeText(a.text), innerW)
    // No more clamping — card height is sized to fit all lines
    bodyLines.forEach((ln, lineIdx) => {
      doc.text(ln, x + 14, titleEnd + 8 + lineIdx * bodyLineH)
    })
  })
  y += 2 * cardH + 12 + 20

  y = ensure(state, y, closingH + 8)
  setColor(doc, COLORS.bgBlueFaint, 'fill')
  setColor(doc, COLORS.borderBlueFaint, 'draw')
  doc.setLineWidth(0.5)
  doc.roundedRect(MARGIN_X, y, CONTENT_W, closingH, 8, 8, 'FD')

  setColor(doc, COLORS.heading, 'text')
  doc.setFont(FONT, 'bold')
  doc.setFontSize(13)
  doc.text(safeText('Confident the work this year speaks for itself.'), MARGIN_X + 16, y + 26)

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
  doc.text(safeText('Senior Sales Operations Partner \u00B7 Turing'), MARGIN_X + 16, y + 84)
}

// ============================================================================
// MAIN ENTRY
// ============================================================================

export async function generateReviewPDF(data) {
  const logo = await loadLogoAsDataUrl()
  const doc = new jsPDF({ unit: 'pt', format: 'a4', compress: true })
  const state = { doc, page: 1, logo, data }

  drawCoverPage(state)
  drawQuestionsPage(state)
  drawYearPage(state)
  drawBenchmarksPage(state)
  drawClosingPage(state)

  doc.save('Gaurav_Kumar_Singh_Year_in_Review_FY25-26.pdf')
}
