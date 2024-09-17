import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../services/userService';
import { User } from '../models/User';
import '../styles/UserManagement.css';

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [newUser, setNewUser] = useState<Omit<User, 'id'>>({
    username: '',
    name: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const usersData = await getUsers();
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users', error);
      setError('Failed to load users. Please try again later.');
    }
  };

  const handleCreateUser = async () => {
    try {
      const createdUser = await createUser(newUser);
      setUsers([...users, createdUser]);
      setNewUser({ username: '', name: '', email: '', password: '' }); // Reset form
    } catch (error) {
      console.error('Error creating user', error);
      setError('Failed to create user. Please ensure all fields are correctly filled.');
    }
  };

  const handleDeleteUser = async (id: number) => {
    try {
      await deleteUser(id);
      setUsers(users.filter(u => u.id !== id)); // update UI
    } catch (error) {
      console.error('Error deleting user', error);
      setError('Failed to delete user. Please try again.');
    }
  };

  return (
    <div className='user-container'>
      <h1>User Management</h1>
      {error && <p className="error-message">{error}</p>}

      <div className='add-user-form'>
        <h2>Add New User</h2>
        <div className="form-group">
          <input
            type="text"
            value={newUser.username}
            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
            placeholder="Username"
          />
        </div>
        <div className="form-group">
          <input
            type="text"
            value={newUser.name}
            onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
            placeholder="Name"
          />
        </div>
        <div className="form-group">
          <input
            type="email"
            value={newUser.email}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            placeholder="Email"
          />
        </div>
        <div className="form-group">
          <input
            type="password"
            value={newUser.password}
            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
            placeholder="Password"
          />
        </div>
        <button className="submit-btn" onClick={handleCreateUser}>Add User</button>
      </div>

      <div className='users-table'>
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.name}</td>
                <td className="email-column">{user.email}</td>
                <td>
                  <button className="delete-btn" onClick={() => handleDeleteUser(user.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserManagement;
