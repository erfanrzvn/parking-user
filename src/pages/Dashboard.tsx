import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '../amplify/data/resource';
import './Dashboard.css';

const client = generateClient<Schema>();

interface Stats {
  buildingName: string;
  buildingCode: string;
  unitNo: string;
  accessNo: string;
  totalParkings: number;
  guestParkings: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({
    buildingName: '',
    buildingCode: '',
    unitNo: '',
    accessNo: '',
    totalParkings: 0,
    guestParkings: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userAttributes = await fetchUserAttributes();
      const userBuildingCode = userAttributes['custom:buildingCode'] || '';
      const userUnitNo = userAttributes['custom:unitNo'] || '';
      
      if (!userBuildingCode || !userUnitNo) {
        alert('خطا: اطلاعات کاربر ناقص است');
        setLoading(false);
        return;
      }

      // Load building info
      const buildingsData = await client.models.Building.list({
        filter: { buildingCode: { eq: userBuildingCode } }
      });
      const building = buildingsData.data[0];

      // Load unit info
      const unitsData = await client.models.UnitInfo.list({
        filter: { 
          buildingCode: { eq: userBuildingCode },
          unitNo: { eq: userUnitNo }
        }
      });
      const unit = unitsData.data[0];

      // Load parkings for this building
      const parkingsData = await client.models.Parking.list({
        filter: { buildingCode: { eq: userBuildingCode } }
      });

      const guestParkings = parkingsData.data.filter(p => 
        p.parkingName?.toLowerCase().includes('guest')
      ).length;

      setStats({
        buildingName: building?.buildingName || 'N/A',
        buildingCode: userBuildingCode,
        unitNo: userUnitNo,
        accessNo: unit?.accessNo || 'N/A',
        totalParkings: parkingsData.data.length,
        guestParkings,
      });
    } catch (error) {
      console.error('Error loading data:', error);
      alert('خطا در بارگذاری اطلاعات');
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
        <div>
          <h1>🏠 Welcome to Your Resident Portal</h1>
          <p className="dashboard-subtitle">
            {stats.buildingName} - Unit {stats.unitNo}
          </p>
        </div>
        <button className="btn-refresh" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      <div className="resident-info-card">
        <h2>📋 Your Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Building:</span>
            <span className="info-value">{stats.buildingName}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Building Code:</span>
            <span className="info-value">{stats.buildingCode}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Unit Number:</span>
            <span className="info-value">{stats.unitNo}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Access Code:</span>
            <span className="info-value access-code">{stats.accessNo}</span>
          </div>
        </div>
        <div className="info-note">
          <small>
            💡 <strong>Access Code</strong> is for your guests to make parking reservations
          </small>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card parkings">
          <div className="stat-icon">🅿️</div>
          <div className="stat-content">
            <h3>Total Parkings</h3>
            <p className="stat-value">{stats.totalParkings}</p>
            <p className="stat-label">Available in building</p>
          </div>
        </div>

        <div className="stat-card guest">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <h3>Guest Parkings</h3>
            <p className="stat-value">{stats.guestParkings}</p>
            <p className="stat-label">For visitor reservations</p>
          </div>
        </div>
      </div>

      <div className="quick-info">
        <h2>ℹ️ Quick Information</h2>
        <div className="info-cards">
          <div className="info-card">
            <div className="info-card-icon">🚗</div>
            <div className="info-card-content">
              <h3>Guest Reservations</h3>
              <p>
                Share your <strong>Access Code</strong> ({stats.accessNo}) with your guests 
                so they can book a guest parking spot.
              </p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">📱</div>
            <div className="info-card-content">
              <h3>View Information</h3>
              <p>
                Use the menu to view your unit details and available parkings in your building.
              </p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-card-icon">🔒</div>
            <div className="info-card-content">
              <h3>Read-Only Access</h3>
              <p>
                As a resident, you have view-only access. Contact your building admin for changes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
