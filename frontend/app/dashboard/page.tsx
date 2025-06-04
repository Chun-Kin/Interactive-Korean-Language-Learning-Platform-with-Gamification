"use client";

import { useEffect, useState } from "react";
import styles from "../styles/dashboard.module.css";

export default function DashboardPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userToDelete, setUserToDelete] = useState<any | null>(null);

  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    const res = await fetch("http://localhost:5000/api/auth/dashboard", {
      credentials: "include",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (data.success) setUsers(data.users);
  };

  const handleDelete = (user: any) => {
    setUserToDelete(user);
  };
  

  const confirmDelete = async () => {
    const token = localStorage.getItem("token");
    if (!token || !userToDelete) return;
  
    const res = await fetch(`http://localhost:5000/api/auth/users/${userToDelete.id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  
    const data = await res.json();
    if (data.success) {
      alert("User deleted!");
      fetchUserData();
    } else {
      alert("Delete failed.");
    }
    setUserToDelete(null);
  };
  

  const handleEdit = (user: any) => {
    setEditingUser(user);
  };

  const handleUpdate = async () => {
    const token = localStorage.getItem("token");
    if (!token || !editingUser) return;

    const res = await fetch(
      `http://localhost:5000/api/auth/users/${editingUser.id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editingUser),
      }
    );

    const data = await res.json();
    if (data.success) {
      alert("User updated!");
      setEditingUser(null);
      fetchUserData();
    } else {
      alert("Update failed.");
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>User Management</h1>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Skill Level</th>
              <th>Level</th>
              <th>EXP</th>
              <th>EXP to Next</th>
              <th>Learning Points</th>
              <th>Speaking Points</th>
              <th>Edit</th>
              <th>Delete</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.skill_level}</td>
                <td>{user.level}</td>
                <td>{user.experience}</td>
                <td>{user.exp_to_next_level}</td>
                <td>{user.learning_points}</td>
                <td>{user.speaking_points}</td>
                <td>
                    <button className={styles.editButton} onClick={() => handleEdit(user)}>Edit</button>
                </td>
                <td>
                  <button className={styles.deleteButton} onClick={() => handleDelete(user)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editingUser && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>Edit User</h2>
            {[
              "username",
              "email",
              "skill_level",
              "level",
              "experience",
              "exp_to_next_level",
              "learning_points",
              "speaking_points",
            ].map((field) => (
              <div key={field}>
                <label>{field}</label>
                <input
                  type="text"
                  value={editingUser[field]}
                  onChange={(e) =>
                    setEditingUser({ ...editingUser, [field]: e.target.value })
                  }
                />
              </div>
            ))}

            <button onClick={handleUpdate}>Save</button>
            <button onClick={() => setEditingUser(null)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {userToDelete && (
        <div className={styles.modalDelete}>
          <div className={styles.modalDeleteContent}>
            <h2>Confirm Delete</h2>
            <p>Are you sure you want to delete <strong>{userToDelete.username}</strong>?</p>
            <button onClick={confirmDelete} className={styles.modalDeleteButton}>Yes, Delete</button>
            <button onClick={() => setUserToDelete(null)} className={styles.cancelButton}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}
