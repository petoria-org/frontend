import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { MapContainer, TileLayer, Marker, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";
import { NotificationToast } from "../NotificationToast/NotificationToast";
import HeartIcon from "../../assets/icons/heart.svg";
import LocationIcon from "../../assets/icons/location.svg";
import GenderIcon from "../../assets/icons/tick-circle.svg";
import AgeIcon from "../../assets/icons/clock.svg";
import PetIcon from "../../assets/icons/pet.svg";
import BackIcon from "../../assets/icons/arrow-left.svg";
import ContactInfoIcon from "../../assets/icons/stickynote.svg";
import "../../styles/ShowDetailsAdopt.css";
import { config } from "../../config";
import { getFallbackPetImage } from "../../utils/postImages";
import { getPetType } from "../../utils/petTypes";
import { getChatWithUser , getUserById} from "../../Services/chatService";

const API_BASE_URL = config.API_BASE_URL;
const BACKEND_URL = config.BACKEND_URL;

const getPetAgeText = (petAge) => {
  if (!petAge) return "";
  if (typeof petAge === "object") {
    return petAge.display || petAge.value || "";
  }
  return String(petAge);
};

const formatPetAge = (petAge) => {
  const ageText = getPetAgeText(petAge);
  if (!ageText) return "";
  return ageText.includes("سال") ? ageText : `${ageText} سال`;
};

const HealthToggle = ({ checked, disabled = false, label }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      className={`health-toggle ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}`}
      disabled={true}
      tabIndex={-1}
    >
      <span className="switch-thumb" />
    </button>
  );
};

const getFullImageUrl = (imagePath) => {
  try {
    if (!imagePath) {
      return null;
    }

    if (typeof imagePath === 'object' && imagePath !== null) {
      if (imagePath.url) {
        return getFullImageUrl(imagePath.url);
      }
      if (imagePath.image) {
        return getFullImageUrl(imagePath.image);
      }
      if (imagePath.thumbnail) {
        return getFullImageUrl(imagePath.thumbnail);
      }
      return null;
    }
    
    const pathString = String(imagePath);
    
    if (pathString === "null" || pathString === "" || pathString === "undefined") {
      return null;
    }
    if (pathString.startsWith('http://') || pathString.startsWith('https://')) {
      return pathString;
    }
    
    if (pathString.startsWith('/')) {
      return `${BACKEND_URL}${pathString}`;
    }
    
    return `${BACKEND_URL}/${pathString}`;
  } catch (error) {
    console.error("خطا در ساخت URL تصویر:", error, imagePath);
    return null;
  }
};

