import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { type Schema } from '../schema';
import './Dashboard.css';

const client = generateClient<Schema>();

interface Stats {
  totalUnits: number;
  totalParkings: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    totalUnits: 0,
    totalParkings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const [units, parkings] = await Promise.all([
        client.models.UnitInfo.list(),
        client.models.Parking.list(),
      ]);

      setStats({
        totalUnits: units.data.length,
        totalParkings: parkings.data.length,
      });
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>📊 Resident Dashboard</h1>
        <button className="btn-refresh" onClick={loadStats}>
          🔄 Refresh
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card units">
          <div className="stat-icon">🏠</div>
          <div className="stat-content">
            <h3>Total Units</h3>
            <p className="stat-value">{stats.totalUnits}</p>
          </div>
        </div>

        <div className="stat-card parkings">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <h3>Available Parkings</h3>
            <p className="stat-value">{stats.totalParkings}</p>
          </div>
        </div>
      </div>

      <div className="welcome-card">
        <h2>👋 Welcome Resident!</h2>
        <p>View your units and available parkings using the menu.</p>
      </div>
    </div>
  );
}

