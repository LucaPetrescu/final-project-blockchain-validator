import React, { useState } from "react";

const CreateMarket: React.FC = () => {
  const [description, setDescription] = useState("");
  const [deadline, setDeadline] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newMarket = {
      description,
      deadline,
    };

    setDescription("");
    setDeadline("");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-2xl font-bold mb-6">Create a New Market</h1>
        <form onSubmit={handleSubmit}>
          {/* Market Description */}
          <div className="mb-6">
            <label
              htmlFor="description"
              className="block mb-2 text-sm text-gray-400"
            >
              Market Description
            </label>
            <textarea
              id="description"
              className="w-full p-3 rounded-lg bg-gray-700 text-white"
              placeholder="Enter market description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            ></textarea>
          </div>

          {/* Market Deadline */}
          <div className="mb-6">
            <label
              htmlFor="deadline"
              className="block mb-2 text-sm text-gray-400"
            >
              Market Deadline
            </label>
            <input
              type="datetime-local"
              id="deadline"
              className="w-full p-3 rounded-lg bg-gray-700 text-white"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              required
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white"
          >
            Create Market
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateMarket;
