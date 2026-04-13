"use client";

import React, { useState, useEffect } from "react";
import Papa from "papaparse";

export default function Admin() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // ✅ load submissions
  useEffect(() => {
    const saved = localStorage.getItem("leaderboard");
    if (saved) {
      setLeaderboard(JSON.parse(saved));
    }
  }, []);

  // ✅ upload dataset
  function handleUpload() {
    if (!file) {
      alert("Select file");
      return;
    }

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const data = results.data;

        localStorage.setItem("dataset", JSON.stringify(data));

        alert("Dataset uploaded: " + data.length + " rows");
      }
    });
  }

  // ✅ reset leaderboard
  function handleReset() {
    localStorage.removeItem("leaderboard");
    setLeaderboard([]);
    alert("Reset done");
  }

  // ✅ download CSV
  function downloadCSV() {
    if (leaderboard.length === 0) return;

    const headers = Object.keys(leaderboard[0]);
    let csv = headers.join(",") + "\n";

    leaderboard.forEach((row) => {
      csv += headers.map(h => row[h]).join(",") + "\n";
    });

    const blob = new Blob([csv]);
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "submissions.csv";
    a.click();
  }

  return (
    <div style={{ padding: 20 }}>
      <h1>Admin Panel</h1>

      <input type="file" onChange={(e)=>setFile(e.target.files?.[0] || null)} />
      <br /><br />

      <button onClick={handleUpload}>Upload Dataset</button>
      <button onClick={handleReset}>Reset</button>
      <button onClick={downloadCSV}>Download CSV</button>

      <h2>Submissions</h2>

      {leaderboard.map((x, i) => (
        <div key={i}>
          {x.team} - {x.score.toFixed(2)}%
        </div>
      ))}
    </div>
  );
}
