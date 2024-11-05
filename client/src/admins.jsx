import React from 'react';

const AdminsInt = ({
    admins,
    newAdmin,
    handleInputChangePost,
    handleAddAdmin,
    handleInputChangePatch,
    handleUpdateSubmit,
    deleteId,
    handleDeleteChange,
    handleDeleteSubmit,
    newAdminPatch
}) => {
    return (
        <div className="container mt-5">
            <h1 className="text-center mb-5">Admin Management</h1>

            <table className="table table-bordered mb-5">
                <thead>
                    <tr>
                        <th className='bg-light'>ID</th>
                        <th className='bg-light'>Username</th>
                        <th className='bg-light'>Password</th>
                    </tr>
                </thead>
                <tbody>
                    {admins.length > 0 ? (
                        admins.map(admin => (
                            <tr key={admin._id}>
                                <td>{admin._id}</td>
                                <td>{admin.username}</td>
                                <td>{admin.password}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">No admins found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <hr className="my-4" />

            <div className="row">
                <div className="col-md-4">
                    <h3>Add Admin</h3>
                    <form onSubmit={handleAddAdmin}>
                        <div className="mb-3">
                            <label htmlFor="adminUsername" className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                id="adminUsername"
                                name="username"
                                value={newAdmin.username}
                                onChange={handleInputChangePost}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="adminPassword" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="adminPassword"
                                name="password"
                                value={newAdmin.password}
                                onChange={handleInputChangePost}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Add Admin</button>
                    </form>
                </div>

                <div className="col-md-4">
                    <h3>Update Admin</h3>
                    <form onSubmit={handleUpdateSubmit}>
                        <div className="mb-3">
                            <label htmlFor="updateId" className="form-label">Admin ID</label>
                            <input
                                type="text"
                                className="form-control"
                                id="updateId"
                                name="id"
                                value={newAdminPatch.id}
                                onChange={handleInputChangePatch}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="updateUsername" className="form-label">Username</label>
                            <input
                                type="text"
                                className="form-control"
                                name="username"
                                id="updateUsername"
                                value={newAdminPatch.username}
                                onChange={handleInputChangePatch}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="updatePassword" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                name="password"
                                id="updatePassword"
                                value={newAdminPatch.password}
                                onChange={handleInputChangePatch}
                            />
                        </div>
                        <div className="mb-3">
                            <button type="submit" className="btn btn-warning">Update</button>
                        </div>
                    </form>
                </div>

                <div className="col-md-4">
                    <h3>Delete Admin</h3>
                    <form onSubmit={handleDeleteSubmit}>
                        <div className="mb-3">
                            <label htmlFor="deleteId" className="form-label">Admin ID</label>
                            <input
                                type="text"
                                className="form-control"
                                id="deleteId"
                                value={deleteId}
                                onChange={handleDeleteChange}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <button type="submit" className="btn btn-danger">Delete</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminsInt;
