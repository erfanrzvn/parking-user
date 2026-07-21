import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '../schema';
import type { Parking } from '../types';
import './Parkings.css';

const client = generateClient<Schema>();

export default function Parkings() {
  const [parkings, setParkings] = useState<Parking[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingName, setBuildingName] = useState<string>('');
  const [buildingCode, setBuildingCode] = useState<string>('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const userAttributes = await fetchUserAttributes();
      const userBuildingCode = userAttributes['custom:buildingCode'] || '';
      
      if (!userBuildingCode) {
        alert('خطا: کد ساختمان برای کاربر تعریف نشده است');
        setLoading(false);
        return;
      }

      setBuildingCode(userBuildingCode);

      // Get building name
      const buildingsData = await client.models.Building.list({
        filter: { buildingCode: { eq: userBuildingCode } }
      });
      if (buildingsData.data[0]) {
        setBuildingName(buildingsData.data[0].buildingName);
      }

      // Load parkings for this building
      const parkingsData = await client.models.Parking.list({
        filter: { buildingCode: { eq: userBuildingCode } }
      });
      setParkings(parkingsData.data as Parking[]);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  const residentParkings = parkings.filter(p => 
    !p.parkingName?.toLowerCase().includes('guest')
  );
  const guestParkings = parkings.filter(p => 
    p.parkingName?.toLowerCase().includes('guest')
  );

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading parkings...</p>
      </div>
    );
  }

  return (
    <div className="parkings-page">
      <div className="page-header">
        <div>
          <h1>🅿️ Available Parkings</h1>
          <p className="page-subtitle">
            {buildingName} ({buildingCode}) - Read-Only View
          </p>
        </div>
        <button className="btn-refresh" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      <div className="parking-stats-bar">
        <div className="stat">
          <span className="stat-value">{parkings.length}</span>
          <span className="stat-label">Total Parkings</span>
        </div>
        <div className="stat">
          <span className="stat-value">{residentParkings.length}</span>
          <span className="stat-label">Resident Parkings</span>
        </div>
        <div className="stat">
          <span className="stat-value">{guestParkings.length}</span>
          <span className="stat-label">Guest Parkings</span>
        </div>
      </div>

      {parkings.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🅿️</div>
          <h3>No parkings available</h3>
          <p>There are no parking spaces registered for this building yet</p>
        </div>
      ) : (
        <>
          {residentParkings.length > 0 && (
            <div className="parking-section">
              <h2>🏠 Resident Parkings</h2>
              <div className="parkings-grid">
                {residentParkings.map((parking) => (
                  <div key={parking.id} className="parking-card resident">
                    <div className="parking-header">
                      <h3>{parking.parkingNo}</h3>
                      <span className="parking-type">Resident</span>
                    </div>
                    {parking.parkingName && (
                      <div className="parking-name">{parking.parkingName}</div>
                    )}
                    <div className="parking-details">
                      {parking.parkingLots && (
                        <div className="detail">
                          <span className="icon">🅿️</span>
                          <span>{parking.parkingLots} spot{parking.parkingLots !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {parking.description && (
                        <div className="detail">
                          <span className="icon">📝</span>
                          <span>{parking.description}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guestParkings.length > 0 && (
            <div className="parking-section">
              <h2>👥 Guest Parkings</h2>
              <p className="section-note">
                These parking spots are available for your guests to reserve online
              </p>
              <div className="parkings-grid">
                {guestParkings.map((parking) => (
                  <div key={parking.id} className="parking-card guest">
                    <div className="parking-header">
                      <h3>{parking.parkingNo}</h3>
                      <span className="parking-type">Guest</span>
                    </div>
                    {parking.parkingName && (
                      <div className="parking-name">{parking.parkingName}</div>
                    )}
                    <div className="parking-details">
                      {parking.parkingLots && (
                        <div className="detail">
                          <span className="icon">🅿️</span>
                          <span>{parking.parkingLots} spot{parking.parkingLots !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      {parking.description && (
                        <div className="detail">
                          <span className="icon">📝</span>
                          <span>{parking.description}</span>
                        </div>
                      )}
                    </div>
                    <div className="guest-note">
                      Your guests can reserve this parking using your Access Code
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      <div className="info-box">
        <h3>ℹ️ About Parking Information</h3>
        <ul>
          <li>
            <strong>Resident Parkings:</strong> These are assigned parking spots for residents.
          </li>
          <li>
            <strong>Guest Parkings:</strong> These are available for your guests to book online 
            using your Access Code.
          </li>
          <li>
            For parking assignments or changes, please contact your building administrator.
          </li>
        </ul>
      </div>
    </div>
  );
}

