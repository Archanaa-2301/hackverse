"use client";

import React, { useState } from "react";
import Papa from "papaparse";

export default function Admin() {
  const [data, setData] = useState<any[]>([]);
  const [file, setFile] = useState<File | null>(null);

  // ✅ Upload & parse CSV
  function handleUpload(e: any) {
    const selectedFile = e.target.files[0];

    if (!selectedFile) return;

    Papa.parse(selectedFile, {
      header: true,
      skipEmptyLines: true,
      complete: function (results: any) {
        const parsedData = results.data;

        console.log("Parsed Data:", parsedData);

        setData(parsedData);

        alert("CSV Loaded Successfully");
      },
      error: function () {
        alert("CSV parsing failed");
      },
    });
  }

  // ✅ Download full CSV
  function downloadAll() {
    if (data.length === 0) return;

    const headers = Object.keys(data[0]);
    let csv = headers.join(",") + "\n";

    for (let i = 0; i < data.length; i++) {
      let row = "";
      for (let j = 0; j < headers.length; j++) {
        row += data[i][headers[j]];
        if (j < headers.length - 1) row += ",";
      }
      csv += row + "\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "all_data.csv";
    a.click();
  }

  // ✅ Top 15 (best per team)
  function downloadTop15() {
    if (data.length === 0) return;

    let map: any = {};

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const team = row.team_name?.toLowerCase();

      if (!team) continue;

      if (!map[team] || Number(row.score) > Number(map[team].score)) {
        map[team] = row;
      }
    }

    let best = Object.values(map);

    best.sort((a: any, b: any) => Number(b.score) - Number(a.score));

    const top15 = best.slice(0, 15);

    const headers = Object.keys(top15[0]);
    let csv = headers.join(",") + "\n";

    for (let i = 0; i < top15.length; i++) {
      let row = "";
      for (let j = 0; j < headers.length; j++) {
        row += top15[i][headers[j]];
        if (j < headers.length - 1) row += ",";
      }
      csv += row + "\n";
    }

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "top15.csv";
    a.click();
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Admin Panel</h2>

      <input type="file" accept=".csv" onChange={handleUpload} />

      <br /><br />

      <button onClick={downloadAll}>Download All CSV</button>
      <button onClick={downloadTop15}>Download Top 15</button>
    </div>
  );
}
