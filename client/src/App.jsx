import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import StudentsInt from './students';
import AdminsInt from './admins';

const App = () => {
  const [students, setStudents] = useState([]);
  const [admins, setAdmins] = useState([]);

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/student/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error('Error fetching students:', error);
    }
  };

  const fetchAdmins = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/admin/');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchAdmins();
  }, []);

  const [newStudent, setNewStudent] = useState({
    gmail: '',
    password: ''
  });

  const handleStudentInputChangePost = (e) => {
    const { name, value } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/student/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudent)
      });
      if (!response.ok) {
        throw new Error('Failed to add student');
      }
      await fetchStudents();
      setNewStudent({ gmail: '', password: '' });
    } catch (error) {
      console.error('Error adding student:', error);
    }
  };

  const [deleteStudentId, setDeleteStudentId] = useState('');

  const handleDeleteStudentChange = (e) => {
    setDeleteStudentId(e.target.value);
  };

  const handleDeleteStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/student/${deleteStudentId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete student');
      }
      await fetchStudents();
      setDeleteStudentId('');
    } catch (error) {
      console.error('Error deleting student:', error);
    }
  };

  const [newStudentPatch, setNewStudentPatch] = useState({
    id: '',
    gmail: '',
    password: ''
  });

  const handleStudentInputChangePatch = (e) => {
    const { name, value } = e.target;
    setNewStudentPatch((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateStudentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/student/${newStudentPatch.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newStudentPatch)
      });
      if (!response.ok) {
        throw new Error('Failed to update student');
      }
      await fetchStudents();
      setNewStudentPatch({ id: '', gmail: '', password: '' });
    } catch (error) {
      console.error('Error updating student:', error);
    }
  };

  const [newAdmin, setNewAdmin] = useState({
    username: '',
    password: ''
  });

  const handleAdminInputChangePost = (e) => {
    const { name, value } = e.target;
    setNewAdmin((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:3000/api/admin/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdmin)
      });
      if (!response.ok) {
        throw new Error('Failed to add admin');
      }
      await fetchAdmins();
      setNewAdmin({ username: '', password: '' });
    } catch (error) {
      console.error('Error adding admin:', error);
    }
  };

  const [deleteAdminId, setDeleteAdminId] = useState('');

  const handleDeleteAdminChange = (e) => {
    setDeleteAdminId(e.target.value);
  };

  const handleDeleteAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/admin/${deleteAdminId}`, {
        method: 'DELETE'
      });
      if (!response.ok) {
        throw new Error('Failed to delete admin');
      }
      await fetchAdmins();
      setDeleteAdminId('');
    } catch (error) {
      console.error('Error deleting admin:', error);
    }
  };

  const [newAdminPatch, setNewAdminPatch] = useState({
    username: '',
    password: ''
  });

  const handleAdminInputChangePatch = (e) => {
    const { name, value } = e.target;
    setNewAdminPatch((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateAdminSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:3000/api/admin/${newAdminPatch.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newAdminPatch)
      });
      if (!response.ok) {
        throw new Error('Failed to update admin');
      }
      await fetchAdmins();
      setNewAdminPatch({ id: '', username: '', password: '' });
    } catch (error) {
      console.error('Error updating admin:', error);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-6">
          <StudentsInt
            students={students}
            newStudent={newStudent}
            handleInputChangePost={handleStudentInputChangePost}
            handleAddStudent={handleAddStudentSubmit}
            handleInputChangePatch={handleStudentInputChangePatch}
            handleUpdateSubmit={handleUpdateStudentSubmit}
            deleteId={deleteStudentId}
            handleDeleteChange={handleDeleteStudentChange}
            handleDeleteSubmit={handleDeleteStudentSubmit}
            newStudentPatch={newStudentPatch}
          />
        </div>
        <div className="col-md-6">
          <AdminsInt
            admins={admins}
            newAdmin={newAdmin}
            handleInputChangePost={handleAdminInputChangePost}
            handleAddAdmin={handleAddAdminSubmit}
            handleInputChangePatch={handleAdminInputChangePatch}
            handleUpdateSubmit={handleUpdateAdminSubmit}
            deleteId={deleteAdminId}
            handleDeleteChange={handleDeleteAdminChange}
            handleDeleteSubmit={handleDeleteAdminSubmit}
            newAdminPatch={newAdminPatch}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
