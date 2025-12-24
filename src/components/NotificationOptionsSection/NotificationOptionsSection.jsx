import React, { useState, useEffect } from "react";
import "../../styles/NotificationOptionsSection.css";
import searchIcon from '../../assets/icons/search.svg';
import checkmarkIcon from '../../assets/icons/Checkmark Color.svg';
import heartIcon from '../../assets/icons/Vector.svg';
import calendarIcon from '../../assets/icons/calendar-2.svg';
import locationIcon from '../../assets/icons/location.svg';
import uploadIcon from '../../assets/icons/direct-inbox.svg';
import contactIcon from '../../assets/icons/stickynote.svg';
import closeIcon from '../../assets/icons/close.svg';
import mapIcon from '../../assets/icons/map.svg';
import lockIcon from "../../assets/icons/lock.svg";
import { NotificationToast } from '../NotificationToast/NotificationToast';
import MapPicker from '../MapPicker/MapPicker';
import { ImageCropper } from "../ImageCropper";
import {
  getLostPostDetail,
  getFoundPostDetail,
  getSurrenderPostDetail,
  updateLostPost,
  updateFoundPost,
  updateSurrenderPost,
  deletePostImage
} from "../../Services/userService";
import moment from 'jalali-moment';
import fa from 'date-fns/locale/fa-IR';
import DatePickerModule from "react-multi-date-picker";
const DatePicker = DatePickerModule.default || DatePickerModule;
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import "../../styles/DatePickerCustom.css";
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';


const toInputDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso);
};

const toISO = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

const TimeInput = ({ value, onChange, disabled }) => {
  const [hours, setHours] = useState("00");
  const [minutes, setMinutes] = useState("00");
  
  useEffect(() => {
    if (value instanceof Date) {
      setHours(String(value.getHours()).padStart(2, '0'));
      setMinutes(String(value.getMinutes()).padStart(2, '0'));
    } else {
      setHours("00");
      setMinutes("00");
    }
  }, [value]);

  const handleHourChange = (e) => {
    const newHour = e.target.value;
    if (/^\d{0,2}$/.test(newHour)) {
      let hourNum = parseInt(newHour) || 0;
      if (hourNum > 23) hourNum = 23;
      const newHours = String(hourNum).padStart(2, '0');
      setHours(newHours);
      
      const newDate = value ? new Date(value) : new Date();
      newDate.setHours(hourNum);
      if (!value) {
        newDate.setMinutes(parseInt(minutes) || 0);
      }
      onChange(newDate);
    }
  };

  const handleMinuteChange = (e) => {
    const newMinute = e.target.value;
    if (/^\d{0,2}$/.test(newMinute)) {
      let minuteNum = parseInt(newMinute) || 0;
      if (minuteNum > 59) minuteNum = 59;
      const newMinutes = String(minuteNum).padStart(2, '0');
      setMinutes(newMinutes);
      
      const newDate = value ? new Date(value) : new Date();
      newDate.setMinutes(minuteNum);
      if (!value) {
        newDate.setHours(parseInt(hours) || 0);
      }
      onChange(newDate);
    }
  };

  const incrementHour = () => {
    let hourNum = parseInt(hours) || 0;
    hourNum = (hourNum + 1) % 24;
    const newHours = String(hourNum).padStart(2, '0');
    setHours(newHours);
    
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hourNum);
    if (!value) {
      newDate.setMinutes(parseInt(minutes) || 0);
    }
    onChange(newDate);
  };

  const decrementHour = () => {
    let hourNum = parseInt(hours) || 0;
    hourNum = hourNum - 1;
    if (hourNum < 0) hourNum = 23;
    const newHours = String(hourNum).padStart(2, '0');
    setHours(newHours);
    
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hourNum);
    if (!value) {
      newDate.setMinutes(parseInt(minutes) || 0);
    }
    onChange(newDate);
  };

  const incrementMinute = () => {
    let minuteNum = parseInt(minutes) || 0;
    let hourNum = parseInt(hours) || 0;
    
    minuteNum = minuteNum + 1;
    
    if (minuteNum > 59) {
      minuteNum = 0;
      hourNum = (hourNum + 1) % 24;
      setHours(String(hourNum).padStart(2, '0'));
    }
    
    const newMinutes = String(minuteNum).padStart(2, '0');
    setMinutes(newMinutes);
    
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hourNum);
    newDate.setMinutes(minuteNum);
    
    onChange(newDate);
  };

  const decrementMinute = () => {
    let minuteNum = parseInt(minutes) || 0;
    let hourNum = parseInt(hours) || 0;
    
    minuteNum = minuteNum - 1;
    
    if (minuteNum < 0) {
      minuteNum = 59;
      hourNum = hourNum - 1;
      if (hourNum < 0) hourNum = 23;
      setHours(String(hourNum).padStart(2, '0'));
    }
    
    const newMinutes = String(minuteNum).padStart(2, '0');
    setMinutes(newMinutes);
    
    const newDate = value ? new Date(value) : new Date();
    newDate.setHours(hourNum);
    newDate.setMinutes(minuteNum);
    
    onChange(newDate);
  };

  const handleWheel = (e, type) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -1 : 1;
    
    if (type === 'hour') {
      if (delta > 0) {
        incrementHour();
      } else {
        decrementHour();
      }
    } else {
      if (delta > 0) {
        incrementMinute();
      } else {
        decrementMinute();
      }
    }
  };

  return (
    <div className="time-selector-container">
      <div className="time-selector-wrapper">
        <div className="time-input-group-combined">
          <div className="time-input-field">
            <input
              type="number"
              value={hours}
              onChange={handleHourChange}
              className="time-input"
              maxLength={2}
              min="0"
              max="23"
              disabled={disabled}
              inputMode="numeric"
              pattern="[0-9]*"
              onWheel={(e) => handleWheel(e, 'hour')}
            />
          </div>
          
          <span className="time-colon">:</span>
          
          <div className="time-input-field">
            <input
              type="number"
              value={minutes}
              onChange={handleMinuteChange}
              className="time-input"
              maxLength={2}
              min="0"
              max="59"
              disabled={disabled}
              inputMode="numeric"
              pattern="[0-9]*"
              onWheel={(e) => handleWheel(e, 'minute')}
            />
          </div>
        </div>
        <div className="time-unit-label-combined">ساعت و دقیقه</div>
      </div>
    </div>
  );
};
const PersianDatePickerInput = React.forwardRef(({ value, onClick, placeholder, disabled, showTimeInput = false, onTimeChange, onChange }, ref) => (
  <div className="persian-datepicker-input-container">
    <div className="date-time-separate-inputs">
      <input
        type="text"
        value={value ? moment(value).locale('fa').format('jYYYY/jMM/jDD') : ""}
        onClick={onClick}
        ref={ref}
        className="form-input-with-icon date-input"
        placeholder="انتخاب تاریخ"
        readOnly
        disabled={disabled}
        style={{ marginBottom: '10px' }}
      />
      {showTimeInput && (
        <div className="time-input-section">
          <label className="time-input-label">زمان:</label>
          <TimeInput 
            value={value} 
            onChange={onTimeChange} 
            disabled={disabled}
          />
        </div>
      )}
    </div>
    <img 
      src={calendarIcon} 
      alt="Time" 
      className="form-input-icon"
      onClick={onClick}
      style={{ cursor: 'pointer', top: '28px' }}
    />
  </div>
));

