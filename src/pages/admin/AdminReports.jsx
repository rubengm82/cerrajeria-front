import { useCallback, useEffect, useRef, useState } from 'react'
import { HiArrowTrendingUp, HiChartBar, HiCube } from 'react-icons/hi2'
import { Link } from 'react-router-dom'
import LoadingAnimation from '../../components/LoadingAnimation'
import { getReportsSummary } from '../../api/reports_api'

function cssVar(styles, name) {
  return styles.getPropertyValue(name).trim()
}

function getReportChartColors() {
  const styles = getComputedStyle(document.documentElement)

  return {
    sales: cssVar(styles, '--color-report-chart-sales'),
    salesFill: cssVar(styles, '--color-report-chart-sales-fill'),
    grid: cssVar(styles, '--color-report-chart-grid'),
    text: cssVar(styles, '--color-report-chart-text'),
  }
}

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

function useCanvas(drawChart) {
  const canvasRef = useRef(null)
  const containerRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    let cleanup = () => {}

    if (canvas && container) {
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
        drawChart(ctx, width, height, getReportChartColors())
      }

      redraw()

      const resizeObserver = new ResizeObserver(redraw)
      resizeObserver.observe(container)
      window.addEventListener('resize', redraw)

      cleanup = () => {
        resizeObserver.disconnect()
        window.removeEventListener('resize', redraw)
      }
    }

    return cleanup
  }, [drawChart])

  return { canvasRef, containerRef }
}

function EmptyChartState() {
  return (
    <div className="flex h-80 items-center justify-center rounded-xl border border-dashed border-base-300 bg-base-100/80 text-base-400">
      Encara no hi ha dades suficients per generar aquest gràfic.
    </div>
  )
}

function drawSalesGrid(ctx, width, padding, chartHeight, maxValue, colors) {
  const stepY = maxValue / 4 || 1

  ctx.font = '12px sans-serif'
  ctx.strokeStyle = colors.grid
  ctx.fillStyle = colors.text
  ctx.lineWidth = 1
  ctx.setLineDash([4, 4])

  for (let index = 0; index <= 4; index += 1) {
    const y = padding.top + (chartHeight / 4) * index
    const value = Math.round(maxValue - stepY * index)
    ctx.beginPath()
    ctx.moveTo(padding.left, y)
    ctx.lineTo(width - padding.right, y)
    ctx.stroke()
    ctx.fillText(formatCurrency(value), 8, y + 4)
  }

  ctx.setLineDash([])
}

