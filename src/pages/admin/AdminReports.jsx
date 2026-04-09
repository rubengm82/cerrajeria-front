import { useEffect, useRef, useState } from 'react'
import { HiArrowTrendingUp, HiChartBar, HiCube } from 'react-icons/hi2'
import LoadingAnimation from '../../components/LoadingAnimation'
import { getReportsSummary } from '../../api/reports_api'

const SALES_COLOR = '#DA7606'
const SALES_FILL = 'rgba(218, 118, 6, 0.14)'
const BAR_COLOR = '#1F2937'
const STOCK_COLOR = '#E06C00'
const GRID_COLOR = '#E7E2DB'
const TEXT_COLOR = '#57534E'

function formatCurrency(value) {
  return new Intl.NumberFormat('ca-ES', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + safeRadius, y)
  ctx.lineTo(x + width - safeRadius, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius)
  ctx.lineTo(x + width, y + height - safeRadius)
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height)
  ctx.lineTo(x + safeRadius, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius)
  ctx.lineTo(x, y + safeRadius)
  ctx.quadraticCurveTo(x, y, x + safeRadius, y)
  ctx.closePath()
}

function useCanvas(drawChart, dependencies) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current

    if (!canvas || !container) {
      return undefined
    }

    const redraw = () => {
      const rect = container.getBoundingClientRect()
      const width = Math.max(Math.floor(rect.width), 280)
      const height = 320
      const ratio = window.devicePixelRatio || 1

      canvas.width = width * ratio
      canvas.height = height * ratio
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      const ctx = canvas.getContext('2d')
      ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
      ctx.clearRect(0, 0, width, height)
      drawChart(ctx, width, height)
    }

    redraw()

    const resizeObserver = new ResizeObserver(() => redraw())
    resizeObserver.observe(container)

    window.addEventListener('resize', redraw)

    return () => {
      resizeObserver.disconnect()
      window.removeEventListener('resize', redraw)
    }
  }, dependencies)

  return { canvasRef, containerRef }
}

function EmptyChartState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-100/80 text-base-400">
      Encara no hi ha dades suficients per generar aquest gràfic.
    </div>
  )
}

function SalesLineChart({ data }) {
  const { canvasRef, containerRef } = useCanvas((ctx, width, height) => {
    const padding = { top: 24, right: 24, bottom: 48, left: 56 }
    const chartWidth = width - padding.left - padding.right
    const chartHeight = height - padding.top - padding.bottom
    const maxValue = Math.max(...data.map(item => item.total), 1)
    const stepY = maxValue / 4 || 1

    ctx.font = '12px sans-serif'
    ctx.strokeStyle = GRID_COLOR
    ctx.fillStyle = TEXT_COLOR
    ctx.lineWidth = 1

    for (let index = 0; index <= 4; index += 1) {
      const y = padding.top + (chartHeight / 4) * index
      const value = Math.round(maxValue - stepY * index)
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      ctx.fillText(formatCurrency(value), 8, y + 4)
    }

    if (data.length === 1) {
      const centerX = padding.left + chartWidth / 2
      const pointY = padding.top + chartHeight - (data[0].total / maxValue) * chartHeight
      ctx.fillStyle = SALES_FILL
      drawRoundedRect(ctx, centerX - 18, pointY, 36, height - padding.bottom - pointY, 12)
      ctx.fill()

      ctx.beginPath()
      ctx.fillStyle = SALES_COLOR
      ctx.arc(centerX, pointY, 5, 0, Math.PI * 2)
      ctx.fill()
      ctx.fillStyle = TEXT_COLOR
      ctx.textAlign = 'center'
      ctx.fillText(data[0].label, centerX, height - 18)
      ctx.textAlign = 'start'
      return
    }

    const points = data.map((item, index) => {
      const x = padding.left + (chartWidth / (data.length - 1)) * index
      const y = padding.top + chartHeight - (item.total / maxValue) * chartHeight
      return { ...item, x, y }
    })

    ctx.beginPath()
    ctx.moveTo(points[0].x, height - padding.bottom)
    points.forEach(point => ctx.lineTo(point.x, point.y))
    ctx.lineTo(points[points.length - 1].x, height - padding.bottom)
    ctx.closePath()
    ctx.fillStyle = SALES_FILL
    ctx.fill()

    ctx.beginPath()
    ctx.moveTo(points[0].x, points[0].y)
    points.slice(1).forEach(point => ctx.lineTo(point.x, point.y))
    ctx.strokeStyle = SALES_COLOR
    ctx.lineWidth = 3
    ctx.stroke()

    points.forEach(point => {
      ctx.beginPath()
      ctx.fillStyle = SALES_COLOR
      ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = TEXT_COLOR
      ctx.textAlign = 'center'
      ctx.fillText(point.label, point.x, height - 18)
    })

    ctx.textAlign = 'start'
  }, [data])

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-xl bg-base-100">
      <canvas ref={canvasRef} className="block w-full" aria-label="Gràfic de vendes mensuals" />
    </div>
  )
}

