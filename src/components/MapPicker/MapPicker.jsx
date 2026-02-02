import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap, Circle } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from 'leaflet';
import { NotificationToast } from "../NotificationToast";
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import '../../styles/MapPicker.css';

const DefaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const UserLocationIcon = L.divIcon({
  html: `
    <div style="position: relative; width: 60px; height: 60px;">
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        background: #1c7bd1;
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 0 0 4px rgba(28, 123, 209, 0.3),
                    0 0 20px rgba(28, 123, 209, 0.5);
        z-index: 1000;
      "></div>
      <div style="
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 40px;
        height: 40px;
        border: 2px solid rgba(28, 123, 209, 0.3);
        border-radius: 50%;
        animation: pulse 2s infinite;
      "></div>
      <style>
        @keyframes pulse {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 1;
          }
          100% {
            transform: translate(-50%, -50%) scale(2);
            opacity: 0;
          }
        }
      </style>
    </div>
  `,
  className: 'user-location-icon',
  iconSize: [60, 60],
  iconAnchor: [30, 30]
});

function ChangeView({ center, zoom }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

function ClickHandler({ setPoint }) {
  useMapEvents({
    click(e) {
      setPoint([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

function LocationController({ onLocationFound, isLocating, userLocation, accuracy , showNotification }) {
  const map = useMap();

  useEffect(() => {
    if (userLocation && userLocation.length === 2) {
      map.setView(userLocation, 16);
    }
  }, [userLocation, map]);

  const handleLocate = useCallback(() => {
    if (!navigator.geolocation) {
      showNotification?.("مرورگر شما از GPS پشتیبانی نمی‌کند", "error");
      return;
    }

    onLocationFound(null, true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        onLocationFound([latitude, longitude], false, accuracy);
      },
      (error) => {
        console.error("خطا در دریافت موقعیت:", error);
        let errorMessage = "خطا در دریافت موقعیت";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "دسترسی به موقعیت مکانی رد شد. لطفاً در تنظیمات مرورگر دسترسی را فعال کنید.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "اطلاعات موقعیت در دسترس نیست.";
            break;
          case error.TIMEOUT:
            errorMessage = "دریافت موقعیت زمان‌بر شد.";
            break;
        }
        showNotification?.(errorMessage, "error");
        onLocationFound(null, false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, [onLocationFound]);

  return (
    <div className="location-control-wrapper">
      <button 
        className={`location-btn ${isLocating ? 'locating' : ''} ${userLocation ? 'active' : ''}`}
        onClick={handleLocate}
        disabled={isLocating}
        title="نمایش موقعیت من"
      >
        {isLocating ? (
          <div className="location-spinner">
            <div className="spinner-inner"></div>
          </div>
        ) : (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z" 
              fill={userLocation ? "#1c7bd1" : "currentColor"}/>
          </svg>
        )}
        <span className="location-text">
          {isLocating ? 'در حال دریافت موقعیت...' : 'موقعیت من'}
        </span>
      </button>
      
      {userLocation && accuracy && (
        <div className="accuracy-info">
          <span className="accuracy-text">دقت: ≈{Math.round(accuracy)} متر</span>
        </div>
      )}
    </div>
  );
}

function SearchResults({ results, onSelect, loading, onClose }) {
  if (loading) {
    return (
      <div className="search-results">
        <div className="search-results-header">
          <h3>نتایج جستجو</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="loading-results">
          <div className="spinner"></div>
          <p>در حال جستجو...</p>
        </div>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="search-results">
        <div className="search-results-header">
          <h3>نتایج جستجو</h3>
          <button onClick={onClose} className="close-btn">✕</button>
        </div>
        <div className="no-results">
          <p>نتیجه‌ای یافت نشد</p>
        </div>
      </div>
    );
  }

  return (
    <div className="search-results">
      <div className="search-results-header">
        <h3>نتایج جستجو ({results.length})</h3>
        <button onClick={onClose} className="close-btn">✕</button>
      </div>
      <div className="results-list">
        {results.map((result, index) => (
          <div
            key={index}
            className="result-item"
            onClick={() => onSelect(result)}
          >
            <div className="result-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#1c7bd1">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
            </div>
            <div className="result-content">
              <div className="result-title">
                {result.display_name || result.name || "بدون نام"}
              </div>
              <div className="result-details">
                <span className="result-type">
                  {result.type || result.category || "مکان"}
                </span>
                <span className="result-coords">
                  {parseFloat(result.lat).toFixed(4)}, {parseFloat(result.lon).toFixed(4)}
                </span>
              </div>
              {result.address && (
                <div className="result-address">
                  {[
                    result.address.road,
                    result.address.neighbourhood,
                    result.address.suburb,
                    result.address.city,
                    result.address.state,
                    result.address.country
                  ].filter(Boolean).join("، ")}
                </div>
              )}
            </div>
            <div className="result-select">انتخاب</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MapPicker({
  initialPoint = [35.715298, 51.404343],
  onLocationSelect,
  onClose,
  className = ""
}) {
  const [point, setPointInternal] = useState(initialPoint);
  const [query, setQuery] = useState("");
  const [address, setAddress] = useState({ 
    country: "", 
    city: "", 
    district: "", 
    readable: "",
    road: "",
    state: "",
    lat: "",
    lng: ""
  });
  const [loadingReverse, setLoadingReverse] = useState(false);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showResultsPanel, setShowResultsPanel] = useState(false);
  const [searchHistory, setSearchHistory] = useState([]);
  const searchInputRef = useRef(null);
  const [mapZoom, setMapZoom] = useState(13);
  const [mapKey, setMapKey] = useState(Date.now());
  const mapRef = useRef(null);
  const [userLocation, setUserLocation] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState(null);

  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  useEffect(() => {
    fetchReverseGeocode(point[0], point[1]);
  }, []);

  const fetchReverseGeocode = useCallback(async (lat, lng) => {
    setLoadingReverse(true);
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/reverse`, {
        params: {
          lat,
          lon: lng,
          format: "jsonv2",
          "accept-language": "fa",
        },
        headers: {
          'User-Agent': 'YourApp/1.0'
        }
      });
      
      const addr = res.data.address || {};
      const newAddress = {
        country: addr.country || "",
        city: addr.city || addr.town || addr.village || "",
        district: addr.suburb || addr.neighbourhood || addr.municipality || "",
        state: addr.state || "",
        road: addr.road || "",
        readable: res.data.display_name || `موقعیت: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        lat: lat.toString(),
        lng: lng.toString()
      };
      setAddress(newAddress);

    } catch (err) {
      showNotification("خطا در دریافت آدرس از روی نقشه. لطفاً دوباره تلاش کنید.", "error");
      const fallbackAddress = {
        country: "",
        city: "",
        district: "",
        readable: `موقعیت: ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        lat: lat.toString(),
        lng: lng.toString()
      };
      setAddress(fallbackAddress);
    } finally {
      setLoadingReverse(false);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchReverseGeocode(point[0], point[1]);
    }, 500);

    return () => clearTimeout(delayDebounce);
  }, [point, fetchReverseGeocode]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!query.trim()) {
      setShowResultsPanel(false);
      return;
    }

    setLoadingSearch(true);
    setShowResultsPanel(true);
    
    try {
      const res = await axios.get(`https://nominatim.openstreetmap.org/search`, {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 10,
          "accept-language": "fa",
          countrycodes: "ir",
          bounded: 1,
          viewbox: "44.0,25.0,63.5,39.5"
        },
        headers: {
          'User-Agent': 'YourApp/1.0'
        }
      });
      
      const results = res.data || [];
      setSearchResults(results);
      
      if (results.length > 0 && !searchHistory.find(item => item.query === query)) {
        setSearchHistory(prev => [{ query, results: results.length }, ...prev.slice(0, 4)]);
      }
      
    } catch (err) {
      showNotification("خطا در جستجوی آدرس. لطفاً دوباره تلاش کنید.", "error");
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleSelectResult = (result) => {
    const newPoint = [parseFloat(result.lat), parseFloat(result.lon)];
    setPointInternal(newPoint);
    setMapZoom(16);
    setQuery(result.display_name || "");
    setShowResultsPanel(false);
    setMapKey(Date.now());
  };

  const setPoint = (newPoint) => {
    setPointInternal(newPoint);
    setMapZoom(13);
  };

  const selectFromHistory = (historyItem) => {
    setQuery(historyItem.query);
    handleSearch();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setShowResultsPanel(false);
    }
    if (e.key === 'Enter' && !showResultsPanel) {
      handleSearch(e);
    }
  };

  const handleConfirmLocation = () => {
    if (onLocationSelect) {
      onLocationSelect({
        country: address.country,
        city: address.city,
        district: address.district,
        lat: point[0].toString(),
        lng: point[1].toString(),
        readable: address.readable,
        road: address.road,
        state: address.state
      });
    }
    if (onClose) {
      onClose();
    }
  };

  const handleLocationFound = (location, locating, accuracy = null) => {
    setIsLocating(locating);
    if (location) {
      setUserLocation(location);
      setPointInternal(location);
      setLocationAccuracy(accuracy);
      setMapZoom(16);
      setMapKey(Date.now());
      
      fetchReverseGeocode(location[0], location[1]);
    } else if (location === null) {
      setUserLocation(null);
      setLocationAccuracy(null);
    }
  };

  const memoizedAddressItems = useMemo(() => {
    const items = [];
    if (address.road) items.push({ label: "خیابان:", value: address.road });
    if (address.district) items.push({ label: "محله:", value: address.district });
    if (address.city) items.push({ label: "شهر:", value: address.city });
    if (address.state) items.push({ label: "استان:", value: address.state });
    if (address.country) items.push({ label: "کشور:", value: address.country });
    return items;
  }, [address]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    }, 300);
    
    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <div className={`map-picker-full ${className}`}>
      <div className="map-header">
        <div className="header-content">
          <div className="title-wrapper">
            <div className="map-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <h2 className="map-title">انتخاب موقعیت مکانی</h2>
          </div>
          <p className="map-subtitle">
            روی نقشه کلیک کنید یا آدرس مورد نظر را جستجو نمایید
          </p>
        </div>
      </div>

      <div className="search-container-map">
        <div className="search-wrapper-map">
          <form onSubmit={handleSearch} className="search-form-map">
            <div className="search-input-container-map">
              <div className="search-icon-map">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => query && setShowResultsPanel(true)}
                placeholder="جستجوی آدرس، مکان، کسب‌وکار، خیابان..."
                className="search-input-map"
                dir="rtl"
                autoComplete="off"
              />
              {query && (
                <button 
                  type="button" 
                  className="clear-search-map"
                  onClick={() => {
                    setQuery("");
                    setShowResultsPanel(false);
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                    <path d="M18 6 6 18M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="search-btn-map"
              disabled={loadingSearch || !query.trim()}
            >
              {loadingSearch ? (
                <div className="spinner-btn-map"></div>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"/>
                    <path d="m21 21-4.35-4.35"/>
                  </svg>
                  <span>جستجو</span>
                </>
              )}
            </button>
          </form>
        </div>

        {searchHistory.length > 0 && !query && (
          <div className="search-history-map">
            <div className="history-title-map">جستجوهای اخیر:</div>
            <div className="history-items-map">
              {searchHistory.map((item, index) => (
                <button
                  key={index}
                  className="history-item"
                  onClick={() => selectFromHistory(item)}
                >
                  <span className="history-query">{item.query}</span>
                  <span className="history-count">{item.results} نتیجه</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {showResultsPanel && (
          <SearchResults
            results={searchResults}
            loading={loadingSearch}
            onSelect={handleSelectResult}
            onClose={() => setShowResultsPanel(false)}
          />
        )}
      </div>

      <div className="map-content">
        <div className="map-wrapper">
          <div className="map-inner" key={mapKey}>
            <div className="map-overlay">
              <div className="map-tips">
                <div className="tip-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M12 16v-4M12 8h.01"/>
                  </svg>
                </div>
                <span>برای انتخاب موقعیت روی نقشه کلیک کنید</span>
              </div>
              <div className="map-coords">
                <span>{point[0].toFixed(6)} , {point[1].toFixed(6)}</span>
              </div>
            </div>
            <MapContainer
              ref={mapRef}
              center={point}
              zoom={mapZoom}
              className="leaflet-container-full"
              scrollWheelZoom={true}
              zoomControl={true}
              doubleClickZoom={true}
              whenReady={() => {
                setTimeout(() => {
                  if (mapRef.current) {
                    mapRef.current.invalidateSize();
                  }
                }, 100);
              }}
            >
              <ChangeView center={point} zoom={mapZoom} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <ClickHandler setPoint={setPoint} />
              <LocationController 
                onLocationFound={handleLocationFound}
                isLocating={isLocating}
                userLocation={userLocation}
                accuracy={locationAccuracy}
                showNotification={showNotification}
              />
              <Marker position={point} />
              
              {userLocation && (
                <>
                  <Marker 
                    position={userLocation} 
                    icon={UserLocationIcon}
                  />
                  {locationAccuracy && (
                    <Circle
                      center={userLocation}
                      radius={locationAccuracy}
                      pathOptions={{
                        fillColor: '#1c7bd1',
                        fillOpacity: 0.1,
                        color: '#1c7bd1',
                        weight: 2,
                        opacity: 0.3
                      }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          </div>
        </div>

        <div className="info-panel">
          <div className="info-card">
            <div className="info-header">
              <div className="header-title">
                <div className="location-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <h3>موقعیت انتخاب شده</h3>
              </div>
              {loadingReverse && (
                <div className="loading-indicator">
                  <div className="pulse"></div>
                  <span>در حال به‌روزرسانی...</span>
                </div>
              )}
            </div>

            {userLocation && (
              <div className="user-location-section">
                <div className="section-title">
                  <div className="title-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  </div>
                  <span>موقعیت من</span>
                </div>
                <div className="user-location-card">
                  <div className="user-location-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#1c7bd1">
                      <path d="M12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4zm8.94 3A8.994 8.994 0 0 0 13 3.06V1h-2v2.06A8.994 8.994 0 0 0 3.06 11H1v2h2.06A8.994 8.994 0 0 0 11 20.94V23h2v-2.06A8.994 8.994 0 0 0 20.94 13H23v-2h-2.06zM12 19c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                    </svg>
                  </div>
                  <div className="user-location-content">
                    <div className="user-location-title">موقعیت فعلی شما</div>
                    <div className="user-location-coords">
                      {userLocation[0].toFixed(6)}, {userLocation[1].toFixed(6)}
                    </div>
                    {locationAccuracy && (
                      <div className="user-location-accuracy">
                        <span className="accuracy-dot"></span>
                        دقت: حدود {Math.round(locationAccuracy)} متر
                      </div>
                    )}
                  </div>
                  <button 
                    className="use-location-btn"
                    onClick={() => {
                      setPointInternal(userLocation);
                      setMapZoom(16);
                      setMapKey(Date.now());
                    }}
                  >
                    استفاده از این موقعیت
                  </button>
                </div>
              </div>
            )}

            <div className="coordinates-section">
              <div className="section-title">
                <div className="title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="m12 2 7 7-7 7-7-7 7-7z"/>
                  </svg>
                </div>
                <span>مختصات جغرافیایی</span>
              </div>
              <div className="coordinates-container">
                <div className="coord-item">
                  <div className="coord-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M12 2a15.3 15.3 0 0 0-3 4.53A15.3 15.3 0 0 0 6 10c0 4.5 6 9 6 9s6-4.5 6-9a15.3 15.3 0 0 0-3-3.47A15.3 15.3 0 0 0 12 2Z"/>
                    </svg>
                  </div>
                  <div className="coord-content">
                    <div className="coord-label">عرض جغرافیایی</div>
                    <div className="coord-value">{point[0].toFixed(6)}</div>
                  </div>
                </div>
                <div className="coord-item">
                  <div className="coord-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M2 12a10.5 10.5 0 0 1 4.53-3A10.5 10.5 0 0 1 10 6c4.5 0 9 6 9 6s-4.5 6-9 6a10.5 10.5 0 0 1-3.47-3A10.5 10.5 0 0 1 2 12Z"/>
                    </svg>
                  </div>
                  <div className="coord-content">
                    <div className="coord-label">طول جغرافیایی</div>
                    <div className="coord-value">{point[1].toFixed(6)}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="address-section">
              <div className="section-title">
                <div className="title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                </div>
                <span>آدرس</span>
              </div>
              <div className="address-list">
                {memoizedAddressItems.map((item, index) => (
                  <div key={index} className="address-item">
                    <div className="address-icon">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                        {item.label === "خیابان:" && <path d="M4 12h16M4 6h16M4 18h16"/>}
                        {item.label === "محله:" && <rect x="3" y="3" width="18" height="18" rx="2"/>}
                        {item.label === "شهر:" && <path d="M3 21h18M9 8h6M9 12h6M9 16h6M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16"/>}
                        {item.label === "استان:" && <path d="M12 2a10 10 0 1 0 10 10H12V2Z"/>}
                        {item.label === "کشور:" && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/>}
                      </svg>
                    </div>
                    <div>
                      <div className="address-label">{item.label}</div>
                      <div className="address-value">{item.value}</div>
                    </div>
                  </div>
                ))}
                <div className="full-address">
                  <div className="full-address-icon">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                  <div>
                    <div className="address-label">آدرس کامل</div>
                    <div className="address-text">{address.readable}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="actions-section">
              <div className="section-title">
                <div className="title-icon">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1c7bd1" strokeWidth="2">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1M6 8h-1a4 4 0 1 0 0 8h1M8 12h8"/>
                  </svg>
                </div>
                <span>عملیات</span>
              </div>
              <div className="action-buttons">
                <button 
                  className="action-btn secondary"
                  onClick={onClose}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 6L5 18"/>
                    <path d="M5 6l14 12"/>
                  </svg>
                  انصراف
                </button>
                <button 
                  className="action-btn primary"
                  onClick={handleConfirmLocation}
                  disabled={loadingReverse}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5"/>
                  </svg>
                  تأیید و بازگشت
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
          position="top-right"
        />
      )}
    </div>
  );
}
