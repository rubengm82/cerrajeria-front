function AdminDashboard() {
  const statusStyle = {
    Completado: "bg-success text-success-content border-success-content",
    En_proceso: "bg-warning text-warning-content border-warning-content",
    Enviado: "bg-info text-info-content border-info-content",
    Cancelado: "bg-error text-error-content border-error-content",
  }
  return (
    <div className="p-4 md:p-0">
      {/* Contenedores superiores */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Ventas este mes</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 md:size-9 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.25 7.756a4.5 4.5 0 1 0 0 8.488M7.5 10.5h5.25m-5.25 3h5.25M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">120€</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">12%</span> mas que el mes anterior</p>
        </div>
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Pedidos</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 md:size-9 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">214</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">31%</span> mas que el mes anterior</p>
        </div>
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Productos</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-7 md:size-9 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path>
              </svg>
            </div>
        </div>
          <p className="text-2xl md:text-3xl font-bold">14</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">6</span> nuevos desde el mes anterior</p>
        </div>
        {/* Contenedor */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Clientes</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-7 md:size-9 text-primary">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" />
              </svg>
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">34</p>
          <p className="mt-2 text-sm md:text-base"><span className="text-success-content font-semibold">2</span> mas que el mes anterior</p>
        </div>
      </div>
      <div className="flex flex-col lg:flex-row items-start gap-10 mt-10">
        {/* Contenedor izquierda */}
        <div className="w-full lg:w-[60%]">
          <h3 className='text-2xl font-bold text-base-content mb-3'>Pedidos recientes</h3>
          {/* Tabla */}
          <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
            <table className="table">
              <thead>
                <tr className='text-neutral'>
                  <th>Pedido</th>
                  <th>Cliente</th>
                  <th>Fecha</th>
                  <th>Total</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>12 Dic 2025</td>
                  <td className='border-base-300 font-semibold'>1220€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Completado"]}`}>Completado</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#2</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>12 Dic 2025</td>
                  <td className='border-base-300 font-semibold'>1220€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Completado"]}`}>Completado</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#3</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>12 Dic 2025</td>
                  <td className='border-base-300 font-semibold'>1220€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Completado"]}`}>Completado</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#4</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>18 May 2025</td>
                  <td className='border-base-300 font-semibold'>521€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["En_proceso"]}`}>En proceso</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#5</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>18 May 2025</td>
                  <td className='border-base-300 font-semibold'>521€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["En_proceso"]}`}>En proceso</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#6</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>3 Abr 2025</td>
                  <td className='border-base-300 font-semibold'>251€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Enviado"]}`}>Enviado</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#7</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>14 Abr 2025</td>
                  <td className='border-base-300 font-semibold'>6251€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Cancelado"]}`}>Cancelado</p>
                  </td>
                </tr>
                <tr className='hover:bg-[#F9F6F5]'>
                  <td className='border-base-300 font-semibold'>#8</td>
                  <td className='border-base-300 text-base-400 font-semibold'>Cliente 1</td>
                  <td className='border-base-300 text-base-400 font-semibold'>14 Abr 2025</td>
                  <td className='border-base-300 font-semibold'>6251€</td>
                  <td className='border-base-300 font-semibold text-center'>
                    <p className={`min-w-24 md:w-26 border rounded-lg py-1 ${statusStyle["Cancelado"]}`}>Cancelado</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        {/* Contenedor derecha */}
        <div className="w-full lg:w-[40%]">
          {/* Productos mas vendidos */}
          <h3 className='text-[20px] font-bold text-base-content mb-3'>Productos mas vendidos</h3>
          <div className="simple-container flex flex-col gap-3">
            {/* Producto */}
            <div className="flex flex-row items-center justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-3 md:gap-5">
                  <p className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 p-2 font-bold text-xl md:text-2xl shrink-0">1</p>
                  <div className="min-w-0">
                    <p className="font-semibold truncate">Bombin numero 7</p>
                    <p className="text-sm text-base-400">120 vendidos</p>
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
                    <p className="font-semibold truncate">Bombin numero 8</p>
                    <p className="text-sm text-base-400">120 vendidos</p>
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
                    <p className="font-semibold truncate">Bombin numero 8</p>
                    <p className="text-sm text-base-400">120 vendidos</p>
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
                    <p className="font-semibold truncate">Bombin numero 8</p>
                    <p className="text-sm text-base-400">120 vendidos</p>
                  </div>
                </div>
              </div>
              <p className="text-[18px] md:text-[20px] font-bold shrink-0">1275€</p>
            </div>
          </div>
          {/* Poco stock */}
          <h3 className='text-[20px] font-bold text-base-content mt-8 mb-3'>Poco stock</h3>
          <div className="simple-container flex flex-col gap-5">
            {/* Elemento */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 md:size-7"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path></svg>
                </div>
                <p className="font-semibold truncate">Bombin numero 5</p>
              </div>
              <p className="text-primary font-semibold text-base md:text-lg shrink-0">2 uds</p>
            </div>
            {/* Elemento */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 md:size-7"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path></svg>
                </div>
                <p className="font-semibold truncate">Bombin numero 4</p>
              </div>
              <p className="text-primary font-semibold text-base md:text-lg shrink-0">1 uds</p>
            </div>
            {/* Elemento */}
            <div className="w-full flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 md:gap-5 min-w-0">
                <div className="bg-primary/20 text-primary flex items-center justify-center rounded-lg w-8 h-8 md:w-10 md:h-10 shrink-0">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-5 md:size-7"><path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z"></path></svg>
                </div>
                <p className="font-semibold truncate">Bombin numero 3</p>
              </div>
              <p className="text-primary font-semibold text-base md:text-lg shrink-0">4 uds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard