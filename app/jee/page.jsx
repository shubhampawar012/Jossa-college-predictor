"use client";
import { useState, useEffect } from 'react';
import collegeDataRaw from '../../file.json';

export default function JeePredictor() {
  const [collegeData, setCollegeData] = useState([]);
  const [results, setResults] = useState([]);
  const [rank, setRank] = useState('');
  const [category, setCategory] = useState('OPEN');
  const [gender, setGender] = useState('Male');
  const [branchText, setBranchText] = useState('');

  useEffect(() => {
    const enrichedData = collegeDataRaw.map(college => {
      let type = "GFTI";
      const name = (college["Institute"] || "").toLowerCase();
      if (name.includes("indian institute of technology") || (name.includes("iit") && !name.includes("iiit"))) type = "IIT";
      else if (name.includes("information technology") || name.includes("iiit")) type = "IIIT";
      else if (name.includes("national institute of technology") || name.includes("nit")) type = "NIT";
      return { ...college, type };
    });
    setCollegeData(enrichedData);
  }, []);

  function getProbability(userRank, opening, closing) {
    if (!Number.isFinite(userRank)) return { status: "UNLIKELY", score: 0 };
    let tolerance = closing * 0.10;
    if (userRank <= opening) return { status: "HIGH", score: 95 };
    if (userRank > opening && userRank <= closing) return { status: "MEDIUM", score: Math.round(50 + ((closing - userRank) / (closing - opening)) * 40) };
    if (userRank > closing && userRank <= (closing + tolerance)) return { status: "LOW", score: Math.round(10 + ((closing + tolerance - userRank) / tolerance) * 40) };
    return { status: "UNLIKELY", score: 0 };
  }

  function handlePredict() {
    const rankValue = Number(rank);
    if (!rankValue || rankValue <= 0) return alert("Enter valid rank");

    const preferredBranch = branchText.trim().toLowerCase();
    const seatType = category === "General" ? "OPEN" : category;

    const filtered = collegeData.filter(college => {
      const closing = Number(college["Closing Rank"]);
      const tolerance = closing * 0.10;
      
      const rankMatch = rankValue <= (closing + tolerance);
      const categoryMatch = college["Seat Type"] === seatType;
      const notIIT = college.type !== "IIT";
      
      const programName = (college["Academic Program Name"] || "").toLowerCase();
      let branchMatch = true;
      
      if (preferredBranch) {
        if (preferredBranch === "cs" || preferredBranch === "computer") branchMatch = programName.includes("computer");
        else if (preferredBranch === "civil") branchMatch = programName.includes("civil");
        else if (preferredBranch === "mech") branchMatch = programName.includes("mechanical");
        else branchMatch = programName.includes(preferredBranch);
      }

      let genderMatch = false;
      const dbGender = college["Gender"] || "";
      if (gender === "Male") genderMatch = dbGender === "Gender-Neutral";
      else if (gender === "Female") genderMatch = dbGender === "Gender-Neutral" || dbGender.includes("Female-only");

      return rankMatch && categoryMatch && genderMatch && notIIT && branchMatch;
    });

    setResults(filtered.sort((a, b) => Number(a["Closing Rank"]) - Number(b["Closing Rank"])));
  }

  return (
    <div>
      <h1 style={{ color: '#1d4ed8' }}>JEE Main / JoSAA Predictor</h1>
      
      <div style={{ background: 'white', padding: '20px', borderRadius: '8px', marginBottom: '20px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', marginBottom: '15px' }}>
          <input type="number" placeholder="Enter JEE Rank" value={rank} onChange={e => setRank(e.target.value)} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }} />
          
          <select value={category} onChange={e => setCategory(e.target.value)} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="OPEN">General / OPEN</option>
            <option value="OBC-NCL">OBC-NCL</option>
            <option value="SC">SC</option>
            <option value="ST">ST</option>
          </select>

          <select value={gender} onChange={e => setGender(e.target.value)} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }}>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
          
          <input type="text" placeholder="Preferred Branch (e.g. Civil, CS)" value={branchText} onChange={e => setBranchText(e.target.value)} style={{ padding: '10px', flex: 1, border: '1px solid #ccc', borderRadius: '4px' }} />
        </div>
        
        <button onClick={handlePredict} style={{ background: '#16a34a', color: 'white', padding: '12px 20px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Predict Colleges</button>
      </div>

      {results.length > 0 && (
        <div style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflowX: 'auto' }}>
          <h3>Found {results.length} Colleges</h3>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ background: '#f3f4f6', borderBottom: '2px solid #e5e7eb' }}>
                <th style={{ padding: '12px' }}>Institute</th>
                <th style={{ padding: '12px' }}>Branch</th>
                <th style={{ padding: '12px' }}>Probability</th>
                <th style={{ padding: '12px' }}>Opening</th>
                <th style={{ padding: '12px' }}>Closing</th>
              </tr>
            </thead>
            <tbody>
              {results.map((c, i) => {
                const prob = getProbability(Number(rank), Number(c["Opening Rank"]), Number(c["Closing Rank"]));
                const color = prob.status === "HIGH" ? "green" : prob.status === "MEDIUM" ? "#d97706" : "red";
                return (
                  <tr key={i} style={{ borderBottom: '1px solid #e5e7eb' }}>
                    <td style={{ padding: '12px' }}>{c["Institute"]}</td>
                    <td style={{ padding: '12px' }}>{c["Academic Program Name"]}</td>
                    <td style={{ padding: '12px', color: color, fontWeight: 'bold' }}>{prob.status} ({prob.score}%)</td>
                    <td style={{ padding: '12px' }}>{c["Opening Rank"]}</td>
                    <td style={{ padding: '12px' }}>{c["Closing Rank"]}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
