import { HiCurrencyEuro, HiTruck, HiCube, HiUsers } from 'react-icons/hi2'

function AdminDashboard() {
  const statusStyle = {
    Completat: "bg-success text-success-content border-success-content",
    En_proces: "bg-warning text-warning-content border-warning-content",
    Enviat: "bg-info text-info-content border-info-content",
    Cancelat: "bg-error text-error-content border-error-content",
  }
  return (
    <div className="p-4 md:p-0">
      {/* Contenedores superiores */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Vendes aquest mes</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <HiCurrencyEuro className="size-7 md:size-9 text-primary" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">120€</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">12%</span> més que el mes anterior</p>
        </div>
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Comandes</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <HiTruck className="size-7 md:size-9 text-primary" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">214</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">31%</span> més que el mes anterior</p>
        </div>
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Productes</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <HiCube className="size-7 md:size-9 text-primary" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">14</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">6</span> nous des del mes anterior</p>
        </div>
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Clients</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <HiUsers className="size-7 md:size-9 text-primary" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">34</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">2</span> més que el mes anterior</p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-start gap-10 mt-10">
        {/* Contenedor izquierda */}
        <div className="w-full lg:w-[60%]">
          <h3 className='text-2xl font-bold text-base-content mb-3'>Comandes recents</h3>
          {/* Tabla */}
          <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
            <table className="table">
              <thead>
                <tr className='text-neutral'>
                  <th>Comanda</th>
                  <th>Client</th>
                  <th>Data</th>
                  <th>Total</th>
                  <th>Estat</th>
                </tr>
              </thead>
              <tbody>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>12 des. 2025</td>
                  <td className='border-base-300 font-semibold'>1220€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Completat"]}`}>Completat</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#2</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>12 des. 2025</td>
                  <td className='border-base-300 font-semibold'>1220€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Completat"]}`}>Completat</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#3</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>12 des. 2025</td>
                  <td className='border-base-300 font-semibold'>1220€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Completat"]}`}>Completat</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#4</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>18 Mai 2025</td>
                  <td className='border-base-300 font-semibold'>521€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["En_proces"]}`}>En procés</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#5</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>18 Mai 2025</td>
                  <td className='border-base-300 font-semibold'>521€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["En_proces"]}`}>En procés</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#6</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>3 Abr 2025</td>
                  <td className='border-base-300 font-semibold'>251€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Enviat"]}`}>Enviat</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#7</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>14 Abr 2025</td>
                  <td className='border-base-300 font-semibold'>6251€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Cancelat"]}`}>Cancel·lat</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#8</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Client 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>14 Abr 2025</td>
                  <td className='border-base-300 font-semibold'>6251€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Cancelat"]}`}>Cancel·lat</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Contenedor derecha */}
        <div className="w-full lg:w-[40%]">
          {/* Productos mas vendidos */}
          <h3 className='text-[20px] font-bold text-base-content mb-3'>Productes més venuts</h3>
          <div className="simple-container flex flex-col gap-3">
            {/* Producto */}
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-3 md:gap-5">
                  <p className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 p-2 font-bold text-xl md:text-2xl shrink-0">1</p>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Bombí nombre 7</p>
                    <p className="text-sm text-base-400">120 venuts</p>
                  </div>
                </div>
              </div>
              <p className="text-[18px] md:text-[20px] font-bold shrink-0">1275€</p>
            </div>
            {/* Producto */}
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-3 md:gap-5">
                  <p className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 p-2 font-bold text-xl md:text-2xl shrink-0">2</p>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Bombí nombre 8</p>
                    <p className="text-sm text-base-400">120 venuts</p>
                  </div>
                </div>
              </div>
              <p className="text-[18px] md:text-[20px] font-bold shrink-0">1275€</p>
            </div>
            {/* Producto */}
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-3 md:gap-5">
                  <p className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 p-2 font-bold text-xl md:text-2xl shrink-0">3</p>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Bombí nombre 8</p>
                    <p className="text-sm text-base-400">120 venuts</p>
                  </div>
                </div>
              </div>
              <p className="text-[18px] md:text-[20px] font-bold shrink-0">1275€</p>
            </div>
            {/* Producto */}
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-3 md:gap-5">
                  <p className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 p-2 font-bold text-xl md:text-2xl shrink-0">4</p>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Bombí nombre 8</p>
                    <p className="text-sm text-base-400">120 venuts</p>
                  </div>
                </div>
              </div>
              <p className="text-[18px] md:text-[20px] font-bold shrink-0">1275€</p>
            </div>
          </div>
          {/* Poco stock */}
          <h3 className='text-[20px] font-bold text-base-content mt-8 mb-3'>Poc estoc</h3>
          <div className="simple-container flex flex-col gap-5">
            {/* Elemento */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <HiCube className="size-5 md:size-7"/>
                </div>
                <p className="font-semibold truncate">Bombí nombre 5</p>
              </div>
              <p className="text-primary font-semibold text-base md:text-lg shrink-0">2 u.</p>
            </div>
            {/* Elemento */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <HiCube className="size-5 md:size-7"/>
                </div>
                <p className="font-semibold truncate">Bombí nombre 4</p>
              </div>
              <p className="text-primary font-semibold text-base md:text-lg shrink-0">1 u.</p>
            </div>
            {/* Elemento */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <HiCube className="size-5 md:size-7"/>
                </div>
                <p className="font-semibold truncate">Bombí nombre 3</p>
              </div>
              <p className="text-primary font-semibold text-base md:text-lg shrink-0">4 u.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
