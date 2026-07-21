import { useState, useEffect } from 'react';
import { generateClient } from 'aws-amplify/data';
import { fetchUserAttributes } from 'aws-amplify/auth';
import type { Schema } from '../schema';
import type { UnitInfo } from '../types';
import './Units.css';

const client = generateClient<Schema>();

export default function Units() {
  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [buildingName, setBuildingName] = useState<string>('');

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

      // Get building name
      const buildingsData = await client.models.Building.list({
        filter: { buildingCode: { eq: userBuildingCode } }
      });
      if (buildingsData.data[0]) {
        setBuildingName(buildingsData.data[0].buildingName);
      }

      // Load user's unit info
      const unitsData = await client.models.UnitInfo.list({
        filter: { 
          buildingCode: { eq: userBuildingCode },
          unitNo: { eq: userUnitNo }
        }
      });
      
      if (unitsData.data[0]) {
        setUnit(unitsData.data[0] as UnitInfo);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      alert('خطا در بارگذاری اطلاعات');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="spinner"></div>
        <p>Loading your unit information...</p>
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="units-page">
        <div className="page-header">
          <h1>🏠 My Unit Information</h1>
        </div>
        <div className="empty-state">
          <div className="empty-icon">🏠</div>
          <h3>Unit information not found</h3>
          <p>Please contact your building administrator</p>
        </div>
      </div>
    );
  }

  return (
    <div className="units-page">
      <div className="page-header">
        <div>
          <h1>🏠 My Unit Information</h1>
          <p className="page-subtitle">
            {buildingName} - Unit {unit.unitNo} (Read-Only)
          </p>
        </div>
        <button className="btn-refresh" onClick={loadData}>
          🔄 Refresh
        </button>
      </div>

      <div className="unit-detail-card">
        <div className="unit-detail-header">
          <h2>Unit {unit.unitNo}</h2>
          <span className="building-badge">{unit.buildingCode}</span>
        </div>

        <div className="unit-detail-body">
          <div className="detail-section">
            <h3>👤 Resident Information</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Full Name:</span>
                <span className="value">
                  {unit.sakenName} {unit.sakenLastName || ''}
                </span>
              </div>
              {unit.phone && (
                <div className="detail-item">
                  <span className="label">Phone:</span>
                  <span className="value">{unit.phone}</span>
                </div>
              )}
              {unit.email && (
                <div className="detail-item">
                  <span className="label">Email:</span>
                  <span className="value">{unit.email}</span>
                </div>
              )}
            </div>
          </div>

          <div className="detail-section">
            <h3>🏢 Unit Details</h3>
            <div className="detail-grid">
              <div className="detail-item">
                <span className="label">Building Code:</span>
                <span className="value">{unit.buildingCode}</span>
              </div>
              <div className="detail-item">
                <span className="label">Unit Number:</span>
                <span className="value">{unit.unitNo}</span>
              </div>
            </div>
          </div>

          <div className="detail-section highlight">
            <h3>🔑 Guest Access Code</h3>
            <div className="access-code-display">
              <code>{unit.accessNo}</code>
              <button
                className="btn-copy"
                onClick={() => {
                  navigator.clipboard.writeText(unit.accessNo);
                  alert('✅ Access code copied to clipboard!');
                }}
              >
                📋 Copy
              </button>
            </div>
            <p className="access-note">
              Share this code with your guests so they can reserve a guest parking spot
            </p>
          </div>

          {unit.createdAt && (
            <div className="detail-footer">
              <small>
                📅 Registered: {new Date(unit.createdAt).toLocaleDateString('en-CA')}
              </small>
            </div>
          )}
        </div>
      </div>

      <div className="info-box">
        <h3>ℹ️ Need to Update Your Information?</h3>
        <p>
          If any of your information needs to be updated, please contact your building 
          administrator. Residents have read-only access to their unit information.
        </p>
      </div>
    </div>
  );
}

