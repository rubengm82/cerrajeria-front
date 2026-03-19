import { Outlet } from 'react-router-dom'
import TopBarShop from './TopBarShop'

export default function LayoutShop() {
  return (
    <div className="min-h-screen bg-base-200">
      <div className="sticky top-0 z-50">
        <TopBarShop />
      </div>
      <main>
        <Outlet />
      </main>
    </div>
  )
}
