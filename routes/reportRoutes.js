const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");  
const Task = require("../models/Task");
const Project = require("../models/Project");

router.get("/employee/:employeeId", async (req, res) => {

    try {

        const { employeeId } = req.params;

        const tasks = await Task.aggregate([

            {
                $match: {
                    employee_id: new mongoose.Types.ObjectId(employeeId)
                }
            },

            {
                $lookup: {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "project"
                }
            },

            { $unwind: "$project" },

            {
                $project: {
                    projectName: "$project.name",
                    taskName: "$work_type",
                    status: "$status",

                    submission: {
                        $cond: [
                            { $eq: ["$status", "Completed"] },
                            "Early Submission",
                            {
                                $cond: [
                                    { $eq: ["$status", "Delayed"] },
                                    "Delayed Submission",
                                    "Pending"
                                ]
                            }
                        ]
                    }
                }
            }

        ]);

        res.json(tasks);

    } catch (err) {

        console.log(err);
        res.status(500).json({ message: "Server Error" });

    }

});

router.get("/admin/employee-performance", async (req, res) => {
    try {

        const result = await Task.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "employee_id",
                    foreignField: "_id",
                    as: "employee"
                }
            },
            { $unwind: "$employee" },

            {
                $lookup: {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "project"
                }
            },
            { $unwind: "$project" },

            {
                $project: {
                    employeeName: "$employee.full_name",
                    projectName: "$project.name",
                    taskName: "$work_type",
                    status: "$status",

                    submission: {
                        $cond: [
                            { $eq: ["$status", "Completed"] },
                            "Early Submission",
                            {
                                $cond: [
                                    { $eq: ["$status", "Delayed"] },
                                    "Delayed Submission",
                                    "Pending"
                                ]
                            }
                        ]
                    }
                }
            }
        ]);

        res.json(result);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/admin/task-report", async (req, res) => {
    try {

        const result = await Task.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "employee_id",
                    foreignField: "_id",
                    as: "employee"
                }
            },
            { $unwind: "$employee" },

            {
                $lookup: {
                    from: "projects",
                    localField: "project_id",
                    foreignField: "_id",
                    as: "project"
                }
            },
            { $unwind: "$project" },

            {
                $project: {
                    projectName: "$project.name",
                    taskName: "$work_type",
                    employeeName: "$employee.full_name",
                    status: "$status"
                }
            }
        ]);

        res.json(result);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get("/admin/project-report", async (req, res) => {

    try {

        const result = await Project.aggregate([
            {
                $lookup: {
                    from: "users",
                    localField: "manager_id",
                    foreignField: "_id",
                    as: "manager"
                }
            },

            { $unwind: "$manager" },

            {
                $project: {
                    projectName: "$name",
                    managerName: "$manager.full_name"
                }
            }
        ]);

        res.json(result);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }

});

module.exports = router;