const extractPetImages = (data) => {
  const images = [];
  
  console.log("داده‌های دریافتی برای استخراج تصاویر:", data);
  
  const imageFields = [
    'pet_image',
    'thumbnail',
    'image',
    'image_url',
    'images',
    'photo',
    'photos',
    'media',
    'media_files'
  ];
  
  imageFields.forEach(field => {
    if (data[field]) {
      console.log(`پیدا کردن فیلد تصویر: ${field}`, data[field]);
      
      if (Array.isArray(data[field])) {
        data[field].forEach((img, index) => {
          try {
            const imageUrl = getFullImageUrl(img);
            if (imageUrl) {
              images.push({
                id: `${field}_${index}`,
                src: imageUrl,
                alt: `تصویر حیوان ${index + 1}`,
                field: field
              });
              console.log(`تصویر اضافه شد از آرایه ${field}[${index}]:`, imageUrl);
            }
          } catch (error) {
            console.error(`خطا در پردازش تصویر ${field}[${index}]:`, error);
          }
        });
      } 
      
      else if (typeof data[field] === 'string' || typeof data[field] === 'object') {
     
        try {
          const imageUrl = getFullImageUrl(data[field]);
          if (imageUrl) {
            images.push({
              id: field,
              src: imageUrl,
              alt: 'تصویر حیوان',
              field: field
            });
            console.log(`تصویر اضافه شد از ${field}:`, imageUrl);
          }
        } catch (error) {
          console.error(`خطا در پردازش تصویر ${field}:`, error);
        }
      }
    }
  });
  
  if (data.originalData) {
    console.log("بررسی originalData برای تصاویر:", data.originalData);
    imageFields.forEach(field => {
      if (data.originalData[field]) {
        if (Array.isArray(data.originalData[field])) {
          data.originalData[field].forEach((img, index) => {
            try {
              const imageUrl = getFullImageUrl(img);
              if (imageUrl && !images.some(img => img.src === imageUrl)) {
                images.push({
                  id: `original_${field}_${index}`,
                  src: imageUrl,
                  alt: `تصویر حیوان ${index + 1}`,
                  field: field
                });
                console.log(`تصویر اضافه شد از original.${field}[${index}]:`, imageUrl);
              }
            } catch (error) {
              console.error(`خطا در پردازش تصویر original.${field}[${index}]:`, error);
            }
          });
        } else if (typeof data.originalData[field] === 'string' || typeof data.originalData[field] === 'object') {
          try {
            const imageUrl = getFullImageUrl(data.originalData[field]);
            if (imageUrl && !images.some(img => img.src === imageUrl)) {
              images.push({
                id: `original_${field}`,
                src: imageUrl,
                alt: 'تصویر حیوان',
                field: field
              });
              console.log(`تصویر اضافه شد از original.${field}:`, imageUrl);
            }
          } catch (error) {
            console.error(`خطا در پردازش تصویر original.${field}:`, error);
          }
        }
      }
    });
  }
 
  const uploadFields = [
    'uploaded_images',
    'pet_images',
    'animal_photos'
  ];
  
  uploadFields.forEach(field => {
    if (data[field]) {
      console.log(`بررسی فیلد آپلود: ${field}`, data[field]);
      if (Array.isArray(data[field])) {
        data[field].forEach((upload, index) => {
          try {
            if (upload && (upload.file || upload.image_url || upload.image)) {
              const imageUrl = getFullImageUrl(upload.file || upload.image_url || upload.image);
              if (imageUrl) {
                images.push({
                  id: `upload_${field}_${index}`,
                  src: imageUrl,
                  alt: `تصویر آپلود شده ${index + 1}`,
                  field: field
                });
                console.log(`تصویر اضافه شد از ${field}[${index}]:`, imageUrl);
              }
            }
          } catch (error) {
            console.error(`خطا در پردازش آپلود ${field}[${index}]:`, error);
          }
        });
      }
    }
  });
  
  console.log("کل تصاویر استخراج شده:", images);
  

  return images.slice(0, 7);
};

const DefaultMarkerIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  tooltipAnchor: [16, -28],
  shadowSize: [41, 41],
});
L.Marker.prototype.options.icon = DefaultMarkerIcon;

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
  className: "user-location-icon",
  iconSize: [60, 60],
  iconAnchor: [30, 30]
});

const DEFAULT_MAP_COORDINATES = [35.715298, 51.404343];

const parseCoordinateValue = (value) => {
  if (value === undefined || value === null || value === "") return null;
  const cleaned = typeof value === "string" ? value.replace(",", ".").trim() : value;
  const parsed = Number(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
};

const isValidLatitude = (value) => value !== null && value >= -90 && value <= 90;
const isValidLongitude = (value) => value !== null && value >= -180 && value <= 180;

const getPointFromCoordinateArray = (coords) => {
  if (!Array.isArray(coords) || coords.length < 2) return null;
  const first = parseCoordinateValue(coords[0]);
  const second = parseCoordinateValue(coords[1]);
  if (first === null || second === null) return null;

  if (isValidLatitude(first) && isValidLongitude(second)) {
    return { lat: first, lng: second };
  }
  if (isValidLatitude(second) && isValidLongitude(first)) {
    return { lat: second, lng: first };
  }
  return null;
};

const extractPointFromObject = (obj) => {
  if (!obj || typeof obj !== "object") return null;

  const lat = parseCoordinateValue(
    obj.latitude ??
      obj.lat ??
      obj.position?.lat ??
      obj.geo?.lat ??
      obj.coords?.lat ??
      obj.location?.lat
  );
  const lng = parseCoordinateValue(
    obj.longitude ??
      obj.lng ??
      obj.lon ??
      obj.position?.lng ??
      obj.geo?.lng ??
      obj.coords?.lng ??
      obj.location?.lng
  );

  if (isValidLatitude(lat) && isValidLongitude(lng)) {
    return { lat, lng };
  }

  const coordinateSource =
    obj.coordinates ??
    obj.coord ??
    obj.center ??
    obj.geometry?.coordinates ??
    obj.geo?.coordinates;

  return getPointFromCoordinateArray(coordinateSource);
};

const resolvePostLocation = (data) => {
  if (!data) return null;

  const candidates = [
    data.location,
    data.originalData?.location,
    data.locationData,
    data.geo_location,
    data,
  ];

  for (const candidate of candidates) {
    if (!candidate || typeof candidate !== "object") continue;

    const point = extractPointFromObject(candidate);
    if (!point) continue;

    const readable =
      candidate.readable ||
      candidate.display_name ||
      candidate.address ||
      candidate.name ||
      candidate.title ||
      "";

    return {
      ...point,
      readable,
    };
  }

  return null;
};

const escapeHTML = (value = "") => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
};

