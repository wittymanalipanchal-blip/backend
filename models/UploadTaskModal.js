import { useState } from "react";
import axios from "axios";

export default function UploadTaskModal({ taskId, onClose, onUploaded }) {
  const [description, setDescription] = useState("");
  const [changes, setChanges] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(e.target.files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!files.length) {
      alert("Select file first");
      return;
    }

    const formData = new FormData();
    formData.append("description", description);
    formData.append("changes", changes);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    await axios.post(
      `http://192.168.1.1:5000/api/tasks/upload/${taskId}`,
      formData,
     
    );

    onUploaded();
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal">
        <h3>Upload Task</h3>

        <form onSubmit={handleSubmit}>
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <textarea
            placeholder="Changes / Remarks"
            value={changes}
            onChange={(e) => setChanges(e.target.value)}
          />

          <input
            type="file"
            multiple
            accept=".png,.jpg,.jpeg,.txt,.zip"
            onChange={handleFileChange}
          />

          <div>
            <button type="submit">Upload</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
