import React from 'react';

const StudentsInt = ({
    students,
    newStudent,
    handleInputChangePost,
    handleAddStudent,
    handleInputChangePatch,
    handleUpdateSubmit,
    deleteId,
    handleDeleteChange,
    handleDeleteSubmit,
    newStudentPatch
}) => {
    return (
        <div className="container mt-5">
            <h1 className="text-center mb-5">Student Management</h1>

            <table className="table table-bordered mb-5">
                <thead>
                    <tr>
                        <th className='bg-light'>ID</th>
                        <th className='bg-light'>Gmail</th>
                        <th className='bg-light'>Password</th>
                    </tr>
                </thead>
                <tbody>
                    {students.length > 0 ? (
                        students.map(student => (
                            <tr key={student._id}>
                                <td>{student._id}</td>
                                <td>{student.gmail}</td>
                                <td>{student.password}</td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan="3" className="text-center">No students found</td>
                        </tr>
                    )}
                </tbody>
            </table>

            <hr className="my-4" />

            <div className="row">
                <div className="col-md-4">
                    <h3>Add Student</h3>
                    <form onSubmit={handleAddStudent}>
                        <div className="mb-3">
                            <label htmlFor="gmail" className="form-label">Gmail</label>
                            <input
                                type="email"
                                className="form-control"
                                id="gmail"
                                name="gmail"
                                value={newStudent.gmail}
                                onChange={handleInputChangePost}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="password" className="form-label">Password</label>
                            <input
                                type="password"
                                className="form-control"
                                id="password"
                                name="password"
                                value={newStudent.password}
                                onChange={handleInputChangePost}
                                required
                            />
                        </div>
                        <button type="submit" className="btn btn-primary">Add Student</button>
                    </form>
                </div>

                <div className="col-md-4">
                    <h3>Update Student</h3>
                    <form onSubmit={handleUpdateSubmit}>
                        <div className="mb-3">
                            <label htmlFor="updateId" className="form-label">Student ID</label>
                            <input
                                type="text"
                                className="form-control"
                                id="updateId"
                                name="id"
                                value={newStudentPatch.id}
                                onChange={handleInputChangePatch}
                                required
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="updateGmail" className="form-label">Gmail</label>
                            <input
                                type="email"
                                className="form-control"
                                name="gmail"
                                id="updateGmail"
                                value={newStudentPatch.gmail}
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
                                value={newStudentPatch.password}
                                onChange={handleInputChangePatch}
                            />
                        </div>
                        <div className="mb-3">
                            <button type="submit" className="btn btn-warning">Update</button>
                        </div>
                    </form>
                </div>

                <div className="col-md-4">
                    <h3>Delete Student</h3>
                    <form onSubmit={handleDeleteSubmit}>
                        <div className="mb-3">
                            <label htmlFor="deleteId" className="form-label">Student ID</label>
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

export default StudentsInt;
