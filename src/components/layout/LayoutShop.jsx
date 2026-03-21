import { Outlet } from 'react-router-dom'
import TopBarShop from './TopBarShop'

export default function LayoutShop() {
  return (
    <div className="shop-layout bg-base-200">
      <div className="shop-layout__top">
        <TopBarShop />
      </div>
      <main className="shop-layout__main">
        <Outlet />
      </main>
    </div>
  )
}