function drawSingleSalesPoint(ctx, item, chart, maxValue, colors) {
  const centerX = chart.padding.left + chart.width / 2
  const pointY = chart.padding.top + chart.height - (item.total / maxValue) * chart.height

  ctx.fillStyle = colors.salesFill
  drawRoundedRect(ctx, centerX - 18, pointY, 36, chart.canvasHeight - chart.padding.bottom - pointY, 12)
  ctx.fill()

  ctx.beginPath()
  ctx.fillStyle = colors.sales
  ctx.arc(centerX, pointY, 5, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = colors.text
  ctx.textAlign = 'center'
  ctx.fillText(item.label, centerX, chart.canvasHeight - 18)
}

function drawSalesSeries(ctx, data, chart, maxValue, colors) {
  const points = data.map((item, index) => {
    const x = chart.padding.left + (chart.width / (data.length - 1)) * index
    const y = chart.padding.top + chart.height - (item.total / maxValue) * chart.height
    return { ...item, x, y }
  })

  ctx.beginPath()
  ctx.moveTo(points[0].x, chart.canvasHeight - chart.padding.bottom)
  points.forEach(point => ctx.lineTo(point.x, point.y))
  ctx.lineTo(points[points.length - 1].x, chart.canvasHeight - chart.padding.bottom)
  ctx.closePath()
  ctx.fillStyle = colors.salesFill
  ctx.fill()

  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  points.slice(1).forEach(point => ctx.lineTo(point.x, point.y))
  ctx.strokeStyle = colors.sales
  ctx.lineWidth = 3
  ctx.stroke()

  points.forEach(point => {
    ctx.beginPath()
    ctx.fillStyle = colors.sales
    ctx.arc(point.x, point.y, 4, 0, Math.PI * 2)
    ctx.fill()

    ctx.fillStyle = colors.text
    ctx.textAlign = 'center'
    ctx.fillText(point.label, point.x, chart.canvasHeight - 18)
  })
}

function SalesLineChart({ data }) {
  const drawChart = useCallback((ctx, width, height, colors) => {
    const padding = { top: 24, right: 24, bottom: 48, left: 56 }
    const chart = {
      padding,
      width: width - padding.left - padding.right,
      height: height - padding.top - padding.bottom,
      canvasHeight: height,
    }
    const maxValue = Math.max(...data.map(item => item.total), 1)

    drawSalesGrid(ctx, width, padding, chart.height, maxValue, colors)

    if (data.length === 1) {
      drawSingleSalesPoint(ctx, data[0], chart, maxValue, colors)
    } else {
      drawSalesSeries(ctx, data, chart, maxValue, colors)
    }
    ctx.textAlign = 'start'
  }, [data])

  const { canvasRef, containerRef } = useCanvas(drawChart)

  return (
    <div ref={containerRef} className="w-full overflow-hidden rounded-xl bg-base-100">
      <canvas ref={canvasRef} className="block w-full" aria-label="Gràfic de vendes mensuals" />
    </div>
  )
}

function HorizontalBarChart({ data, colorName, suffix, valueFormatter }) {
  const maxValue = Math.max(...data.map(item => item.value), 1)

  return (
    <div className="flex min-h-80 flex-col justify-center gap-3">
      {data.map(item => {
        const width = `${Math.max((item.value / maxValue) * 100, 2)}%`

        return (
          <div
            key={item.id}
            className="grid grid-cols-[minmax(0,10rem)_minmax(0,1fr)_3.5rem] items-center gap-3 text-sm sm:grid-cols-[minmax(0,12rem)_minmax(0,1fr)_4rem]"
          >
            <Link
              to={`/admin/products/${item.id}/show`}
              className="truncate text-right font-medium text-base-400 transition-colors hover:text-primary"
              title={item.label}
            >
              {item.label}
            </Link>

            <div className="h-5 overflow-hidden rounded-lg bg-report-chart-bar-track">
              <div className="h-full rounded-lg transition-all duration-300 hover:opacity-90 hover:scale-105" style={{ width, background: `linear-gradient(to right, transparent, var(--color-report-chart-${colorName}))` }} />
            </div>

            <span className="text-left text-base-400">{valueFormatter ? valueFormatter(item.value) : item.value}{suffix}</span>
          </div>
        )
      })}
    </div>
  )
}

function StatCard({ icon, label, value, helper }) {
  return (
    <div className="simple-container shadow-sm hover:shadow-md transition-shadow duration-300">
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

function ChartSection({ title, description, hasData, children }) {
  return (
    <section className="simple-container">
      <div className="mb-5 flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-base-content">{title}</h2>
        <p className="text-sm text-base-400">{description}</p>
      </div>
      {hasData ? children : <EmptyChartState />}
    </section>
  )
}

function toBarData(items, valueKey) {
  return items.map(item => ({
    id: item.id,
    label: item.name,
    value: item[valueKey],
  }))
}

function getReportSections(reportData) {
  const salesByMonth = reportData?.sales_by_month ?? []
  const topProducts = reportData?.top_products ?? []
  const lowStockProducts = reportData?.low_stock_products ?? []

  return {
    summary: reportData?.summary ?? {},
    salesByMonth,
    topProductBars: toBarData(topProducts, 'quantity_sold'),
    lowStockBars: toBarData(lowStockProducts, 'stock'),
  }
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
        console.error('Error al cargar los informes', error)
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

  const { summary, salesByMonth, topProductBars, lowStockBars } = getReportSections(reportData)
  const content = loading ? (
    <LoadingAnimation heightClass="h-[calc(100vh-260px)]" />
  ) : (
    <div className="space-y-8">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-base-content">Informes</h1>
            <p className="mt-2 max-w-3xl text-base text-base-400"> Consulta l'evolució mensual de les vendes, els productes més venuts i els articles amb menys estoc.</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
        <StatCard icon={<HiArrowTrendingUp className="size-6" />} label="Facturació total" value={formatCurrency(summary.total_sales_amount)} helper={`${summary.total_units_sold || 0} unitats venudes`}/>
        <StatCard icon={<HiChartBar className="size-6" />} label="Comandes processades" value={summary.total_orders || 0} helper="Comandes amb estat pendent, enviat o confirmat"/>
        <StatCard icon={<HiCube className="size-6" />} label="Estoc baix" value={summary.low_stock_products_count || 0} helper="Productes mostrats al gràfic de baix estoc"/>
      </div>

      <ChartSection title="Vendes per període de temps" description="Volum mensual de vendes dels darrers 6 mesos." hasData={salesByMonth.length > 0}>
        <SalesLineChart data={salesByMonth} />
      </ChartSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <ChartSection title="Productes més venuts" description="Top 10 productes amb més unitats venudes." hasData={topProductBars.length > 0}>
          <HorizontalBarChart data={topProductBars} colorName="bar" suffix=" u." />
        </ChartSection>

        <ChartSection title="Stock més baix" description="Productes amb menys unitats disponibles actualment." hasData={lowStockBars.length > 0}>
          <HorizontalBarChart data={lowStockBars} colorName="stock" suffix=" u." />
        </ChartSection>
      </div>
    </div>
  )

  return content
}
