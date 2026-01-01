import React, { useState } from "react";
import axios from "axios";
import { Analytics } from '@vercel/analytics/react';

function Main_fo_cards() {
  const [formData, setFormData] = useState({ title: "", body: "" });
  const [response, setResponse] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Preduprezhdaem perezagruzku stranitsy

    try {
      const res = await axios.post(
        "https://crudcrud.com/api/a82ae08a2af14d15afb52cd197e79c8b",
        formData
      ); // Zamenite URL na svoy API
      setResponse(res.data); // Sohranenie otveta s backenda
    } catch (error) {
      console.error("Error during POST request:", error.message);
    }
  };

  return (
    <div>
      <h1>Send POST Request</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
        />
        <textarea
          name="body"
          placeholder="Body"
          value={formData.body}
          onChange={handleInputChange}
        />
        <button type="submit">Submit</button>
      </form>

      {response && (
        <div>
          <h2>Response from Server:</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre>
        </div>
      )}
      <Analytics />
    </div>
  );
}

export default Main_fo_cards;