PersianDatePickerInput.displayName = 'PersianDatePickerInput';

export const NotificationOptionsSection = ({ adData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    type: "",
    age: "",
    gender: "",
    location: "",
    lostTime: null,
    foundTime: null,
    specialSigns: "",
    description: "",
    status: "گم شده",
    images: [],
    imagePreview: "",
    breed: "",
    animalType: "",
    diseases: "",
    hasCertificate: false,
    isVaccinated: false,
    isSterilized: false,
    email: "",
    phone: "",
    contact_email: true,
    latitude: "",
    longitude: "",
    country: "",
    city: "",
    district: "",
    state: "",
    road: ""
  });

  const [selectedAdType, setSelectedAdType] = useState("lost");
  const [notification, setNotification] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(null);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [imageToDelete, setImageToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  useEffect(() => {
    if (!adData) return;

    const fetchDetail = async () => {
      try {
        let data;

        if (adData.status === "lost") {
          data = await getLostPostDetail(adData.id);
          setSelectedAdType("lost");
        } 
        else if (adData.status === "found") {
          data = await getFoundPostDetail(adData.id);
          setSelectedAdType("found");
        } 
        else {
          data = await getSurrenderPostDetail(adData.id);
          setSelectedAdType("adoption");
        }

        const locationData = data.location || {};

        const locationInfo = {
          lat: parseFloat(locationData.latitude) || 35.715298,
          lng: parseFloat(locationData.longitude) || 51.404343,
          country: locationData.country || "",
          city: locationData.city || "",
          district: locationData.district || "",
          state: locationData.state || "",
          road: locationData.road || "",
          readable: locationData.readable || ""
        };

        setSelectedLocation(
          locationData.latitude && locationData.longitude ? locationInfo : null
        );

        let lostTime = null;
        let foundTime = null;
        
        if (data.lost_time) {
          lostTime = new Date(data.lost_time);
        }
        
        if (data.found_time) {
          foundTime = new Date(data.found_time);
        }

    const backendImages = data.images?.map(img => {
      let imageUrl = img.image;
      if (imageUrl && !imageUrl.startsWith("http")) {
        if (imageUrl.startsWith("/")) {
          imageUrl = imageUrl.substring(1);
        }
        
        const BACKEND_URL = "http://localhost:8000";
        imageUrl = `${BACKEND_URL}/${imageUrl}`;
      }
      const timestamp = Date.now();
      const finalUrl = `${imageUrl}${imageUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
      
      return {
        id: img.id,
        backendId: img.id,
        file: null,
        isFromBackend: true,
        preview: finalUrl,
      };
    }) || [];

  

        setFormData({
          name: data.pet_name || "",
          type: data.title || "",
          age: data.pet_age || "",
          gender: data.pet_sex === "male" ? "نر" : "ماده",
          location: locationInfo.readable || "",
          lostTime: lostTime,
          foundTime: foundTime,
          specialSigns: data.Specific_symptoms || "",
          description: data.description || "",
          breed: data.breed || "",
          animalType: data.pet_type === "cat" ? "گربه" : "سگ",
          diseases: data.diseases || "",
          hasCertificate: data.has_birth_certificate || false,
          isVaccinated: data.vaccination || false,
          isSterilized: data.steriliz || false,
          images: backendImages,
          imagePreview: data.thumbnail || "",
          email: data.email || "",
          phone: data.phone || "",
          contact_email: data.contact_email !== undefined ? data.contact_email : true,
          latitude: locationData.latitude || "",
          longitude: locationData.longitude || "",
          country: locationData.country || "",
          city: locationData.city || "",
          district: locationData.district || "",
          state: locationData.state || "",
          road: locationData.road || ""
        });

      } catch (error) {
        console.error("Error fetching post detail:", error);
        setNotification({
          message: "خطا در دریافت اطلاعات آگهی",
          type: "error"
        });
      }
    };

    fetchDetail();
  }, [adData]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleToggleChange = (name) => {
    setFormData(prev => ({
      ...prev,
      [name]: !prev[name]
    }));
  };

  const handleTimeChangeLost = (time) => {
    setFormData(prev => ({
      ...prev,
      lostTime: time
    }));
  };

  const handleTimeChangeFound = (time) => {
    setFormData(prev => ({
      ...prev,
      foundTime: time
    }));
  };

  const handleDateChangeLost = (date) => {
    if (!date) {
      setFormData(prev => ({
        ...prev,
        lostTime: null
      }));
      return;
    }
    
    if (formData.lostTime) {
      const newDate = new Date(date);
      newDate.setHours(formData.lostTime.getHours());
      newDate.setMinutes(formData.lostTime.getMinutes());
      setFormData(prev => ({
        ...prev,
        lostTime: newDate
      }));
    } else {
      const newDate = new Date(date);
      newDate.setHours(0);
      newDate.setMinutes(0);
      setFormData(prev => ({
        ...prev,
        lostTime: newDate
      }));
    }
  };

  const handleDateChangeFound = (date) => {
    if (!date) {
      setFormData(prev => ({
        ...prev,
        foundTime: null
      }));
      return;
    }
    
    if (formData.foundTime) {
      const newDate = new Date(date);
      newDate.setHours(formData.foundTime.getHours());
      newDate.setMinutes(formData.foundTime.getMinutes());
      setFormData(prev => ({
        ...prev,
        foundTime: newDate
      }));
    } else {
      const newDate = new Date(date);
      newDate.setHours(0);
      newDate.setMinutes(0);
      setFormData(prev => ({
        ...prev,
        foundTime: newDate
      }));
    }
  };

  const handleImageUploadWithCrop = (e) => {
  const files = Array.from(e.target.files);
  
  if (files.length === 0) return;
  
  const file = files[0];
  const reader = new FileReader();
  
  reader.onload = (e) => {
    setImageToCrop(e.target.result);
    setCurrentImageIndex(null); 
    setCropModalOpen(true);
  };
  
  reader.readAsDataURL(file);
};
  const handleCropImageClick = (imageIndex) => {
    const image = formData.images[imageIndex];

    const cleanUrl = image.preview.split("?")[0];
    setImageToCrop(`${cleanUrl}?t=${Date.now()}`);

    setCurrentImageIndex(imageIndex);
    setCropModalOpen(true);
  };

const handleCropComplete = async (croppedResult) => {
  if (!croppedResult) return;
  
  try {
    const timestamp = Date.now();
    let imageUrl = croppedResult.image;

    if (!imageUrl.includes('?t=')) {
      imageUrl = `${imageUrl.split('?')[0]}?t=${timestamp}`;
    }
    
    const newImage = {
      id: timestamp + Math.random(), 
      file: null,
      backendId: croppedResult.backendId || croppedResult.id,
      isFromBackend: true,
      preview: imageUrl, 
      originalData: croppedResult.originalData
    };
    
    setFormData(prev => {
      if (currentImageIndex !== null) {
        const newImages = [...prev.images];
        newImages[currentImageIndex] = newImage;
        return { ...prev, images: newImages };
      } 
      
      else {
        return {
          ...prev,
          images: [...prev.images, newImage]
        };
      }
    });
    
    setNotification({
      message: currentImageIndex !== null 
        ? "عکس با موفقیت برش و ذخیره شد" 
        : "عکس جدید با موفقیت افزوده شد",
      type: "success"
    });
    
  } catch (error) {
    console.error("Error handling cropped image:", error);
    setNotification({
      message: "خطا در ذخیره‌سازی عکس",
      type: "error"
    });
  } finally {
    setCropModalOpen(false);
    setCurrentImageIndex(null);
  }
};

  const handleAdTypeSelect = (type) => {
    setSelectedAdType(type);
    const statusMap = {
      lost: "گم شده",
      found: "پیدا شده",
      adoption: "سرپرستی"
    };
    setFormData(prev => ({
      ...prev,
      status: statusMap[type]
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    
    const remainingSlots = 7 - formData.images.length;
    const filesToAdd = files.slice(0, remainingSlots);
    
    if (filesToAdd.length === 0) {
      setNotification({
        message: "شما حداکثر 7 عکس می‌توانید آپلود کنید",
        type: "error"
      });
      return;
    }

    const newImages = filesToAdd.map(file => {
      const reader = new FileReader();
      return new Promise((resolve) => {
        reader.onload = (e) => {
          resolve({
            file: file,
            preview: e.target.result,
            id: Date.now() + Math.random()
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(newImages).then(images => {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...images]
      }));
      
      if (images.length > 0) {
        setNotification({
          message: `${images.length} عکس با موفقیت آپلود شد`,
          type: "success"
        });
      }
    }).catch(error => {
      setNotification({
        message: "خطا در آپلود عکس‌ها",
        type: "error"
      });
    });
  };

  const handleRemoveImage = async (imageId) => {
      const imageToDelete = formData.images.find(img => img.id === imageId);
      
      if (!imageToDelete) return;
      
      if (imageToDelete.backendId) {
        setImageToDelete({
          id: imageId,
          backendId: imageToDelete.backendId,
          preview: imageToDelete.preview
        });
        setShowDeleteModal(true);
      } 
      
      else {
        setFormData(prev => ({
          ...prev,
          images: prev.images.filter(img => img.id !== imageId)
        }));
        
        setNotification({
          message: "عکس با موفقیت حذف شد",
          type: "success"
        });
      }
    }; 

  const confirmDeleteImage = async () => {
    if (!imageToDelete) return;
    
    try {
      setIsDeleting(true);
      
      await deletePostImage(imageToDelete.backendId);
      
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter(img => img.id !== imageToDelete.id)
      }));
      
      setNotification({
        message: "عکس با موفقیت از سرور حذف شد",
        type: "success"
      });

      setShowDeleteModal(false);
      setImageToDelete(null);
      
    } catch (error) {
      console.error("Error deleting image from server:", error);
      setNotification({
        message: "خطا در حذف عکس از سرور",
        type: "error"
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelDeleteImage = () => {
    setShowDeleteModal(false);
    setImageToDelete(null);
    setIsDeleting(false);
  };

  const handleRemoveAllImages = () => {
    setFormData(prev => ({
      ...prev,
      images: []
    }));
    setNotification({
      message: "تمام عکس‌ها با موفقیت حذف شدند",
      type: "success"
    });
  };

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
  };

  const handleLocationSelect = (locationData) => {
    const newLocation = {
      lat: parseFloat(locationData.lat),
      lng: parseFloat(locationData.lng),
      country: locationData.country || "",
      city: locationData.city || "",
      district: locationData.district || "",
      state: locationData.state || "",
      road: locationData.road || "",
      readable: locationData.readable || ""
    };

    setSelectedLocation(newLocation);

    setFormData(prev => ({
      ...prev,
      location: newLocation.readable,
      latitude: newLocation.lat.toString(),
      longitude: newLocation.lng.toString(),
      country: newLocation.country,
      city: newLocation.city,
      district: newLocation.district,
      state: newLocation.state,
      road: newLocation.road
    }));

    setShowMapPicker(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const locationPayload = selectedLocation
      ? {
          country: selectedLocation.country,
          city: selectedLocation.city,
          district: selectedLocation.district,
          state: selectedLocation.state,
          road: selectedLocation.road,
          latitude: selectedLocation.lat.toString(),
          longitude: selectedLocation.lng.toString(),
          readable: selectedLocation.readable
        }
      : null;

    const imageIds = formData.images
      .filter(img => img.backendId)
      .map(img => img.backendId);

    const payload = {
      title: formData.type,
      pet_name: formData.name,
      pet_type: formData.animalType === "گربه" ? "cat" : "dog",
      pet_sex: formData.gender === "نر" ? "male" : "female",
      pet_age: formData.age || null,
      Specific_symptoms: formData.specialSigns || "",
      description: formData.description,
      diseases: formData.diseases || "",
      has_birth_certificate: formData.hasCertificate,
      vaccination: formData.isVaccinated,
      steriliz: formData.isSterilized,
      contact_email: formData.contact_email,
      location: locationPayload
    };

    if (imageIds.length > 0) {
      payload.image_ids = imageIds;
    }

    if (formData.contact_email) {
      if (formData.email) payload.email = formData.email;
      if (formData.phone) payload.phone = formData.phone;
    } else {
      delete payload.email;
      delete payload.phone;
    }

    try {
      let result;
      if (selectedAdType === "lost") {
        payload.lost_time = toISO(formData.lostTime);
        result = await updateLostPost(adData.id, payload);
      } 
      
      else if (selectedAdType === "found") {
        payload.found_time = toISO(formData.foundTime);
        result = await updateFoundPost(adData.id, payload);
      } 
      
      else if (selectedAdType === "adoption") {
        result = await updateSurrenderPost(adData.id, payload);
      }

      showNotification("آگهی با موفقیت ویرایش شد", "success");
      
      setTimeout(() => {
        onSave(result || payload);
        setIsLoading(false);
      }, 1500);

    } catch (err) {
      console.error("Update error:", err);
      setIsLoading(false);
      showNotification("خطا در ویرایش آگهی. لطفاً دوباره تلاش کنید", "error");
    }
  };

  const renderLocationInfo = () => {
    if (!selectedLocation) {
      return (
        <div className="location-info-card empty">
          <div className="location-info-icon">
            <img src={mapIcon} alt="نقشه" />
          </div>
          <div className="location-info-content">
            <h4 className="location-info-title">موقعیت مکانی انتخاب نشده</h4>
            <p className="location-info-description">
              برای انتخاب موقعیت مکانی بر روی دکمه "انتخاب موقعیت مکانی" کلیک کنید
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="location-info-card">
        <div className="location-info-header">
          <div className="location-info-icon">
            <img src={locationIcon} alt="موقعیت" />
          </div>
          <h4 className="location-info-title">موقعیت انتخاب شده</h4>
        </div>
        
        <div className="location-details">
          <div className="location-detail-row">
            <span className="location-detail-label">مختصات:</span>
            <span className="location-detail-value">
              {selectedLocation.lat.toFixed(6)}، {selectedLocation.lng.toFixed(6)}
            </span>
          </div>
          
          {selectedLocation.country && (
            <div className="location-detail-row">
              <span className="location-detail-label">کشور:</span>
              <span className="location-detail-value">{selectedLocation.country}</span>
            </div>
          )}
          
          {selectedLocation.state && (
            <div className="location-detail-row">
              <span className="location-detail-label">استان:</span>
              <span className="location-detail-value">{selectedLocation.state}</span>
            </div>
          )}
          
          {selectedLocation.city && (
            <div className="location-detail-row">
              <span className="location-detail-label">شهر:</span>
              <span className="location-detail-value">{selectedLocation.city}</span>
            </div>
          )}
          
          {selectedLocation.district && (
            <div className="location-detail-row">
              <span className="location-detail-label">محله:</span>
              <span className="location-detail-value">{selectedLocation.district}</span>
            </div>
          )}
          
          {selectedLocation.road && (
            <div className="location-detail-row">
              <span className="location-detail-label">خیابان:</span>
              <span className="location-detail-value">{selectedLocation.road}</span>
            </div>
          )}
          
          <div className="location-full-address">
            <span className="location-detail-label">آدرس کامل:</span>
            <span className="location-detail-value-full">{selectedLocation.readable}</span>
          </div>
        </div>
        
        <button 
          type="button"
          className="change-location-btn"
          onClick={() => setShowMapPicker(true)}
          disabled={isLoading}
        >
          <img src={mapIcon} alt="تغییر موقعیت" />
          تغییر موقعیت
        </button>
      </div>
    );
  };

  const renderContent = () => {
    if (showMapPicker) {
      return (
        <div className="map-picker-modal">
          <MapPicker 
            initialPoint={selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : [35.715298, 51.404343]}
            onLocationSelect={handleLocationSelect}
            onClose={() => setShowMapPicker(false)}
            className="fullscreen-map"
          />
        </div>
      );
    }
  
    return (
      <div className="notification-options-section">
        <div className="notification-options-container">
          <div className="notification-options-content">
            <div className="notification-options-inner">
              
              <div className="form-section-header">
                <h2 className="notification-options-title">ویرایش آگهی</h2>
                <button 
                  onClick={onClose}
                  className="close-button"
                  disabled={isLoading}
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">نوع آگهی</h3>
                      <div className="ad-type-grid">
                        <div 
                          className={`ad-type-card ad-type-card-lost ${selectedAdType === "lost" ? "ad-type-card-active" : ""}`}
                          onClick={() => handleAdTypeSelect("lost")}
                        >
                          <div className="ad-type-card-content">
                            <img 
                              className="ad-type-icon ad-type-icon-lost" 
                              src={searchIcon} 
                              alt="گم شده"
                            />
                            <span className={`ad-type-label ad-type-label-lost ${selectedAdType === "lost" ? "ad-type-label-active" : ""}`}>
                              گم شده
                            </span>
                          </div>
                        </div>

                        <div 
                          className={`ad-type-card ad-type-card-found ${selectedAdType === "found" ? "ad-type-card-active" : ""}`}
                          onClick={() => handleAdTypeSelect("found")}
                        >
                          <div className="ad-type-card-content">
                            <img 
                              className="ad-type-icon ad-type-icon-found" 
                              src={checkmarkIcon} 
                              alt="پیدا شده"
                            />
                            <span className={`ad-type-label ad-type-label-found ${selectedAdType === "found" ? "ad-type-label-active" : ""}`}>
                              پیدا شده
                            </span>
                          </div>
                        </div>

                        <div 
                          className={`ad-type-card ad-type-card-adoption ${selectedAdType === "adoption" ? "ad-type-card-active" : ""}`}
                          onClick={() => handleAdTypeSelect("adoption")}
                        >
                          <div className="ad-type-card-content">
                            <img 
                              className="ad-type-icon ad-type-icon-adoption" 
                              src={heartIcon} 
                              alt="سرپرستی"
                            />
                            <span className={`ad-type-label ad-type-label-adoption ${selectedAdType === "adoption" ? "ad-type-label-active" : ""}`}>
                              سرپرستی
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">تصاویر حیوان</h3>

                      <div className="image-upload-main-container">
                        <div className="upload-container-header">
                          <div className="upload-header-info">
                            <span className="upload-header-title">گالری عکس‌ها</span>
                            <span className="upload-header-count">
                              {formData.images.length} از 7 عکس
                            </span>
                          </div>

                          {formData.images.length > 0 && (
                            <button 
                              type="button"
                              className="remove-all-images-btn-inside"
                              onClick={handleRemoveAllImages}
                              disabled={isLoading}
                            >
                              <img src={closeIcon} alt="حذف همه" className="remove-all-icon" />
                              حذف همه عکس‌ها
                            </button>
                          )}
                        </div>

                        <div className="upload-container-content">
                          <div className="uploaded-images-grid">
                            {formData.images.map((image, index) => (
                              <div
                                key={`${image.backendId || image.id}-${Date.now()}`}
                                className="image-gallery-item"
                              >
                                <div className="image-item-overlay">

                                    <img 
                                      src={image.preview} 
                                      alt={`تصویر ${index + 1}`} 
                                      className="gallery-image"
                                      onError={(e) => { 
                                        
                                        const originalUrl = image.preview.split('?')[0];
                                        const retryUrl = `${originalUrl}?retry=${Date.now()}`;
                                        
                                        e.target.src = retryUrl;
                                        
                                        e.target.onerror = () => {
                                          e.target.src = '/default-image.jpg';
                                          e.target.onerror = null; 
                                        };
                                      }}
                                      loading="lazy" 
                                    />
                                  <div className="image-actions">
                                    <div className="image-actions-left">
                                      <button 
                                        type="button"
                                        className="crop-image-btn"
                                        onClick={() => handleCropImageClick(index)}
                                        disabled={isLoading}
                                        title="برش تصویر"
                                      >
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="white" strokeWidth="2"/>
                                          <line x1="8" y1="3" x2="8" y2="21" stroke="white" strokeWidth="2"/>
                                          <line x1="16" y1="3" x2="16" y2="21" stroke="white" strokeWidth="2"/>
                                        </svg>
                                      </button>

                                      <button 
                                        type="button"
                                        className="remove-single-image-btn"
                                        onClick={() => handleRemoveImage(image.id)}
                                        disabled={isLoading}
                                        title={image.backendId ? "حذف عکس از سرور" : "حذف عکس"}
                                      >
                                        <img src={closeIcon} alt="حذف" className="remove-icon" />
                                      </button>
                                    </div>
                                    <span className="image-badge">{index + 1}</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                        {formData.images.length < 7 && (
                          <label className="image-upload-button">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUploadWithCrop}
                              style={{ display: 'none' }}
                              disabled={isLoading}
                            />
                            <div className="upload-button-content">
                              <div className="upload-button-icon-wrapper">
                                <img 
                                  src={uploadIcon} 
                                  alt="Upload" 
                                  className="upload-button-icon"
                                />
                                <div className="upload-button-plus">+</div>
                              </div>
                              <span className="upload-button-text">افزودن عکس</span>
                            </div>
                          </label>
                        )}
                        </div>
                        
                        <div className="upload-container-footer">
                          <div className="upload-footer-info">
                            <span className="upload-footer-icon">💡</span>
                            <span className="upload-footer-text">
                              عکس‌ها به ترتیب شماره‌گذاری نمایش داده می‌شوند
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">اطلاعات اصلی</h3>
                      
                      <div className="form-grid">
                        <div className="form-field">
                          <label className="form-label-edit">نام حیوان</label>
                          <div className="input-container">
                            <input
                              type="text"
                              name="name"
                              value={formData.name}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="مثال: ماکس، میمی، بادی"
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="form-label-edit">عنوان آگهی</label>
                          <div className="input-container">
                            <input
                              type="text"
                              name="type"
                              value={formData.type}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="مثال: سگ سفید گم شده در پارک"
                              required
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="form-label-edit">نژاد</label>
                          <div className="input-container">
                            <input
                              type="text"
                              name="breed"
                              value={formData.breed}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="مثال: پرشین، ژرمن شپرد، پارسی"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="form-label-edit">نوع حیوان</label>
                          <div className="input-container">
                            <input
                              type="text"
                              name="animalType"
                              value={formData.animalType}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="مثال: سگ، گربه، پرنده"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="form-label-edit">سن</label>
                          <div className="input-container">
                            <input
                              type="text"
                              name="age"
                              value={formData.age}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="مثال: 2 سال، 6 ماه"
                              disabled={isLoading}
                            />
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="form-label-edit">جنسیت</label>
                          <div className="input-container">
                            <select
                              name="gender"
                              value={formData.gender}
                              onChange={handleInputChange}
                              className="form-input"
                              disabled={isLoading}
                            >
                              <option value="">انتخاب جنسیت</option>
                              <option value="نر">نر</option>
                              <option value="ماده">ماده</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <label className="form-label-edit form-distance">موقعیت مکانی</label>
                          <div className="location-section">
                            <button 
                              type="button"
                              className="location-select-button"
                              onClick={() => setShowMapPicker(true)}
                              disabled={isLoading}
                            >
                              <img src={mapIcon} alt="نقشه" className="location-button-icon" />
                              {selectedLocation ? "تغییر موقعیت مکانی" : "انتخاب موقعیت مکانی"}
                            </button>
                            
                            {renderLocationInfo()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedAdType === "lost" && (
                  <>
                    <div className="form-section">
                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <h3 className="form-section-title">زمان گم شدن</h3>
                          <div className="date-time-horizontal-container">
                            <div className="date-input-container">
                              <label className="form-label-edit form-label-date">تاریخ گم شدن</label>
                              <div className="input-container datepicker-field">
                                <DatePicker
                                  value={formData.lostTime}
                                  onChange={(date) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      lostTime: date ? date.toDate() : null
                                    }));
                                  }}
                                  calendar={persian}
                                  locale={persian_fa}
                                  format="YYYY/MM/DD"
                                  placeholder="انتخاب تاریخ"
                                  calendarPosition="bottom-start"
                                  disabled={isLoading}
                                  inputClass="form-input date-input-compact"
                                  containerStyle={{ width: '100%', overflow: 'visible' }}
                                  weekDays={["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]}
                                  portal={true}
                                />
                              </div>
                            </div>
                            
                            <div className="time-input-container-main">
                              <label className="form-label-edit form-label-time">ساعت گم شدن</label>
                              <div className="time-input-section-main">
                                <TimeInput 
                                  value={formData.lostTime} 
                                  onChange={handleTimeChangeLost} 
                                  disabled={isLoading}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                                      <div className="form-section">
                                        <div className="form-vertical-fields">
                                          <div className="form-field">
                                            <label className="form-label-edit form-distance">علائم خاص</label>
                                            <div className="input-container">
                                              <textarea
                                                name="specialSigns"
                                                value={formData.specialSigns}
                                                onChange={handleInputChange}
                                                className="form-textarea"
                                                placeholder="علائم خاص حیوان مانند رنگ خاص، لکه، جراحت، یا ویژگی‌های منحصر به فرد را ذکر کنید"
                                                rows="3"
                                                disabled={isLoading}
                                              />
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                {selectedAdType === "found" && (
                  <>
                    <div className="form-section">
                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <h3 className="form-section-title">زمان پیدا شدن</h3>
                          <div className="date-time-horizontal-container">
                            <div className="date-input-container">
                              <label className="form-label-edit form-label-date">تاریخ پیدا شدن</label>
                              <div className="input-container datepicker-field">
                                <DatePicker
                                  value={formData.foundTime}
                                  onChange={(date) => {
                                    setFormData(prev => ({
                                      ...prev,
                                      foundTime: date ? date.toDate() : null
                                    }));
                                  }}
                                  calendar={persian}
                                  locale={persian_fa}
                                  format="YYYY/MM/DD"
                                  placeholder="انتخاب تاریخ"
                                  calendarPosition="bottom-start"
                                  disabled={isLoading}
                                  inputClass="form-input date-input-compact"
                                  containerStyle={{ width: '100%' }}
                                  weekDays={["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]}
                                  portal={true}
                                />
                              </div>
                            </div>
                            
                            <div className="time-input-container-main">
                              <label className="form-label-edit form-label-time">ساعت پیدا شدن</label>
                              <div className="time-input-section-main">
                                <TimeInput 
                                  value={formData.foundTime} 
                                  onChange={handleTimeChangeFound} 
                                  disabled={isLoading}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {selectedAdType === "adoption" && (
                  <>
                    <div className="form-section">
                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <label className="form-label-edit form-distance">بیماری‌ها (در صورت وجود)</label>
                          <div className="input-container">
                            <input
                              type="text"
                              name="diseases"
                              value={formData.diseases}
                              onChange={handleInputChange}
                              className="form-input"
                              placeholder="بیماری‌های خاص را ذکر کنید یا خالی بگذارید"
                              disabled={isLoading}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="form-section">
                      <div className="form-vertical-fields">
                        <div className="form-field">
                          <label className="form-label-edit form-distance">وضعیت سلامت</label>
                          <div className="health-status-grid">
                            <div className={`health-status-card ${formData.hasCertificate ? 'active' : ''}`}>
                              <span className="health-status-label">دارای شناسنامه</span>
                              <label className="health-toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={formData.hasCertificate}
                                  onChange={() => handleToggleChange('hasCertificate')}
                                  disabled={isLoading}
                                />
                                <span className="health-toggle-slider"></span>
                              </label>
                            </div>
                            
                            <div className={`health-status-card ${formData.isVaccinated ? 'active' : ''}`}>
                              <span className="health-status-label">واکسینه شده</span>
                              <label className="health-toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={formData.isVaccinated}
                                  onChange={() => handleToggleChange('isVaccinated')}
                                  disabled={isLoading}
                                />
                                <span className="health-toggle-slider"></span>
                              </label>
                            </div>
                            
                            <div className={`health-status-card ${formData.isSterilized ? 'active' : ''}`}>
                              <span className="health-status-label">عقیم شده</span>
                              <label className="health-toggle-switch">
                                <input
                                  type="checkbox"
                                  checked={formData.isSterilized}
                                  onChange={() => handleToggleChange('isSterilized')}
                                  disabled={isLoading}
                                />
                                <span className="health-toggle-slider"></span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <label className="form-label-edit form-distance">توضیحات</label>
                      <div className="input-container">
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleInputChange}
                          className="form-textarea"
                          placeholder={
                            selectedAdType === "lost" 
                              ? "توضیحات کامل درباره حیوان گم شده، آخرین موقعیت دیده شدن، ویژگی‌های رفتاری و هر اطلاعات مفید دیگری که می‌تواند به پیدا کردن حیوان کمک کند."
                              : selectedAdType === "found"
                              ? "توضیحات کامل درباره حیوان پیدا شده، شرایط فعلی، ویژگی‌های رفتاری و هر اطلاعات مفید دیگری که می‌تواند به پیدا کردن صاحب اصلی کمک کند."
                              : "توضیحات کامل درباره حیوان، ویژگی‌های رفتاری، شرایط خاص سلامت، نیازهای خاص و هر اطلاعات مفید دیگری برای سرپرستی."
                          }
                          rows="4"
                          required
                          disabled={isLoading}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">تنظیمات تماس</h3>
                      
                      <div className="contact-settings-toggle">
                        <div className="toggle-container">
                          <label className="toggle-switch">
                            <input
                              type="checkbox"
                              checked={formData.contact_email}
                              onChange={() => handleToggleChange('contact_email')}
                              disabled={isLoading}
                            />
                            <span className="toggle-slider"></span>
                          </label>
                          <div className="toggle-info">
                            <span className="toggle-label">نمایش اطلاعات تماس در آگهی</span>
                            <p className="toggle-description">
                              {formData.contact_email 
                                ? "ایمیل شما در آگهی نمایش داده می‌شود"
                                : "ایمیل و شماره تماس شما در آگهی نمایش داده نمی‌شود. کاربران از طریق پیام خصوصی می‌توانند با شما ارتباط برقرار کنند."
                              }
                            </p>
                          </div>
                        </div>
                      </div>

                      {formData.contact_email ? (
                        <div className="contact-info-card">
                          <div className="contact-info-header">
                            <img 
                              src={contactIcon} 
                              alt="Contact" 
                              className="contact-info-icon"
                            />
                            <h4 className="contact-info-title">اطلاعات تماس</h4>
                          </div>
                          <div className="form-grid">
                            <div className="form-field">
                              <label className="form-label-edit form-label-edit-small">ایمیل</label>
                              <div className="input-container">
                                <input
                                  type="email"
                                  name="email"
                                  value={formData.email}
                                  onChange={handleInputChange}
                                  className="form-input"
                                  placeholder="saranasher8@gmail.com"
                                  disabled={isLoading}
                                />
                              </div>
                            </div>
                          </div>
                          <p className="contact-info-note">
                            این اطلاعات در آگهی شما نمایش داده خواهد شد
                          </p>
                        </div>
                      ) : (
                        <div className="contact-disabled-message">
                          <div className="contact-disabled-icon">
                            <img src={lockIcon} alt='قفل'/>
                          </div>
                          <div className="contact-disabled-content">
                            <h4 className="contact-disabled-title">اطلاعات تماس مخفی است</h4>
                            <p className="contact-disabled-description">
                              اطلاعات تماس شما در این آگهی نمایش داده نمی‌شود. 
                              کاربران از طریق پیام خصوصی می‌توانند با شما ارتباط برقرار کنند.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="button" 
                    className="form-button form-button-cancel"
                    onClick={onClose}
                    disabled={isLoading}
                  >
                    انصراف
                  </button>
                  <button 
                    type="submit" 
                    className={`form-button form-button-submit ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading ? "در حال ذخیره..." : "ذخیره تغییرات"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      
      {cropModalOpen && (
        <ImageCropper
          image={imageToCrop}
          onCropComplete={handleCropComplete}
          onClose={() => setCropModalOpen(false)}
          aspect={4/3} 
        />
      )}

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={cancelDeleteImage}
        onConfirm={confirmDeleteImage}
        title="حذف عکس از سرور"
        message="آیا از حذف این عکس اطمینان دارید؟"
        confirmText="حذف عکس"
        cancelText="لغو"
        isLoading={isDeleting}
        imageUrl={imageToDelete?.preview}
      />
      
      {notification && (
        <NotificationToast
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
    </>
  );
}