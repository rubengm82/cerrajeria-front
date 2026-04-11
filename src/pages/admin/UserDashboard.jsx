import { HiShoppingCart, HiWrenchScrewdriver, HiTruck, HiCube } from 'react-icons/hi2'

function UserDashboard() {
  return (
    <div className="p-4 md:p-0">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-base-content mb-2">El Meu Tauler</h1>
        <p className="text-base-400">Benvingut/da al teu panell personal</p>
      </div>

      {/* Contenedores superiores para usuarios */}
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Mis Órdenes */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Les Meves Comandes</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <HiShoppingCart className="size-7 md:size-9 text-primary" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">3</p>
          <p className="mt-2 text-sm md:text-base">Comandes realitzades</p>
        </div>

        {/* Servicios */}
        <div className="simple-container">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Serveis Contractats</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-primary/20 rounded-lg shrink-0">
              <HiWrenchScrewdriver className="size-7 md:size-9 text-primary" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">1</p>
          <p className="mt-2 text-sm md:text-base">Servei actiu</p>
        </div>

        {/* Espacios vacíos para mantener el diseño */}
        <div className="simple-container opacity-50">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Propers</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-base-200 rounded-lg shrink-0">
              <HiTruck className="size-7 md:size-9 text-base-400" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">0</p>
          <p className="mt-2 text-sm md:text-base">Funcionalitats</p>
        </div>

        <div className="simple-container opacity-50">
          <div className="flex items-start justify-between">
            <p className="text-base-400 font-semibold text-[18px] md:text-[20px]">Més</p>
            <div className="w-12 h-12 md:w-14 md:h-14 p-2 flex items-center justify-center bg-base-200 rounded-lg shrink-0">
              <HiCube className="size-7 md:size-9 text-base-400" aria-hidden="true" />
            </div>
          </div>
          <p className="text-2xl md:text-3xl font-bold">-</p>
          <p className="mt-2 text-sm md:text-base">Properament</p>
        </div>
      </div>

    </div>
  )
}

export default UserDashboard
