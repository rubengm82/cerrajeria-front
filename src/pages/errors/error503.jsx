import { Link } from 'react-router-dom'
import { useEffect, useRef, useState, useCallback } from 'react'
import { RiKeyFill } from 'react-icons/ri'

const GRID = 20

function SnakeGame() {
  const canvasRef = useRef(null)
  const stateRef = useRef({
    snake: [],
    dir: { x: 1, y: 0 },
    nextDir: { x: 1, y: 0 },
    food: { x: 14, y: 10 },
    loop: null,
    status: 'idle',
    score: 0,
  })
  const [score, setScore] = useState(0)
  const [hiScore, setHiScore] = useState(() => parseInt(localStorage.getItem('snakeHighScore503') || '0'))
  const [status, setStatus] = useState('idle')

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const CELL = canvas.width / GRID
    const { snake, dir, food, status: s, score: sc } = stateRef.current

    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.strokeStyle = '#16213e'
    ctx.lineWidth = 1
    for (let i = 0; i <= GRID; i++) {
      ctx.beginPath(); ctx.moveTo(i * CELL, 0); ctx.lineTo(i * CELL, canvas.height); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(0, i * CELL); ctx.lineTo(canvas.width, i * CELL); ctx.stroke()
    }

    snake.forEach((seg, i) => {
      const t = i / snake.length
      ctx.fillStyle = i === 0 ? '#4ade80' : `rgb(30,${Math.floor(180 - t * 80)},50)`
      ctx.beginPath()
      ctx.roundRect(seg.x * CELL + 1, seg.y * CELL + 1, CELL - 2, CELL - 2, i === 0 ? 4 : 2)
      ctx.fill()

      if (i === 0) {
        ctx.fillStyle = '#1a1a2e'
        const cx = seg.x * CELL + CELL / 2
        const cy = seg.y * CELL + CELL / 2
        const off = CELL * 0.18
        if (dir.x !== 0) {
          ctx.beginPath(); ctx.arc(cx + dir.x * off, cy - 2, 2, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(cx + dir.x * off, cy + 2, 2, 0, Math.PI * 2); ctx.fill()
        } else {
          ctx.beginPath(); ctx.arc(cx - 2, cy + dir.y * off, 2, 0, Math.PI * 2); ctx.fill()
          ctx.beginPath(); ctx.arc(cx + 2, cy + dir.y * off, 2, 0, Math.PI * 2); ctx.fill()
        }
      }
    })

    const pulse = 0.7 + 0.3 * Math.sin(Date.now() / 200)
    ctx.fillStyle = `rgba(239,68,68,${pulse})`
    ctx.beginPath()
    ctx.arc(food.x * CELL + CELL / 2, food.y * CELL + CELL / 2, CELL * 0.32, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = 'rgba(255,180,180,0.9)'
    ctx.beginPath()
    ctx.arc(food.x * CELL + CELL / 2 - 2, food.y * CELL + CELL / 2 - 2, CELL * 0.1, 0, Math.PI * 2)
    ctx.fill()

    if (s === 'over') {
      ctx.fillStyle = 'rgba(0,0,0,0.8)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#ffbe3c'
      ctx.font = 'bold 20px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 20)
      ctx.fillStyle = '#fff'
      ctx.font = '14px system-ui'
      ctx.fillText(`Punts: ${sc}`, canvas.width / 2, canvas.height / 2 + 10)
      if (sc >= parseInt(localStorage.getItem('snakeHighScore503') || '0') && sc > 0) {
        ctx.fillStyle = '#eb6400'
        ctx.font = 'bold 12px system-ui'
        ctx.fillText('NOU RÈCORD!', canvas.width / 2, canvas.height / 2 + 30)
      }
    }

    if (s === 'idle') {
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.fillStyle = '#4ade80'
      ctx.font = 'bold 22px system-ui'
      ctx.textAlign = 'center'
      ctx.fillText('SNAKE', canvas.width / 2, canvas.height / 2 - 12)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '13px system-ui'
      ctx.fillText('Prem una tecla per començar', canvas.width / 2, canvas.height / 2 + 14)
    }
  }, [])

  const placeFood = useCallback(() => {
    const { snake } = stateRef.current
    let p
    do {
      p = { x: Math.floor(Math.random() * GRID), y: Math.floor(Math.random() * GRID) }
    } while (snake.some(s => s.x === p.x && s.y === p.y))
    stateRef.current.food = p
  }, [])

  const startGame = useCallback(() => {
    const s = stateRef.current
    if (s.loop) clearInterval(s.loop)
    s.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]
    s.dir = { x: 1, y: 0 }
    s.nextDir = { x: 1, y: 0 }
    s.score = 0
    s.status = 'playing'
    setScore(0)
    setStatus('playing')
    placeFood()

    s.loop = setInterval(() => {
      const st = stateRef.current
      st.dir = st.nextDir
      const head = { x: st.snake[0].x + st.dir.x, y: st.snake[0].y + st.dir.y }

      if (
        head.x < 0 || head.x >= GRID ||
        head.y < 0 || head.y >= GRID ||
        st.snake.some(seg => seg.x === head.x && seg.y === head.y)
      ) {
        clearInterval(st.loop)
        st.status = 'over'
        setStatus('over')
        if (st.score > parseInt(localStorage.getItem('snakeHighScore503') || '0')) {
          localStorage.setItem('snakeHighScore503', st.score.toString())
          setHiScore(st.score)
        }
        draw()
        return
      }

      st.snake.unshift(head)
      if (head.x === st.food.x && head.y === st.food.y) {
        st.score++
        setScore(st.score)
        placeFood()
      } else {
        st.snake.pop()
      }
      draw()
    }, 120)
  }, [draw, placeFood])

  useEffect(() => {
    stateRef.current.snake = [{ x: 10, y: 10 }]
    stateRef.current.food = { x: 14, y: 10 }
    draw()

    const handleKey = (e) => {
      const validKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'w', 'a', 's', 'd', 'W', 'A', 'S', 'D']
      if (!validKeys.includes(e.key)) return
      e.preventDefault()

      const st = stateRef.current
      if (st.status === 'idle' || st.status === 'over') {
        startGame()
        return
      }

      switch (e.key) {
        case 'ArrowUp': case 'w': case 'W':
          if (st.dir.y !== 1) st.nextDir = { x: 0, y: -1 }; break
        case 'ArrowDown': case 's': case 'S':
          if (st.dir.y !== -1) st.nextDir = { x: 0, y: 1 }; break
        case 'ArrowLeft': case 'a': case 'A':
          if (st.dir.x !== 1) st.nextDir = { x: -1, y: 0 }; break
        case 'ArrowRight': case 'd': case 'D':
          if (st.dir.x !== -1) st.nextDir = { x: 1, y: 0 }; break
      }
    }

    const loop = stateRef.current.loop
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      if (loop) clearInterval(loop)
    }
  }, [draw, startGame])

