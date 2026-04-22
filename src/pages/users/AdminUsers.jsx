import { useEffect, useState } from 'react'
import { getUsers, updateUser, deleteUser } from '../../api/users_api'
import LoadingAnimation from '../../components/LoadingAnimation'
import ConfirmableModal from '../../components/ConfirmableModal'
import Notifications from '../../components/Notifications'
import SearchBarTableSimple from '../../components/SearchBarTableSimple'
import { HiOutlineUser, HiTrash } from 'react-icons/hi2'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [notification, setNotification] = useState(null)

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

  const handleRoleChange = (user) => {
    const newRole = (user.role === 1 || user.role === 'admin') ? 'user' : 'admin'
    const newRoleName = newRole === 'admin' ? 'Admin' : 'Usuari'

    updateUser(user.id, { role: newRole })
      .then(() => {
        getUsers()
          .then(response => setUsers(response.data))
        setNotification({ id: Date.now(), type: "success", message: `Rol canviat a ${newRoleName} correctament`})
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: `No s'ha pogut canviar el rol a ${newRoleName}`})
      })
  }

  const handleDelete = (user) => {
    deleteUser(user.id)
      .then(() => {
        getUsers()
          .then(response => setUsers(response.data))
        setNotification({ id: Date.now(), type: "success", message: `Usuari eliminat correctament`})
      })
      .catch(err => {
        console.error(err)
        setNotification({ id: Date.now(), type: "error", message: `No s'ha pogut eliminar l'usuari`})
      })
  }

  return loading
    ? <LoadingAnimation />
    : (
    <div>
      {notification && (
        <Notifications key={notification.id} type={notification.type} message={notification.message} onClose={() => setNotification(null)}/>
      )}
      <div className='w-full flex flex-row justify-between mb-5'>
        <h1 className='text-2xl font-bold text-base-content'>Usuaris</h1>
        <div className='badge badge-lg badge-primary badge-outline gap-2'>
          <HiOutlineUser className="size-4" />
          <span>{users.length} usuari{users.length !== 1 ? 's' : ''}</span>
        </div>
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
                        <th>Accions</th>
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
                       <td className='border-base-300'>{user.shipping_address || ''}</td>
                       <td className='border-base-300'>{user.shipping_zip_code || ''}</td>
                      <td className='border-base-300'>
                        <ConfirmableModal
                          title="Canviar rol de l'usuari"
                          message={`Segur que vols canviar el rol de l'usuari "${user.name}" de ${user.role === 1 || user.role === 'admin' ? 'Admin' : 'Usuari'} a ${user.role === 1 || user.role === 'admin' ? 'Usuari' : 'Admin'}?`}
                          onConfirm={() => handleRoleChange(user)}
                        >
                          <p className={`p-1 text-center border rounded-lg w-20 font-medium cursor-pointer hover:opacity-80 transition-opacity ${user.role === 1 || user.role === 'admin' ? "bg-success text-success-content" : "bg-info text-info-content"}`}>
                            {user.role === 1 || user.role === 'admin' ? 'Admin' : 'Usuari'}
                          </p>
                        </ConfirmableModal>
                      </td>
                      <td className='border-base-300'>
                        <div className='flex items-center gap-2'>
                          <ConfirmableModal
                            title="Eliminar usuari"
                            message={`Segur que vols eliminar l'usuari "${user.name}"? Aquesta acció no es pot desfer.`}
                            onConfirm={() => handleDelete(user)}
                          >
                            <button className="text-base-400 hover:text-error-content transition-colors cursor-pointer">
                              <HiTrash className="size-6" />
                            </button>
                          </ConfirmableModal>
                        </div>
                      </td>
                    </tr>
                  )) :
                    <tr>
                      <td colSpan={11} className='p-6'>
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
