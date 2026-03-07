import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getUsers } from '../api/users_api'

function UsersList() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

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
    ? <div className="flex items-center justify-center min-h-screen">Carregant usuaris...</div>
    : (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Usuaris</h1>
        <button className="btn btn-secondary" onClick={() => navigate('/')}>
          Tornar
        </button>
      </div>

      <table className="table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nom</th>
            <th>Email</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id}>
              <td>{user.id}</td>
              <td>{user.name}</td>
              <td>{user.email}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default UsersList
