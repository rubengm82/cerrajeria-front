import { useEffect, useState } from 'react'
import { getUsers } from '../../api/users_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import SearchBarTableSimple from '../../components/SearchBarTableSimple'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  // Obtencion de los usuarios de la APP
  useEffect(() => {
    getUsers()
      .then(response => setUsers(response.data))
      .catch(err => {
        console.error(err)
        setUsers([])
      })
      .finally(() => setLoading(false))
  }, [])

  return loading
    ? <LoadingAnimation />
    : (
    <div>
      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Usuaris</h1>
      </div>

      <SearchBarTableSimple
        data={users}
        searchFields={['name', 'last_name_one', 'last_name_second', 'dni', 'phone', 'email', 'address', 'zip_code']}
        placeholder='Buscar usuari...'
        inputClassName='flex flex-col md:flex-row gap-4 w-full mb-5 input'
      >
        {(filteredUsers) => (
          <>
            {/* Tabla de usuarios */}
            <div className="overflow-x-auto border border-base-300 bg-base-100 rounded-lg shadow-md">
              <table className="table">
                <thead>
                    <tr className='text-neutral'>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>1r Cognom</th>
                        <th>2n Cognom</th>
                        <th>DNI</th>
                        <th>Telèfon</th>
                        <th>Correu</th>
                        <th>Adreça</th>
                        <th>Codi Postal</th>
                        <th>Rol</th>
                    </tr>
                </thead>
                <tbody>
                  {filteredUsers.length > 0 ? filteredUsers.map((user) => (
                    <tr key={user.id} className='hover:bg-[#F9F6F5]'>
                      <td className='border-base-300'>{user.id}</td>
                      <td className='border-base-300'>{user.name || ''}</td>
                      <td className='border-base-300'>{user.last_name_one || ''}</td>
                      <td className='border-base-300'>{user.last_name_second || ''}</td>
                      <td className='border-base-300'>{user.dni || ''}</td>
                      <td className='border-base-300'>{user.phone || ''}</td>
                      <td className='border-base-300'>{user.email}</td>
                      <td className='border-base-300'>{user.address || ''}</td>
                      <td className='border-base-300'>{user.zip_code || ''}</td>
                      <td className='border-base-300'>
                        <p className={`p-1 text-center border rounded-lg w-20 font-medium ${user.role === 1 || user.role === 'admin' ? "bg-success text-success-content" : "bg-info text-info-content"}`}>
                          {user.role === 1 || user.role === 'admin' ? 'Admin' : 'Usuari'}
                        </p>
                      </td>
                    </tr>
                  )) :
                    <tr>
                      <td colSpan={10} className='p-6'>
                        <div className='w-full flex justify-center items-center gap-2'>
                          <p>No s'ha trobat cap usuari</p>
                        </div>
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </>
        )}
      </SearchBarTableSimple>
    </div>
  )
}

export default AdminUsers
