import React, { useState } from 'react';
import { apiRequest, API_BASE } from '../utils/api';

export default function BulkImageImportModal({ isOpen, onClose, onComplete }) {
  const [step, setStep] = useState(1); // 1: Upload, 2: Preview
  const [importFile, setImportFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [applyWatermark, setApplyWatermark] = useState(true);

  if (!isOpen) return null;

  const resetState = () => {
    setStep(1);
    setImportFile(null);
    setLoading(false);
    setPreviewData(null);
    setApplyWatermark(true);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handlePreview = async () => {
    if (!importFile) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', importFile);
    
    try {
      const res = await apiRequest('/api/products/import/images-zip/preview', {
        method: 'POST',
        body: formData
      });
      setPreviewData(res);
      setStep(2);
    } catch (err) {
      alert('Preview failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!previewData?.tempZipId) return;
    setLoading(true);
    
    try {
      await apiRequest('/api/products/import/images-zip/commit', {
        method: 'POST',
        body: {
          tempZipId: previewData.tempZipId,
          matches: previewData.matches,
          applyWatermark
        }
      });
      alert('Images imported successfully!');
      if (onComplete) onComplete();
      handleClose();
    } catch (err) {
      alert('Import failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target.classList.contains('modal-backdrop') && !loading && handleClose()}>
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h3>Bulk Import Images (ZIP)</h3>
          <button className="modal-close" onClick={handleClose} disabled={loading}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        
        <div className="modal-body">
          {step === 1 && (
            <>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-gray-text)', marginBottom: '15px' }}>
                Upload a ZIP file containing product images. The folder structure should match: <br/>
                <code>Category Name / Hamper Name / image.jpg</code>
              </p>
              
              <div className="form-group">
                <label className="form-label">ZIP File</label>
                <input 
                  type="file" 
                  accept=".zip" 
                  className="form-input" 
                  onChange={(e) => setImportFile(e.target.files[0])} 
                  style={{ padding: '8px' }} 
                  disabled={loading}
                />
              </div>

              <div className="form-group" style={{ marginTop: '15px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={applyWatermark} 
                    onChange={(e) => setApplyWatermark(e.target.checked)} 
                    disabled={loading}
                  />
                  Automatically generate watermarked versions of imported images
                </label>
              </div>
            </>
          )}

          {step === 2 && previewData && (
            <>
              <div style={{ padding: '15px', background: '#F3E8FF', borderRadius: '8px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--color-purple)' }}>Safety Preview</h4>
                <p style={{ margin: 0, fontSize: '0.9rem' }}>Found matches for <strong>{previewData.matches.length}</strong> products.</p>
              </div>

              <div style={{ maxHeight: '300px', overflowY: 'auto', border: '1px solid #eee', borderRadius: '6px' }}>
                {previewData.matches.length === 0 ? (
                  <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>No matching products found in the ZIP file.</div>
                ) : (
                  <table className="data-table" style={{ width: '100%', margin: 0 }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#fff', zIndex: 1 }}>
                      <tr>
                        <th style={{ padding: '10px' }}>Category</th>
                        <th style={{ padding: '10px' }}>Product</th>
                        <th style={{ padding: '10px' }}>Images Found</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewData.matches.map(m => (
                        <tr key={m.id}>
                          <td style={{ padding: '8px 10px' }}>{m.category || 'N/A'}</td>
                          <td style={{ padding: '8px 10px' }}>{m.name}</td>
                          <td style={{ padding: '8px 10px' }}>{m.imagesFound.length}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </>
          )}
        </div>
        
        <div className="modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          {step === 1 && (
            <>
              <button className="btn-admin-secondary" onClick={handleClose} disabled={loading}>Cancel</button>
              <button className="btn-admin" onClick={handlePreview} disabled={loading || !importFile}>
                {loading ? 'Analyzing ZIP...' : 'Preview Import'}
              </button>
            </>
          )}
          {step === 2 && (
            <>
              <button className="btn-admin-secondary" onClick={() => setStep(1)} disabled={loading}>Back</button>
              <button className="btn-admin" onClick={handleCommit} disabled={loading || previewData.matches.length === 0}>
                {loading ? 'Importing Images...' : 'Confirm & Import'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