return (
    <div className="hidden md:flex flex-col items-center gap-4 min-h-100 justify-center">
      <div className="rounded-2xl overflow-hidden border-2 border-orange-500/40 shadow-2xl shadow-orange-500/20 ring-4 ring-orange-500/10">
        <canvas
          ref={canvasRef}
          width={320}
          height={320}
          className="block bg-gray-900 cursor-pointer"
          onClick={() => {
            if (stateRef.current.status === 'idle' || stateRef.current.status === 'over') startGame()
          }}
        />
      </div>

      {status === 'idle' && (
        <button
          onClick={startGame}
          className="btn btn-outline btn-primary btn-lg gap-2"
        >
          <span className="text-lg">Començar a jugar</span>
        </button>
      )}

      {status === 'playing' && (
        <div className="flex gap-8 text-base min-h-12 items-center">
          <div className="flex items-center gap-2">
            <RiKeyFill className="text-orange-500" />
            <span className="text-base-content/60">Punts:</span>
            <span className="font-bold text-orange-500 text-xl">{score}</span>
          </div>
          <div className="flex items-center gap-2">
            <RiKeyFill className="text-orange-500" />
            <span className="text-base-content/60">Rècord:</span>
            <span className="font-bold text-orange-500 text-xl">{hiScore}</span>
          </div>
        </div>
      )}

      {status === 'over' && (
        <div className="flex flex-col items-center gap-3 min-h-12 justify-center">
          <button
            onClick={startGame}
            className="btn btn-outline btn-primary btn-lg gap-2"
          >
            Tornar a jugar
          </button>
        </div>
      )}

      <div className="flex items-center gap-4 text-sm text-base-content/40">
        <span className="flex items-center gap-1">
          <kbd className="kbd kbd-sm">W</kbd>
          <kbd className="kbd kbd-sm">A</kbd>
          <kbd className="kbd kbd-sm">S</kbd>
          <kbd className="kbd kbd-sm">D</kbd>
        </span>
        <span>o</span>
        <span className="flex items-center gap-1">
          <kbd className="kbd kbd-sm">↑</kbd>
          <kbd className="kbd kbd-sm">←</kbd>
          <kbd className="kbd kbd-sm">↓</kbd>
          <kbd className="kbd kbd-sm">→</kbd>
        </span>
      </div>
    </div>
  )
}

function Error503() {
  const [isKeyboardDevice] = useState(() => {
    const ua = navigator.userAgent
    const hasTouchScreen = navigator.maxTouchPoints > 0
    const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)
    return !isMobileUA && !hasTouchScreen
  })

  return (
    <div className="min-h-screen bg-linear-to-br from-base-200 via-base-300 to-base-200 flex items-center justify-center p-4">
      <div className="text-center max-w-2xl">
        <div className="relative mb-8">
          <div className="text-[10rem] sm:text-[12rem] font-black leading-none select-none">
            <span className="absolute inset-0 text-transparent bg-clip-text bg-linear-to-br from-primary/20 to-primary/5 transform rotate-3">503</span>
            <span className="relative text-transparent bg-clip-text bg-linear-to-br from-primary via-primary to-primary/80">503</span>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
            <div className="absolute inset-4 rounded-full bg-primary/20"></div>
            <div className="absolute inset-8 rounded-full bg-primary/30 flex items-center justify-center">
              <svg className="w-6 h-6 sm:w-8 sm:h-8 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-6">
          <h2 className="text-3xl sm:text-4xl font-bold text-base-content">Servei no disponible</h2>
          <p className="text-base-content/60 text-lg">El servei està temporalment fora de servei. Mentrestant, pots jugar una mica...</p>
        </div>

        <div className="flex justify-center mb-8">
          {isKeyboardDevice && <SnakeGame />}
        </div>

        <Link
          to="/"
          className="btn btn-primary btn-lg gap-2 shadow-lg shadow-primary/25"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
          </svg>
          Tornar a l'inici
        </Link>
      </div>
    </div>
  )
}

export default Error503