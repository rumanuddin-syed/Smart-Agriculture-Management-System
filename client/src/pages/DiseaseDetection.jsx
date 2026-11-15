import { useState, useRef } from 'react';
import axios from 'axios';
import { Microscope, UploadCloud, AlertCircle, CheckCircle, Leaf, ShieldAlert, RefreshCw, HelpCircle, XCircle } from 'lucide-react';

const formatTitle = (label) => {
  if (!label) return '';
  return label
    .replace(/___/g, ' - ')
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const DiseaseDetection = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const fileInputRef = useRef(null);

  const resetForm = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileSelect = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Please select a valid image file (JPG, PNG, WEBP).');
        return;
      }
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setError('');
      setResult(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (!droppedFile.type.startsWith('image/')) {
        setError('Please drop a valid image file.');
        return;
      }
      setFile(droppedFile);
      setPreview(URL.createObjectURL(droppedFile));
      setError('');
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an image first.');
      return;
    }
    if (loading) return;

    setLoading(true);
    setError('');
    
    const formData = new FormData();
    formData.append('leafImage', file);

    try {
      const res = await axios.post('/api/disease-detection/detect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to analyze image. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Determine state
  const status = result?.status || (result?.prediction ? 'confident' : null);
  const isHealthy = result?.health?.label === 'healthy' || 
                    result?.prediction?.toLowerCase().includes('healthy') ||
                    result?.advisory?.is_healthy;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-agri-forest flex items-center justify-center gap-3">
          <Microscope className="h-8 w-8 text-agri-emerald" />
          AI Plant Disease Diagnosis Pipeline
        </h1>
        <p className="text-gray-600 mt-3 max-w-2xl mx-auto">
          Upload a clear photograph of a single plant leaf. Our multi-stage calibrated neural ensemble identifies crops, diagnoses healthy vs. diseased leaves across 116 plant conditions, and filters out-of-distribution photos.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {/* Upload Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100 flex flex-col h-full">
          <h2 className="text-xl font-bold text-agri-forest mb-6 flex items-center gap-2">
            <UploadCloud className="h-5 w-5 text-agri-emerald" />
            Upload Image
          </h2>
          
          <div 
            className="flex-grow border-2 border-dashed border-agri-emerald/30 rounded-xl bg-agri-light/50 flex flex-col items-center justify-center p-6 text-center cursor-pointer hover:bg-agri-light transition-colors min-h-[300px]"
            onClick={() => fileInputRef.current.click()}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            {preview ? (
              <img src={preview} alt="Leaf Preview" className="max-h-64 object-contain rounded-lg shadow-sm" />
            ) : (
              <>
                <Leaf className="h-16 w-16 text-agri-emerald/50 mb-4" />
                <p className="text-agri-forest font-medium">Click or drag & drop leaf image here</p>
                <p className="text-sm text-gray-500 mt-2">Supports JPG, PNG, WEBP (Max 10MB)</p>
              </>
            )}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileSelect} 
              accept="image/*" 
              className="hidden" 
            />
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-4 justify-between items-center">
            {file && (
              <button 
                onClick={resetForm}
                className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
              >
                Clear Image
              </button>
            )}
            <button 
              onClick={handleUpload} 
              disabled={!file || loading}
              className="btn-primary w-full sm:w-auto px-8 py-3"
            >
              {loading ? 'Analyzing with AI...' : 'Scan for Diseases'}
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-50 text-red-700 p-3 rounded-lg flex items-start gap-2 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Results Section */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-emerald-100">
          <h2 className="text-xl font-bold text-agri-forest mb-6 border-b border-gray-100 pb-4">
            Diagnosis Result
          </h2>
          
          {!result && !loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
              <Microscope className="h-16 w-16 mb-4 opacity-50" />
              <p>Upload an image to see the diagnosis here.</p>
            </div>
          )}
          
          {loading && (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-agri-emerald mb-4"></div>
              <p className="text-agri-forest font-medium animate-pulse">Running Multi-Stage Pipeline...</p>
              <p className="text-xs text-gray-500 mt-2">Validating quality, crop identification & ensemble diagnosis</p>
            </div>
          )}

          {result && (
            <div className="animate-fade-in-up space-y-6">
              
              {/* STATUS: CONFIDENT */}
              {status === 'confident' && (
                <>
                  <div className={`p-6 rounded-xl text-center ${isHealthy ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                    {isHealthy ? (
                      <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-2" />
                    ) : (
                      <ShieldAlert className="h-12 w-12 text-orange-500 mx-auto mb-2" />
                    )}
                    
                    <h3 className="text-2xl font-bold text-gray-800 capitalize mb-1">
                      {formatTitle(result.prediction)}
                    </h3>
                    <p className="text-sm font-medium text-gray-500 capitalize mb-3">
                      Crop: {result.crop?.name ? formatTitle(result.crop.name) : (result.advisory?.crop_name || 'Detected')}
                    </p>
                    
                    <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full border shadow-sm text-sm font-medium text-gray-700">
                      <span className="w-2 h-2 rounded-full bg-agri-emerald"></span>
                      Confidence: {(Number(result.confidence || 0) * 100).toFixed(1)}%
                    </div>

                    {isHealthy && (
                      <p className="text-xs text-gray-500 mt-3 max-w-sm mx-auto">
                        Note: A healthy leaf reading indicates no visible symptoms for supported diseases, but routine plant monitoring is still advised.
                      </p>
                    )}
                  </div>

                  {/* Information Cards */}
                  <div className="space-y-4">
                    {/* Characteristics */}
                    {result.disease_info?.characteristics && (
                      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
                        <h4 className="font-bold text-blue-900 flex items-center gap-2 mb-2 text-sm">
                          <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                          Characteristics & Symptoms
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {result.disease_info.characteristics}
                        </p>
                      </div>
                    )}

                    {/* Precautions */}
                    {result.disease_info?.precautions && result.disease_info.precautions !== 'N/A' && (
                      <div className="bg-amber-50/50 p-4 rounded-lg border border-amber-200">
                        <h4 className="font-bold text-amber-900 flex items-center gap-2 mb-2 text-sm">
                          <span className="w-1.5 h-4 bg-amber-500 rounded-full"></span>
                          Preventive Measures
                        </h4>
                        <p className="text-gray-700 text-sm leading-relaxed">
                          {result.disease_info.precautions}
                        </p>
                      </div>
                    )}

                    {/* Cure / Treatment (Only if not healthy) */}
                    {!isHealthy && result.disease_info?.cure && result.disease_info.cure !== 'N/A' && result.disease_info.cure !== 'Not needed.' && (
                      <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
                        <h4 className="font-bold text-gray-700 flex items-center gap-2 mb-2 text-sm">
                          <span className="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                          Treatment Guidance (Chemical)
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {result.disease_info.cure}
                        </p>
                      </div>
                    )}

                    {/* Organic Remedy */}
                    {result.disease_info?.organic_remedy && result.disease_info.organic_remedy !== 'N/A' && result.disease_info.organic_remedy !== 'Not needed.' && (
                      <div className="bg-agri-light/30 p-4 rounded-lg border border-agri-emerald/20">
                        <h4 className="font-bold text-agri-forest flex items-center gap-2 mb-2 text-sm">
                          <span className="w-1.5 h-4 bg-agri-emerald rounded-full"></span>
                          Organic & Eco Management
                        </h4>
                        <p className="text-gray-600 text-sm leading-relaxed">
                          {result.disease_info.organic_remedy}
                        </p>
                      </div>
                    )}

                    {/* Advisory notice */}
                    {result.disease_info?.advisory && (
                      <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-500 italic border border-gray-100">
                        Advisory: {result.disease_info.advisory}
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* STATUS: UNCERTAIN */}
              {status === 'uncertain' && (
                <div className="p-6 rounded-xl bg-amber-50 border border-amber-200 text-center space-y-4">
                  <HelpCircle className="h-12 w-12 text-amber-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-amber-900 mb-1">Diagnosis Uncertain</h3>
                    <p className="text-sm text-amber-700 max-w-md mx-auto">
                      {result.message || 'The model could not reach a confident conclusion with verified thresholds.'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-amber-100 text-xs text-gray-600 max-w-sm mx-auto text-left">
                    <p className="font-semibold mb-1 text-gray-700">Recommended Next Steps:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Expert review by an agronomist or local extension officer is recommended.</li>
                      <li>Try retaking the photo with good lighting and clear focus on a single leaf.</li>
                    </ul>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retake Photo
                  </button>
                </div>
              )}

              {/* STATUS: RETAKE */}
              {status === 'retake' && (
                <div className="p-6 rounded-xl bg-yellow-50 border border-yellow-200 text-center space-y-4">
                  <RefreshCw className="h-12 w-12 text-yellow-600 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-yellow-900 mb-1">Photo Retake Needed</h3>
                    <p className="text-sm text-yellow-800 max-w-md mx-auto">
                      {result.message || 'The image quality was insufficient for accurate diagnostic processing.'}
                    </p>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-yellow-100 text-xs text-gray-600 max-w-sm mx-auto text-left">
                    <p className="font-semibold mb-1 text-gray-700">Photo Tips:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Avoid blur and camera shake.</li>
                      <li>Ensure adequate natural light (avoid severe shadows or glare).</li>
                      <li>Hold camera close enough so the leaf occupies most of the frame.</li>
                    </ul>
                  </div>
                  <button 
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-yellow-600 hover:bg-yellow-700 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retake Photo
                  </button>
                </div>
              )}

              {/* STATUS: REJECTED */}
              {status === 'rejected' && (
                <div className="p-6 rounded-xl bg-red-50 border border-red-200 text-center space-y-4">
                  <XCircle className="h-12 w-12 text-red-500 mx-auto" />
                  <div>
                    <h3 className="text-xl font-bold text-red-900 mb-1">Image Not Recognized</h3>
                    <p className="text-sm text-red-700 max-w-md mx-auto">
                      {result.message || 'This image does not match any supported plant leaf in our database.'}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Please submit a clear, focused photograph showing a single supported crop leaf.
                  </p>
                  <button 
                    onClick={resetForm}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-medium text-sm transition-colors shadow-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Upload Another Photo
                  </button>
                </div>
              )}

            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DiseaseDetection;