function HorizontalBarChart({ data, color, suffix, valueFormatter }) {
  const { canvasRef, containerRef } = useCanvas((ctx, width, height) => {
    const padding = { top: 20, right: 24, bottom: 20, left: 160 }
    const rowGap = 12
    const maxValue = Math.max(...data.map(item => item.value), 1)
    const availableHeight = height - padding.top - padding.bottom
    const barHeight = Math.max(14, (availableHeight - rowGap * (data.length - 1)) / data.length)

    ctx.font = '12px sans-serif'
    ctx.textBaseline = 'middle'

    data.forEach((item, index) => {
      const y = padding.top + index * (barHeight + rowGap)
      const barWidth = ((width - padding.left - padding.right) * item.value) / maxValue

      ctx.fillStyle = '#F3EEE7'
      drawRoundedRect(ctx, padding.left, y, width - padding.left - padding.right, barHeight, 10)
      ctx.fill()

      ctx.fillStyle = color
      drawRoundedRect(ctx, padding.left, y, Math.max(barWidth, 6), barHeight, 10)
      ctx.fill()

      ctx.fillStyle = TEXT_COLOR
      ctx.textAlign = 'right'
      ctx.fillText(item.label.length > 24 ? `${item.label.slice(0, 24)}...` : item.label, padding.left - 12, y + barHeight / 2)

      ctx.textAlign = 'left'
      ctx.fillText(`${valueFormatter(item.value)}${suffix}`, padding.left + barWidth + 8, y + barHeight / 2)
    })

    ctx.textAlign = 'start'
  }, [data, color, suffix, valueFormatter])

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-xl bg-base-100">
      <canvas ref={canvasRef} className="block w-full" aria-label="Gràfic de barres" />
    </div>
  )
}

function StatCard({ icon, label, value, helper }) {
  return (
    <div className="simple-container">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-base-400">{label}</p>
          <p className="mt-3 text-3xl font-bold text-base-content">{value}</p>
          <p className="mt-2 text-sm text-base-400">{helper}</p>
        </div>
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary">
          {icon}
        </div>
      </div>
    </div>
  )
}

export default function AdminReports() {
  const [reportData, setReportData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    const loadReports = async () => {
      try {
        const response = await getReportsSummary()
        if (isMounted) {
          setReportData(response.data)
        }
      } catch (error) {
        console.error('Error loading reports summary', error)
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    loadReports()

    return () => {
      isMounted = false
    }
  }, [])

  if (loading) {
    return <LoadingAnimation heightClass="h-[calc(100vh-260px)]" />
  }

  const salesByMonth = reportData?.sales_by_month ?? []
  const topProducts = reportData?.top_products ?? []
  const lowStockProducts = reportData?.low_stock_products ?? []
  const summary = reportData?.summary ?? {}

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-primary">Administració</p>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Informes</h1>
            <p className="mt-2 max-w-3xl text-base text-base-400">
              Consulta l&apos;evolució mensual de les vendes, els productes més venuts i els articles amb menys estoc des d&apos;un únic panell.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard
          icon={<HiArrowTrendingUp className="size-6" />}
          label="Facturació total"
          value={formatCurrency(summary.total_sales_amount)}
          helper={`${summary.total_units_sold || 0} unitats venudes`}
        />
        <StatCard
          icon={<HiChartBar className="size-6" />}
          label="Comandes processades"
          value={summary.total_orders || 0}
          helper="Comandes amb estat pendent, enviat o confirmat"
        />
        <StatCard
          icon={<HiCube className="size-6" />}
          label="Estoc baix"
          value={summary.low_stock_products_count || 0}
          helper="Productes mostrats al gràfic de baix estoc"
        />
      </div>

      <section className="simple-container">
        <div className="mb-5 flex flex-col gap-2">
          <h2 className="text-2xl font-bold text-base-content">Vendes per període de temps</h2>
          <p className="text-sm text-base-400">Volum mensual de vendes dels darrers 6 mesos.</p>
        </div>
        {salesByMonth.length > 0 ? <SalesLineChart data={salesByMonth} /> : <EmptyChartState />}
      </section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <section className="simple-container">
          <div className="mb-5 flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-base-content">Productes més venuts</h2>
            <p className="text-sm text-base-400">Top 10 productes amb més unitats venudes.</p>
          </div>
          {topProducts.length > 0 ? (
            <HorizontalBarChart
              data={topProducts.map(product => ({
                label: product.name,
                value: product.quantity_sold,
              }))}
              color={BAR_COLOR}
              suffix=" u."
              valueFormatter={(value) => value}
            />
          ) : (
            <EmptyChartState />
          )}
        </section>

        <section className="simple-container">
          <div className="mb-5 flex flex-col gap-2">
            <h2 className="text-2xl font-bold text-base-content">Stock més baix</h2>
            <p className="text-sm text-base-400">Productes amb menys unitats disponibles actualment.</p>
          </div>
          {lowStockProducts.length > 0 ? (
            <HorizontalBarChart
              data={lowStockProducts.map(product => ({
                label: product.name,
                value: product.stock,
              }))}
              color={STOCK_COLOR}
              suffix=" u."
              valueFormatter={(value) => value}
            />
          ) : (
            <EmptyChartState />
          )}
        </section>
      </div>
    </div>
  )
}