const createPetMarkerIcon = (label) => {
  const safeLabel = escapeHTML(label ? label.trim().slice(0, 20) : "حیوان");
  return L.divIcon({
    className: "pet-location-marker-wrapper",
    html: `
      <div class="pet-location-marker">
        <span class="pet-location-marker-core"></span>
        <span class="pet-location-marker-label">${safeLabel}</span>
      </div>
    `,
    iconSize: [42, 42],
    iconAnchor: [21, 42],
    popupAnchor: [0, -32],
  });
};

function MapAutoFocus({ center, userPoint, zoom = 15 }) {
  const map = useMap();

  useEffect(() => {
    if (!map) return;
    if (center && userPoint) {
      map.fitBounds([center, userPoint], { padding: [40, 40] });
      return;
    }
    if (center) {
      map.setView(center, zoom);
      return;
    }
    if (userPoint) {
      map.setView(userPoint, zoom);
    }
  }, [center, userPoint, zoom, map]);

  return null;
}

function LocationMapModal({
  isOpen,
  onClose,
  petPoint,
  petLabel,
  locationReadable,
  showNotification,
}) {
  const [userPoint, setUserPoint] = useState(null);
  const [accuracy, setAccuracy] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [showUserPoint, setShowUserPoint] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setUserPoint(null);
      setAccuracy(null);
      setIsLocating(false);
      setShowUserPoint(false);
    }
  }, [isOpen]);

  if (!isOpen || !petPoint) return null;

  const handleLocateUser = () => {
    if (!navigator.geolocation) {
      showNotification?.("مرورگر اجازه دسترسی به موقعیت را نمی‌دهد.", "error");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = [position.coords.latitude, position.coords.longitude];
        setUserPoint(coords);
        setAccuracy(position.coords.accuracy);
        setShowUserPoint(true);
        setIsLocating(false);
      },
      (error) => {
        const messages = {
          [error.PERMISSION_DENIED]: "دسترسی به موقعیت غیرفعال شده است.",
          [error.POSITION_UNAVAILABLE]: "مکان‌یابی در حال حاضر در دسترس نیست.",
          [error.TIMEOUT]: "درخواست موقعیت به زمان زیادی نیاز داشت.",
        };
        showNotification?.(messages[error.code] || "خطا در دریافت موقعیت کاربر.", "error");
        setIsLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleToggleUser = () => {
    if (showUserPoint) {
      setShowUserPoint(false);
      return;
    }
    handleLocateUser();
  };

  const openGoogleMaps = () => {
    if (!petPoint) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${petPoint.lat},${petPoint.lng}`;
    window.open(url, "_blank");
  };

  const petCoords = [petPoint.lat, petPoint.lng];
  const petCoordsDisplay = `${petCoords[0].toFixed(6)} , ${petCoords[1].toFixed(6)}`;
  const userCoordsDisplay = userPoint ? `${userPoint[0].toFixed(6)} , ${userPoint[1].toFixed(6)}` : "";
  const buttonLabel = showUserPoint
    ? "پنهان کردن موقعیت من"
    : isLocating
    ? "در حال پیدا کردن موقعیت..."
    : "نمایش موقعیت من";

  return (
    <div className="location-modal-backdrop" onClick={onClose}>
      <div className="location-modal" onClick={(event) => event.stopPropagation()}>
        <header className="location-modal-header">
          <div>
            <h3 className="location-modal-title">{petLabel || "موقعیت حیوان"}</h3>
            <p className="location-modal-subtitle">
              {locationReadable || "مختصات تقریبی حیوان نمایش داده می‌شود."}
            </p>
          </div>
          <button type="button" className="location-modal-close" onClick={onClose}>
            ×
          </button>
        </header>

        <div className="location-modal-card">
          <div className="location-map-wrapper">
            <MapContainer
              center={petCoords}
              zoom={15}
              scrollWheelZoom={true}
              className="location-map-container"
            >
              <MapAutoFocus center={petCoords} userPoint={showUserPoint ? userPoint : null} zoom={15} />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={petCoords} icon={createPetMarkerIcon(petLabel)} />
              {showUserPoint && userPoint && (
                <>
                  <Marker position={userPoint} icon={UserLocationIcon} />
                  {accuracy && (
                    <Circle
                      center={userPoint}
                      radius={accuracy}
                      pathOptions={{
                        fillColor: "#1c7bd1",
                        fillOpacity: 0.1,
                        color: "#1c7bd1",
                        weight: 2,
                        opacity: 0.4,
                      }}
                    />
                  )}
                </>
              )}
            </MapContainer>
          </div>

          <div className="location-modal-actions">
            <div className="location-modal-action-row">
              <button
                type="button"
                className={`location-modal-button ${showUserPoint ? "active" : ""}`}
                onClick={handleToggleUser}
                disabled={isLocating}
              >
                {buttonLabel}
              </button>
              <button
                type="button"
                className="location-modal-button secondary"
                onClick={openGoogleMaps}
              >
                مشاهده در گوگل مپ
              </button>
            </div>
            {showUserPoint && accuracy && (
              <span className="location-modal-accuracy">دقت حدوداً {Math.round(accuracy)} متر</span>
            )}
            <div className="location-modal-coords">
              <span className="coords-label">مختصات حیوان</span>
              <span className="coords-value">{petCoordsDisplay}</span>
            </div>
            {showUserPoint && (
              <div className="location-modal-coords">
                <span className="coords-label">مختصات شما</span>
                <span className="coords-value">{userCoordsDisplay || "در حال به‌روزرسانی..."}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export const ShowDetailsAdopt = ({ postId: propPostId, postType: propPostType, postData: propPostData }) => {
  const [isAdoptionPost, setIsAdoptionPost] = useState(false);
  const [healthStatus, setHealthStatus] = useState({
    has_birth_certificate: false,
    vaccination: false,
    steriliz: false
  });
  
  const [contactInfo, setContactInfo] = useState({
    name: "",
    email: ""
  });
  const [chatChecking, setChatChecking] = useState(false);
  
  const [petDetails, setPetDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postData, setPostData] = useState(null);
  const [petImages, setPetImages] = useState([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [recipientUser, setRecipientUser] = useState(null);
  const [notification, setNotification] = useState(null);
  const showNotification = (message, type = "error") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };
  
  const navigate = useNavigate();
  const location = useLocation();

  const [showLocationModal, setShowLocationModal] = useState(false);

  const routeStatePostData = location.state?.postData;
  const activePostData = postData || propPostData || routeStatePostData || null;
  const petLocation = useMemo(() => resolvePostLocation(activePostData), [activePostData]);
  const locationLabelFallback = "U.UcOU+ U+OU.O'OrOæ";
  const locationText =
    activePostData?.location?.readable ||
    activePostData?.location ||
    activePostData?.originalData?.location?.readable ||
    activePostData?.originalData?.location ||
    petLocation?.readable ||
    locationLabelFallback;
  const hasLocationCoordinates = Boolean(petLocation);
  const petMapLabel =
    activePostData?.pet_name ||
    activePostData?.title ||
    activePostData?.originalData?.pet_name ||
    "U.U^U,O1UOO¦ U+OU.";

  const handleLocationClick = () => {
    if (!hasLocationCoordinates) {
      showNotification("موقعیت دقیق حیوان ثبت نشده است.", "error");
      return;
    }
    setShowLocationModal(true);
  };

  const closeLocationModal = () => setShowLocationModal(false);

  
  useEffect(() => {
    const stateData = propPostData || location.state?.postData || null;
    const stateId = propPostId || location.state?.postId || null;
    const stateType = propPostType || location.state?.postType || null;
    const queryId = new URLSearchParams(window.location.search).get("id");
    const resolvedId = stateId || stateData?.rawId || queryId;
    
    console.log("داده‌های دریافتی:", stateData);
    console.log("آدرس بک‌اند:", BACKEND_URL);
    
    if (resolvedId) {
      fetchPostDetails(resolvedId, stateType, true);
      return;
    }

    if (stateData) {
      setPostData(stateData);
      initializeData(stateData);
      return;
    }

    setLoading(false);
  }, [propPostData, propPostId, propPostType, location]);
    
    useEffect(() => {
    const sourceData = getPostSourceData();
    const recipientId = sourceData?.user_id ?? null;

    if (!recipientId) {
      setRecipientUser(null);
      return;
    }

    let cancelled = false;

    (async () => {
      try {
        const res = await getUserById(recipientId);
        console.log("getUserById raw res =", res);

        if (cancelled) return;

        const user = res?.data ?? res;

        if (user?.username) {
          setRecipientUser(user);

          setContactInfo((prev) => ({
            ...prev,
            name: user.username ?? prev.name,
            email: user.email ?? prev.email,
          }));
        } else {
          setRecipientUser(null);
          console.warn("User response did not include username:", res);
        }
      } catch (e) {
        if (!cancelled) setRecipientUser(null);
        console.error("getUserById failed:", e);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [postData, propPostData, location.state?.postData]);

  const initializeData = (data) => {
    console.log("مقداردهی اولیه داده‌ها:", data);
    
    const isAdoption = data.type === "surrender" || 
                      data.originalData?.type === "surrender" ||
                      location.pathname.includes("surrender");
    
    setIsAdoptionPost(isAdoption);
    
    const details = [
      {
        label: "نوع حیوان",
        value: getPetType(data.pet_type),
        icon: PetIcon,
      },
      {
        label: "نژاد",
        value: data.breed || data.originalData?.breed || "نامشخص",
        icon: HeartIcon,
      },
      {
        label: "سن",
        value: formatPetAge(data.pet_age) || 
               formatPetAge(data.originalData?.pet_age) || 
               "نامشخص",
        icon: AgeIcon,
      },
      {
        label: "جنسیت",
        value: data.pet_sex === "male" ? "نر" : 
               data.pet_sex === "female" ? "ماده" : "نامشخص",
        icon: GenderIcon,
      },
    ];
    
    setPetDetails(details);
    
    if (isAdoption) {
      const newHealthStatus = {
        has_birth_certificate: data.has_birth_certificate || 
                              data.originalData?.has_birth_certificate || 
                              false,
        vaccination: data.vaccination || 
                    data.originalData?.vaccination || 
                    false,
        steriliz: data.steriliz || 
                 data.originalData?.steriliz || 
                 false,
      };
      setHealthStatus(newHealthStatus);
    } 
    else {
      setHealthStatus({
        has_birth_certificate: false,
        vaccination: false,
        steriliz: false
      });
    }
    
    const contactEmail = data.contact_email || 
                        data.user_email || 
                        data.originalData?.contact_email ||
                        data.originalData?.user_email ||
                        (data.contact_phone ? `تماس: ${data.contact_phone}` : "");
    
    setContactInfo({
      name: data.contact_name || 
            data.user_name || 
            data.originalData?.contact_name ||
            data.originalData?.user_name ||
            "",
      email: contactEmail || ""
    });


    let images = extractPetImages(data);

    if (images.length === 0) {
      const fallbackImage = getFallbackPetImage(data);
      if (fallbackImage) {
        images = [
          {
            id: "fallback",
            src: fallbackImage,
            alt: "تصویر پیش‌فرض حیوان",
            field: "fallback",
          },
        ];
      }
    }

    console.log("تصاویر استخراج شده:", images);
    setPetImages(images);
    
    setLoading(false);
  };

  const fetchPostDetails = async (id, explicitPostType, showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      
      let url = "";
      let postType = explicitPostType || "";

      if (postType === "adoption") {
        postType = "surrender";
      }
      
      if (postType === "lost") {
        url = `${API_BASE_URL}/posts/lost-posts/${id}/`;
      } else if (postType === "found") {
        url = `${API_BASE_URL}/posts/found-posts/${id}/`;
      } else if (postType === "surrender") {
        url = `${API_BASE_URL}/posts/surrender-posts/${id}/`;
        setIsAdoptionPost(true);
      } else if (window.location.pathname.includes("lost")) {
        url = `${API_BASE_URL}/posts/lost-posts/${id}/`;
        postType = "lost";
      } else if (window.location.pathname.includes("found")) {
        url = `${API_BASE_URL}/posts/found-posts/${id}/`;
        postType = "found";
      } else if (window.location.pathname.includes("surrender") || 
                 window.location.pathname.includes("adoption")) {
        url = `${API_BASE_URL}/posts/surrender-posts/${id}/`;
        postType = "surrender";
        setIsAdoptionPost(true);
      } else {
        url = `${API_BASE_URL}/posts/all/${id}/`;
      }
      
      console.log("درخواست به URL:", url);
      
      const response = await fetch(url);
      if (!response.ok) throw new Error("خطا در دریافت اطلاعات");
      
      const data = await response.json();
      console.log("داده‌های دریافتی از API:", data);
      
      const normalizedData = { ...data, type: postType || data.type };
      setPostData(normalizedData);
      initializeData(normalizedData);
    } catch (error) {
      console.error("خطا در دریافت جزئیات پست:", error);
      setLoading(false);
    }
  };



  const handleBackClick = () => {
    if (document.referrer.includes('/posts') || location.state?.fromPosts) {
      navigate(-1);
    } else {
      navigate('/posts'); 
    }
  };

  const getPostSourceData = () =>
    postData || propPostData || location.state?.postData || null;

  const resolveRecipientId = (data) => data?.user_id ?? null;

  const resolveRecipientName = () => {
    return recipientUser?.username || contactInfo?.name || "س";
  };

  const handleStartChat = async () => {
    if (chatChecking) return;

    const sourceData = getPostSourceData();
    const recipientId = resolveRecipientId(sourceData);

    if (!recipientId) {
      showNotification("کاربری برای گفتگو یافت نشد.", "error");
      return;
    }

    setChatChecking(true);
    try {
      const res = await getChatWithUser(recipientId);
      if (!res?.success) {
        let message = "خطا در بررسی گفتگوهای قبلی.";

        if(res?.message === "cannot_chat_with_self"){
          message = "شما نمی‌توانید با خودتان گفتگو کنید.";
        } else if(res?.message) {
          message = res?.message;
        }

        showNotification(message ,  "error");
        return;
      }

      const chatId = res?.data?.chat_id ?? null;

      const statePayload = {
        fromShowDetails: true,
        recipientId,
        recipientName: resolveRecipientName(),
      };

      if (chatId != null) {
        statePayload.openChatId = chatId;
      }

      navigate("/chats", { state: statePayload });
    } catch (error) {
      console.error("Failed to start chat:", error);
      showNotification("خطا در برقراری ارتباط. لطفا دوباره تلاش کنید.", "error");
    } finally {
      setChatChecking(false);
    }
  };

  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
  };

  const handleFullscreenToggle = () => {
    setIsFullscreen(!isFullscreen);
  };

  const handleImageError = (e) => {
    console.error("خطا در بارگذاری تصویر:", e.target.src);
    const parent = e.target.parentElement;
    const placeholder = document.createElement('div');
    placeholder.className = 'image-placeholder';
    placeholder.innerHTML = `
      <div class="placeholder-icon">🐾</div>
      <div class="placeholder-text">تصویر موجود نیست</div>
    `;
    parent.replaceChild(placeholder, e.target);
  };

  if (loading) {
    return (
      <div className="details-container">
        <div className="show-details-container loading">
          <div className="loading-spinner"></div>
          <div className="loading-message">در حال بارگذاری جزئیات...</div>
        </div>
      </div>
    );
  }

  const getStatusText = () => {
    if (isAdoptionPost) return "سرپرستی";
    
    const type = postData?.type || 
                postData?.originalData?.type || 
                "";
    
    switch(type) {
      case "lost":
        return "گم شده";
      case "found":
        return "پیدا شده";
      default:
        return "آگهی";
    }
  };

  return (
    <div className="details-container">
      <div className="show-details-shell">
        <div className="show-details-frame">
          <div className="show-details-card">
            <div className="show-details-scroll">
              <div className="show-details-inner">
                <div className="show-details-container">
                  <div className="back-button-container">
                    <button 
                      onClick={handleBackClick}
                      className="back-button"
                    >
                      <span className="back-text">بازگشت به لیست آگهی ها</span>
                      <img src={BackIcon} alt="بازگشت" className="back-icon" />
                    </button>
                  </div>

                  <div className="main-card">
                    <div className="card-content-wrapper">
                      <div className="content-sections">
                        <div className="details-section">
                          <div className="details-header">
                            <h1 className="pet-name-show-details">
                              {postData?.pet_name || 
                              postData?.title || 
                              postData?.originalData?.pet_name || 
                              "بدون نام"}
                            </h1>
                            <div 
                              className="card-badge" 
                              data-status={
                                isAdoptionPost ? "adoption" : 
                                postData?.type === "lost" ? "lost" : 
                                postData?.type === "found" ? "found" : "adoption"
                              }
                            >
                              <div class="status-pulse-detail-post"></div>
                              <span className="badge-text">
                                {getStatusText()}
                              </span>
                            </div>
                          </div>

                          <div className="details-grid">
                            {petDetails.map((detail, index) => (
                              <div 
                                key={index} 
                                className="detail-item"
                              >
                                <div className="detail-text">
                                  <div className="detail-value">
                                    {detail.value}
                                  </div>
                                  <div className="detail-label">
                                    {detail.label}
                                  </div>
                                </div>
                                <img
                                  src={detail.icon}
                                  alt={detail.label}
                                  className="detail-icon"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                              </div>
                            ))}
                          </div>

                          <div className="location-item">
                            <div className="detail-text">
                              <div className="detail-value">
                                {locationText}
                              </div>
                              <div className="detail-label">
                                مکان
                              </div>
                            </div>
                            <button
                              type="button"
                              className={`location-icon-button ${hasLocationCoordinates ? "" : "disabled"}`}
                              onClick={handleLocationClick}
                              title="نقشه"
                              disabled={!hasLocationCoordinates}
                            >
                              <img 
                                src={LocationIcon} 
                                alt="مکان" 
                                className="detail-icon"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <span className="location-icon-label">نقشه</span>
                            </button>
                          </div>

                          {isAdoptionPost &&(
                            <section className="section">
                              <h2 className="section-title-show-details">
                                بیماری ها
                              </h2>
                              <div className="diseases-content">
                                {postData?.diseases || 
                                 postData?.originalData?.diseases ||
                                 "این حیوان هیچ بیماری خاصی ندارد."}
                              </div>
                            </section>
                          )}

                          {postData?.type=="lost" || postData?.type == "found" &&(
                            <section className="section">
                              <h2 className="section-title-show-details">
                                علائم خاص
                              </h2>
                              <div className="diseases-content">
                                {postData?.Specific_symptoms || 
                                 postData?.originalData?.Specific_symptoms ||
                                 "این حیوان هیچ علامت خاصی ندارد."}
                              </div>
                            </section>
                          )}

                          {isAdoptionPost && (
                            <section className="section">
                              <h2 className="section-title-show-details">
                                وضعیت سلامت
                              </h2>
                              <div className="toggles-container">
                                <div className="toggle-item">
                                  <HealthToggle
                                    checked={healthStatus.has_birth_certificate}
                                    disabled={false}
                                    label="دارای شناسنامه"
                                  />
                                  <span className="toggle-label">
                                    دارای شناسنامه
                                  </span>
                                </div>
                                <div className="toggle-item">
                                  <HealthToggle
                                    checked={healthStatus.vaccination}
                                    disabled={false}
                                    label="واکسینه شده"
                                  />
                                  <span className="toggle-label">
                                    واکسینه شده
                                  </span>
                                </div>
                                <div className="toggle-item">
                                  <HealthToggle
                                    checked={healthStatus.steriliz}
                                    disabled={false}
                                    label="عقیم شده"
                                  />
                                  <span className="toggle-label">
                                    عقیم شده
                                  </span>
                                </div>
                              </div>
                            </section>
                          )}

                          <section className="section">
                            <h2 className="section-title-show-details">
                              توضیحات
                            </h2>
                            <div className="description-content">
                              {postData?.description || 
                               postData?.originalData?.description || 
                               "توضیحاتی برای این آگهی ثبت نشده است."}
                            </div>
                          </section>

                          <section className="contact-section">
                            <div className="contact-container">
                              <div className="contact-header">
                                <img 
                                  src={ContactInfoIcon} 
                                  alt="اطلاعات تماس" 
                                  className="contact-icon-show-details"
                                  onError={(e) => {
                                    e.target.style.display = 'none';
                                  }}
                                />
                                <h2 className="contact-title">
                                  اطلاعات تماس
                                </h2>
                              </div>

                              <div className="contact-fields">
                                <div className="contact-field">
                                  <label className="field-label">
                                    ثبت کننده آگهی
                                  </label>
                                  <input
                                    type="text"
                                    placeholder="نام و نام خانوادگی"
                                    value={contactInfo.name}
                                    readOnly
                                    className="contact-input readonly"
                                  />
                                </div>
                                <div className="contact-field">
                                  <label className="field-label">
                                    ایمیل
                                  </label>
                                  <input
                                    type="email"
                                    placeholder="آدرس ایمیل"
                                    value={contactInfo.email}
                                    readOnly
                                    className="contact-input readonly"
                                  />
                                </div>
                              </div>

                              <p className="contact-note">
                                اطلاعات تماس فقط برای ارتباط با ثبت کننده آگهی است
                              </p>
                            </div>
                          </section>

                          <button 
                            onClick={handleStartChat}
                            className="start-chat-button"
                            disabled={chatChecking}
                          >
                            شروع گفتگو
                          </button>
                        </div>

                        <div className="gallery-section">
                          <div className="gallery-container">
                            <div className="main-image-frame">
                              <div className={`main-image-wrapper ${isFullscreen ? 'fullscreen' : ''}`}>
                                {petImages.length > 0 ? (
                                  <img
                                    src={petImages[selectedImageIndex]?.src}
                                    alt={petImages[selectedImageIndex]?.alt || "تصویر اصلی حیوان"}
                                    className="main-display-image"
                                    onError={handleImageError}
                                  />
                                ) : (
                                  <div className="image-placeholder-large">
                                    <div className="placeholder-icon-large">🐾</div>
                                    <div className="placeholder-text-large">تصویر حیوان موجود نیست</div>
                                  </div>
                                )}
                                {petImages.length > 0 && (
                                  <button 
                                    className="fullscreen-toggle"
                                    onClick={handleFullscreenToggle}
                                    title="نمایش تمام صفحه"
                                  >
                                    ⛶
                                  </button>
                                )}
                              </div>
                            </div>
                            {petImages.length > 1 && (
                              <div className="image-dots-container">
                                <div className="image-dots">
                                  {petImages.map((_, index) => (
                                    <button
                                      key={index}
                                      className={`image-dot ${index === selectedImageIndex ? 'active' : ''}`}
                                      onClick={() => handleImageClick(index)}
                                      aria-label={`تصویر ${index + 1}`}
                                    />
                                  ))}
                                </div>
                              </div>
                            )}

                            {petImages.length > 1 && (
                              <div className="other-images-container">
                                <div className="other-images-title">
                                  <span>سایر تصاویر</span>
                                  <span className="images-count">{petImages.length - 1} تصویر</span>
                                </div>
                                <div className="other-images-grid">
                                  {petImages.map((image, index) => (
                                    index !== selectedImageIndex && (
                                      <div 
                                        key={image.id}
                                        className="other-image-item"
                                        onClick={() => handleImageClick(index)}
                                      >
                                        <img
                                          src={image.src}
                                          alt={image.alt}
                                          className="other-image"
                                          onError={handleImageError}
                                        />
                                        <div className="image-overlay">
                                          <span className="view-text">مشاهده</span>
                                        </div>
                                      </div>
                                    )
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {isFullscreen && petImages.length > 0 && (
                    <div className="fullscreen-modal" onClick={handleFullscreenToggle}>
                      <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                        <button className="close-fullscreen" onClick={handleFullscreenToggle}>
                          ✕
                        </button>
                        <img
                          src={petImages[selectedImageIndex]?.src}
                          alt="تصویر تمام صفحه"
                          className="fullscreen-image"
                          onError={handleImageError}
                        />
                        <div className="fullscreen-navigation">
                          {petImages.map((_, index) => (
                            <button
                              key={index}
                              className={`fullscreen-dot ${index === selectedImageIndex ? 'active' : ''}`}
                              onClick={() => handleImageClick(index)}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <LocationMapModal
        isOpen={showLocationModal}
        onClose={closeLocationModal}
        petPoint={petLocation}
        petLabel={petMapLabel}
        locationReadable={locationText}
        showNotification={showNotification}
      />

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
};
