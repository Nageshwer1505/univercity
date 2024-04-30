import React, { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function App() {
  const [country, setCountry] = useState('India');
  const [universities, setUniversities] = useState([]);
  const chartRef = useRef(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`http://localhost:3001/universities?country=${country}`);
        const data = await response.json();
        setUniversities(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }
    fetchData();
  }, [country]);

  useEffect(() => {
    if (chartRef.current !== null) {
      chartRef.current.destroy();
    }

    const stateData = universities.reduce((acc, curr) => {
      acc[curr.state] = (acc[curr.state] || 0) + 1;
      return acc;
    }, {});

    const labels = Object.keys(stateData);
    const counts = Object.values(stateData);

    const ctx = document.getElementById('stateChart').getContext('2d');
    
    const newChartInstance = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: labels,
        datasets: [{
          label: 'Percentage of Universities',
          data: counts,
          backgroundColor: [
            'rgba(255, 99, 132, 0.2)',
            'rgba(54, 162, 235, 0.2)',
            'rgba(255, 206, 86, 0.2)',
            'rgba(75, 192, 192, 0.2)',
            'rgba(153, 102, 255, 0.2)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
          ],
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    
    chartRef.current = newChartInstance;

    // Cleanup function if new chart  when change state
    return () => {
      if (chartRef.current !== null) {
        chartRef.current.destroy();
      }
    };
  }, [universities]);

  const handleChangeCountry = (event) => {
    setCountry(event.target.value);
  };

  const downloadChartAsPDF = () => {
    if (!chartRef.current) return;

    html2canvas(document.getElementById('stateChart')).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape');
      pdf.addImage(imgData, 'PNG', 10, 10, 280, 150);
      pdf.save('chart.pdf');
    });
  };


  function rendertableData(){
    return(
      <table style={{ borderCollapse: 'collapse', width: '100%' }}>
      <thead>
        <tr style={{ backgroundColor: '#f2f2f2' }} >
        <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Sr. No.</th>
          <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Name</th>
          <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>website</th>
          <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>State</th>
          <th style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>Country</th>
        </tr>
      </thead>
      <tbody>
        {universities.map((university,i) => (
          <tr  style={{ backgroundColor: '#f2f2f2' }} key={university.id}>
              <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{i+1}</td>
            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{university.name}</td>
            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{university.website}</td>
            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{university.state}</td>
            <td style={{ border: '1px solid #dddddd', textAlign: 'left', padding: '8px' }}>{university.country}</td>
          </tr>
        ))}
      </tbody>
    </table>
    )
  }


  function renderPiChart()
  {
    return(
      <canvas id="stateChart"></canvas>
    )
  }


  return (
    <div>
      <h1>Universities</h1>
      <div>
        <label htmlFor="countrySelect">Select Country: </label>
        <select id="countrySelect" value={country} onChange={handleChangeCountry}>
          <option value="India">India</option>
          <option value="United States">United States</option>
          <option value="United Kingdom">United Kingdom</option>
          <option value="Japan">Japan</option>
        </select>
      </div>
      {rendertableData()}
      {renderPiChart()}
      <button onClick={downloadChartAsPDF}>Download Chart as PDF</button>
    </div>
  );
}

export default App;
