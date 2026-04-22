import Workspace from "../models/Workspace.js";

export const createWorkspace = async (req, res) => {
  try {
    const workspace = new Workspace(req.body);
    await workspace.save();

    res.status(201).json(workspace);
  } catch (err) {
    res.status(500).json({ message: "Error creating workspace" });
  }
};