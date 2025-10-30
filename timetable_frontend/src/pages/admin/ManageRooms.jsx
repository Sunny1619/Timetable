import { useState, useEffect } from 'react';
import axios from 'axios';
import './ManageRooms.css';

const ManageRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingId, setEditingId] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    room_number: '',
    capacity: ''
  });

  // Edit form state
  const [editData, setEditData] = useState({
    room_number: '',
    capacity: ''
  });

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8000/api/rooms/', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setRooms(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch rooms');
      setLoading(false);
      console.error(err);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleEditInputChange = (e) => {
    setEditData({
      ...editData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.room_number || !formData.capacity) {
      setError('Please fill in all fields');
      return;
    }

    if (parseInt(formData.capacity) <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8000/api/rooms/',
        {
          room_number: formData.room_number,
          capacity: parseInt(formData.capacity)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Room added successfully!');
      setFormData({ room_number: '', capacity: '' });
      fetchRooms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add room');
      console.error(err);
    }
  };

  const handleEdit = (room) => {
    setEditingId(room.id);
    setEditData({
      room_number: room.room_number,
      capacity: room.capacity
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditData({ room_number: '', capacity: '' });
  };

  const handleUpdate = async (id) => {
    setError('');
    setSuccess('');

    if (!editData.room_number || !editData.capacity) {
      setError('Please fill in all fields');
      return;
    }

    if (parseInt(editData.capacity) <= 0) {
      setError('Capacity must be greater than 0');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:8000/api/rooms/${id}/`,
        {
          room_number: editData.room_number,
          capacity: parseInt(editData.capacity)
        },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );
      
      setSuccess('Room updated successfully!');
      setEditingId(null);
      fetchRooms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update room');
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this room?')) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8000/api/rooms/${id}/`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setSuccess('Room deleted successfully!');
      fetchRooms();
      
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete room');
      console.error(err);
    }
  };

  if (loading) {
    return <div className="manage-rooms-container"><div className="loading">Loading...</div></div>;
  }

  return (
    <div className="manage-rooms-container">
      <div className="manage-rooms-header">
        <h1>Manage Rooms</h1>
        <p>Add, edit, or remove rooms from the system</p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="add-room-section">
        <h2>Add New Room</h2>
        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-group">
            <label htmlFor="room_number">Room Number</label>
            <input
              type="text"
              id="room_number"
              name="room_number"
              value={formData.room_number}
              onChange={handleInputChange}
              placeholder="e.g., 101, Lab-A, Room-201"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="capacity">Capacity</label>
            <input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleInputChange}
              placeholder="e.g., 30"
              min="1"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary">Add Room</button>
        </form>
      </div>

      <div className="rooms-list-section">
        <h2>Existing Rooms</h2>
        {rooms.length === 0 ? (
          <p className="no-data">No rooms found. Add your first room above.</p>
        ) : (
          <div className="rooms-table-container">
            <table className="rooms-table">
              <thead>
                <tr>
                  <th>Room Number</th>
                  <th>Capacity</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map((room) => (
                  <tr key={room.id}>
                    <td>
                      {editingId === room.id ? (
                        <input
                          type="text"
                          name="room_number"
                          value={editData.room_number}
                          onChange={handleEditInputChange}
                          className="edit-input"
                        />
                      ) : (
                        room.room_number
                      )}
                    </td>
                    <td>
                      {editingId === room.id ? (
                        <input
                          type="number"
                          name="capacity"
                          value={editData.capacity}
                          onChange={handleEditInputChange}
                          className="edit-input"
                          min="1"
                        />
                      ) : (
                        room.capacity
                      )}
                    </td>
                    <td>
                      {editingId === room.id ? (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleUpdate(room.id)}
                            className="btn btn-save"
                          >
                            Save
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="btn btn-cancel"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="action-buttons">
                          <button
                            onClick={() => handleEdit(room)}
                            className="btn btn-edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            className="btn btn-delete"
                          >
                            Delete
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageRooms;
