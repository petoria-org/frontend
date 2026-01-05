import React, { useState, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import "../../styles/NotificationOptionsSection.css";
import searchIcon from '../../assets/icons/Search.svg';
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
import { config } from "../../config";
import {
  getLostPostDetail,
  getFoundPostDetail,
  getSurrenderPostDetail,
  updateLostPost,
  updateFoundPost,
  updateSurrenderPost,
  createLostPost,
  createFoundPost,
  createSurrenderPost,
  deletePostImage
} from "../../Services/userService";
import moment from 'jalali-moment';
import fa from 'date-fns/locale/fa-IR';
import DatePickerModule from "react-multi-date-picker";
import persian from "react-date-object/calendars/persian";
import persian_fa from "react-date-object/locales/persian_fa";
import { useOutletContext } from "react-router-dom";
import "../../styles/DatePickerCustom.css";
import DeleteConfirmationModal from '../DeleteConfirmationModal/DeleteConfirmationModal';

const DatePicker = DatePickerModule.default || DatePickerModule;

const PET_TYPE_FA_TO_EN = {
  "سگ": "dog",
  "گربه": "cat",
  "پرنده": "bird",
  "خرگوش": "rabbit",
  "همستر": "hamster",
  "سایر": "others",
};

const PET_TYPE_EN_TO_FA = {
  dog: "سگ",
  cat: "گربه",
  bird: "پرنده",
  rabbit: "خرگوش",
  hamster: "همستر",
  others: "سایر",
};

const toInputDateTime = (iso) => {
  if (!iso) return "";
  return new Date(iso);
};

const toISO = (value) => {
  if (!value) return null;
  return new Date(value).toISOString();
};

const parseDateKeepClock = (value) => {
  if (!value) return null;
  if (value instanceof Date) return new Date(value);

  const str = typeof value === "string" ? value : String(value);
  const exactParts = str.match(/(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);

  if (exactParts) {
    const [, y, m, d, h, min] = exactParts;
    return new Date(
      Number(y),
      Number(m) - 1,
      Number(d),
      Number(h),
      Number(min),
      0,
      0
    );
  }

  return new Date(value);
};

const TimeInput = ({ value, onChange, disabled }) => {
  const timeValue = value ? moment(value).format("HH:mm") : "";

  const handleChange = (e) => {
    const raw = e.target.value || "";
    const [h, m] = raw.split(":").map(Number);
    if (Number.isNaN(h) || Number.isNaN(m)) {
      return;
    }
    const base = value ? new Date(value) : new Date();
    base.setHours(h, m, 0, 0);
    onChange?.(base);
  };

  return (
    <input
      type="time"
      className="native-time-input"
      value={timeValue}
      onChange={handleChange}
      disabled={disabled}
      step="60"
      inputMode="numeric"
    />
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

export const NotificationOptionsSection = ({ adData, onClose, onSave, mode }) => {
  const isEdit = mode === "edit";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const animalOptions = [
    {
      value: "سگ",
      label: "سگ",
      hint: "حیوان خانگی وفادار",
      icon: <img src="/src/assets/icons/dog.svg" alt="سگ" className="option-icon-img" />
    },
    {
      value: "گربه",
      label: "گربه",
      hint: "حیوان خانگی مستقل",
      icon: <img src="/src/assets/icons/cat.svg" alt="گربه" className="option-icon-img" />
    },
    {
      value: "پرنده",
      label: "پرنده",
      hint: "حیوان خانگی آوازه خوان",
      icon: <img src="/src/assets/icons/bird.svg" alt="پرنده" className="option-icon-img" />
    },
    {
      value: "خرگوش",
      label: "خرگوش",
      hint: "حیوان خانگی آرام",
      icon: <img src="/src/assets/icons/rabbit.svg" alt="خرگوش" className="option-icon-img" />
    },
    {
      value: "همستر",
      label: "همستر",
      hint: "حیوان خانگی کوچک",
      icon: <img src="/src/assets/icons/hamster.svg" alt="همستر" className="option-icon-img" />
    },
    {
      value: "سایر",
      label: "سایر",
      hint: "سایر حیوانات خانگی",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="option-icon-svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
            stroke="#2c3e50" strokeWidth="1.5"/> 
          <path d="M12 16V12M12 8H12.01" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round"/> 
        </svg>
      )
    }
  ];

  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);
  const genderOptions = [
    {
      value: "نر",
      label: "نر",
      hint: "حیوان نر",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="option-icon-svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
            stroke="#1c7bd1" strokeWidth="1.5"/>
          <path d="M12 16V8M12 8L15 11M12 8L9 11" stroke="#1c7bd1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "ماده",
      label: "ماده",
      hint: "حیوان ماده",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="option-icon-svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
            stroke="#ff6b9d" strokeWidth="1.5"/>
          <path d="M12 16V8M8 12H16" stroke="#ff6b9d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    {
      value: "نامشخص",
      label: "نامشخص",
      hint: "جنسیت تعیین نشده",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="option-icon-svg">
          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
            stroke="#94a3b8" strokeWidth="1.5"/>
          <path d="M12 16V12M12 8H12.01" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      )
    }
  ];

  const handleGenderSelect = (gender) => {
    setFormData(prev => ({ ...prev, gender }));
    setIsGenderDropdownOpen(false);
  };

  const initialFormState = {
    name: "",
    type: "",
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
  };

  const [formData, setFormData] = useState(initialFormState);
  const [ageYears, setAgeYears] = useState("");
  const [ageMonths, setAgeMonths] = useState("");

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

  const { setHideNavbar, setHideFooter } = useOutletContext();
  const lostDateRef = useRef(null);
  const foundDateRef = useRef(null);
  const surrenderDateRef = useRef(null);

  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false);
  const [activeTimeField, setActiveTimeField] = useState(null);

  useEffect(() => {
    const closeCalendars = () => {
      lostDateRef.current?.closeCalendar?.();
      foundDateRef.current?.closeCalendar?.();
      surrenderDateRef.current?.closeCalendar?.();
    };

    window.addEventListener("wheel", closeCalendars, { passive: true });
    window.addEventListener("scroll", closeCalendars, true);
    window.addEventListener("touchmove", closeCalendars, { passive: true });

    return () => {
      window.removeEventListener("wheel", closeCalendars, { passive: true });
      window.removeEventListener("scroll", closeCalendars, true);
      window.removeEventListener("touchmove", closeCalendars, { passive: true });
    };
  }, []);

  useEffect(() => {
    const handleOutside = (event) => {
      const target = event.target;
      const isInsidePicker =
        target.closest(".rmdp-container") ||
        target.closest(".rmdp-wrapper") ||
        target.closest(".datepicker-field");

      if (isInsidePicker) return;

      lostDateRef.current?.closeCalendar?.();
      foundDateRef.current?.closeCalendar?.();
      surrenderDateRef.current?.closeCalendar?.();
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside, { passive: true });

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside, { passive: true });
    };
  }, []);

  useEffect(() => {
    const closeTimePickers = () => {
      if (isTimePickerOpen) {
        setIsTimePickerOpen(false);
        setActiveTimeField(null);
      }
    };

    window.addEventListener("wheel", closeTimePickers, { passive: true });
    window.addEventListener("scroll", closeTimePickers, true);
    window.addEventListener("touchmove", closeTimePickers, { passive: true });

    const handleOutsideClick = (event) => {
      const timePickerElement = document.querySelector('.time-picker-popup');
      const triggerElements = document.querySelectorAll('.time-picker-field');
      
      let isInsideTimePicker = false;
      
      if (timePickerElement && timePickerElement.contains(event.target)) {
        isInsideTimePicker = true;
      }
      
      triggerElements.forEach(element => {
        if (element.contains(event.target)) {
          isInsideTimePicker = true;
        }
      });
      
      if (!isInsideTimePicker && isTimePickerOpen) {
        closeTimePickers();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("touchstart", handleOutsideClick, { passive: true });

    return () => {
      window.removeEventListener("wheel", closeTimePickers);
      window.removeEventListener("scroll", closeTimePickers, true);
      window.removeEventListener("touchmove", closeTimePickers);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("touchstart", handleOutsideClick);
    };
  }, [isTimePickerOpen]);

  const ProfessionalTimeSelector = useMemo(
  () =>
    function ProfessionalTimeSelectorComponent({ value, onChange, disabled, label, fieldType }) {
      const [hours, setHours] = useState("00");
      const [minutes, setMinutes] = useState("00");
      const [isHoursFocused, setIsHoursFocused] = useState(false);
      const [isMinutesFocused, setIsMinutesFocused] = useState(false);
      const [showSlider, setShowSlider] = useState(false);
      const [activeSlider, setActiveSlider] = useState(null);
      const [isPickerOpen, setIsPickerOpen] = useState(false);
      const [isTypingMode, setIsTypingMode] = useState(false);
      const triggerRef = useRef(null);
      const popupRef = useRef(null);
      const hourInputRef = useRef(null);
      const minuteInputRef = useRef(null);
      const directTimeInputRef = useRef(null);
      const [popupPosition, setPopupPosition] = useState({
        top: 0,
        left: 0,
        width: 0
      });

      const updatePopupPosition = () => {
        const target = triggerRef.current;
        if (!target) return;

        const rect = target.getBoundingClientRect();
        setPopupPosition({
          top: rect.bottom + window.scrollY + 8,
          left: rect.left + window.scrollX,
          width: rect.width
        });
      };
      
      useEffect(() => {
        if (value instanceof Date) {
          setHours(String(value.getHours()).padStart(2, '0'));
          setMinutes(String(value.getMinutes()).padStart(2, '0'));
        } else {
          setHours("00");
          setMinutes("00");
        }
      }, [value]);

      useEffect(() => {
        if (isTypingMode && hourInputRef.current) {
          setTimeout(() => {
            hourInputRef.current?.focus();
            hourInputRef.current?.select();
          }, 50);
        }
      }, [isTypingMode]);

      useEffect(() => {
        if (!isPickerOpen) return;

        const handleScrollOrClickOutside = (e) => {
          if (e.type === 'scroll' || e.type === 'wheel' || e.type === 'touchmove') {
            setIsPickerOpen(false);
            setShowSlider(false);
            setIsTypingMode(false);
            return;
          }
          
          if (isPickerOpen && popupRef.current && !popupRef.current.contains(e.target)) {
            if (triggerRef.current && !triggerRef.current.contains(e.target)) {
              setIsPickerOpen(false);
              setShowSlider(false);
              setIsTypingMode(false);
            }
          }
        };
        
        window.addEventListener('scroll', handleScrollOrClickOutside, true);
        window.addEventListener('wheel', handleScrollOrClickOutside, { passive: true });
        window.addEventListener('touchmove', handleScrollOrClickOutside, { passive: true });
        document.addEventListener('mousedown', handleScrollOrClickOutside);
        
        return () => {
          window.removeEventListener('scroll', handleScrollOrClickOutside, true);
          window.removeEventListener('wheel', handleScrollOrClickOutside);
          window.removeEventListener('touchmove', handleScrollOrClickOutside);
          document.removeEventListener('mousedown', handleScrollOrClickOutside);
        };
      }, [isPickerOpen]);

      useEffect(() => {
        if (!isPickerOpen) return;

        const handleReposition = () => updatePopupPosition();

        updatePopupPosition();
        window.addEventListener('resize', handleReposition);
        window.addEventListener('scroll', handleReposition, true);

        return () => {
          window.removeEventListener('resize', handleReposition);
          window.removeEventListener('scroll', handleReposition, true);
        };
      }, [isPickerOpen]);

      const getTimePeriod = () => {
        const hour = parseInt(hours);
        if (hour < 12) return "صبح";
        if (hour < 17) return "ظهر";
        if (hour < 20) return "عصر";
        return "شب";
      };

      const handleHourChange = (newHour) => {
        let hourNum = parseInt(newHour) || 0;
        if (hourNum > 23) hourNum = 23;
        if (hourNum < 0) hourNum = 0;
        const minuteNum = parseInt(minutes) || 0;
        
        const newHours = String(hourNum).padStart(2, '0');
        setHours(newHours);
        
        const newDate = value instanceof Date ? new Date(value) : new Date();
        newDate.setHours(hourNum);
        newDate.setMinutes(minuteNum);
        onChange(newDate);
      };

      const handleMinuteChange = (newMinute) => {
        let minuteNum = parseInt(newMinute) || 0;
        if (minuteNum > 59) minuteNum = 59;
        if (minuteNum < 0) minuteNum = 0;
        const hourNum = parseInt(hours) || 0;
        
        const newMinutes = String(minuteNum).padStart(2, '0');
        setMinutes(newMinutes);
        
        const newDate = value instanceof Date ? new Date(value) : new Date();
        newDate.setHours(hourNum);
        newDate.setMinutes(minuteNum);
        onChange(newDate);
      };

      const handleDirectTimeChange = (e) => {
        const timeValue = e.target.value;
        if (!timeValue) return;
        
        const [h, m] = timeValue.split(':').map(Number);
        if (!isNaN(h) && !isNaN(m)) {
          handleHourChange(h.toString());
          handleMinuteChange(m.toString());
          setIsTypingMode(false);
        }
      };

      const handleKeyDown = (e, type) => {
        if (e.key === 'Enter') {
          setIsTypingMode(false);
          if (type === 'hour' && minuteInputRef.current) {
            minuteInputRef.current.focus();
          }
        }
        
        if (e.key === 'Escape') {
          setIsTypingMode(false);
        }
        
        if (e.key === 'Tab' && !e.shiftKey && type === 'hour') {
          e.preventDefault();
          minuteInputRef.current?.focus();
        }
        if (e.key === 'Tab' && e.shiftKey && type === 'minute') {
          e.preventDefault();
          hourInputRef.current?.focus();
        }
      };

      const handleTypingBlur = (e) => {
        const next = e.relatedTarget; 
        
        if (next && next.closest(".direct-time-input-container")) return;
        if (next && next.closest(".time-picker-popup")) return;

        deactivateTypingMode();
      };

      const activateTypingMode = () => {
        setIsTypingMode(true);
        setShowSlider(false);
      };

      const deactivateTypingMode = () => {
        setIsTypingMode(false);
      };

      const incrementHour = () => {
        let hourNum = parseInt(hours) || 0;
        hourNum = (hourNum + 1) % 24;
        handleHourChange(hourNum.toString());
      };

      const decrementHour = () => {
        let hourNum = parseInt(hours) || 0;
        hourNum = hourNum - 1;
        if (hourNum < 0) hourNum = 23;
        handleHourChange(hourNum.toString());
      };

      const incrementMinute = () => {
        let minuteNum = parseInt(minutes) || 0;
        minuteNum = (minuteNum + 1) % 60;
        handleMinuteChange(minuteNum.toString());
      };

      const decrementMinute = () => {
        let minuteNum = parseInt(minutes) || 0;
        minuteNum = minuteNum - 1;
        if (minuteNum < 0) minuteNum = 59 + minuteNum;
        handleMinuteChange(minuteNum.toString());
      };

      const handleHourInputChange = (e) => {
        const newHour = e.target.value;
        if (/^\d{0,2}$/.test(newHour)) {
          handleHourChange(newHour);
        }
      };

      const handleMinuteInputChange = (e) => {
        const newMinute = e.target.value;
        if (/^\d{0,2}$/.test(newMinute)) {
          handleMinuteChange(newMinute);
        }
      };

      const handleHourSliderChange = (e) => {
        const hourValue = parseInt(e.target.value);
        handleHourChange(hourValue.toString());
      };

      const handleMinuteSliderChange = (e) => {
        const minuteValue = parseInt(e.target.value);
        handleMinuteChange(minuteValue.toString());
      };

      const toggleSlider = (type) => {
        setActiveSlider(type);
        setShowSlider(true);
      };

      const togglePicker = () => {
        if (!disabled) {
          updatePopupPosition();
          setIsPickerOpen(true);
          setShowSlider(false);
          setIsTypingMode(false);
        }
      };

      const setCurrentTime = () => {
        const now = new Date();
        const hourNow = now.getHours();
        const minuteNow = now.getMinutes();
        
        setHours(String(hourNow).padStart(2, '0'));
        setMinutes(String(minuteNow).padStart(2, '0'));
        
        const newDate = value instanceof Date ? new Date(value) : new Date();
        newDate.setHours(hourNow);
        newDate.setMinutes(minuteNow);
        onChange(newDate);
      };

      const setMidnight = () => {
        setHours('00');
        setMinutes('00');
        
        const newDate = value instanceof Date ? new Date(value) : new Date();
        newDate.setHours(0);
        newDate.setMinutes(0);
        onChange(newDate);
      };

      const popupWidth = popupPosition.width || (triggerRef.current ? triggerRef.current.offsetWidth : undefined);

      return (
        <div className="professional-time-selector">
          <label className="form-label-edit">{label}</label>
        
          <div className="input-container" ref={triggerRef}>
            <div 
              className="form-input time-picker-field"
              onClick={togglePicker}
              style={{ cursor: 'pointer' }}
            >
              <div className="time-field-display" dir="ltr">
                <span className="time-field-digits">
                  <span className="time-field-hours">{hours}</span>
                  <span className="time-field-colon">:</span>
                  <span className="time-field-minutes">{minutes}</span>
                </span>
                <span className="time-field-period">{getTimePeriod()}</span>
              </div>
            </div>
            <div className="time-field-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                  stroke="currentColor" strokeWidth="1.5"/>
                <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
          </div>

          {isPickerOpen && createPortal(
            <>
              <div
                className="time-picker-overlay"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsPickerOpen(false);
                  setShowSlider(false);
                  setIsTypingMode(false);
                }}
              />
              <div
                className="time-picker-popup"
                style={{
                  top: popupPosition.top,
                  left: popupPosition.left,
                  width: popupWidth
                }}
                ref={popupRef}
              >
                <div className="time-picker-content" dir="ltr">
                  <div className="time-selector-main">
                    <div className="time-display">
                      <div className="time-display-digits">
                        {isTypingMode ? (
                          <div className="direct-time-input-container">
                            <input
                              ref={hourInputRef}
                              type="number"
                              value={hours}
                              onChange={(e) => handleHourChange(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, "hour")}
                              onBlur={handleTypingBlur}
                              className="direct-time-input"
                              min="0"
                              max="23"
                              disabled={disabled}
                              placeholder="HH"
                            />
                            <span className="time-colon-animated">
                              <span className="colon-dot top"></span>
                              <span className="colon-dot bottom"></span>
                            </span>
                            <input
                              ref={minuteInputRef}
                              type="number"
                              value={minutes}
                              onChange={(e) => handleMinuteChange(e.target.value)}
                              onKeyDown={(e) => handleKeyDown(e, "minute")}
                              onBlur={handleTypingBlur}
                              className="direct-time-input"
                              min="0"
                              max="59"
                              disabled={disabled}
                              placeholder="MM"
                            />
                          </div>
                        ) : (
                          <>
                            <span
                              className="time-digit-group time-digit-hours"
                              onClick={(e) => {
                                e.stopPropagation();
                                activateTypingMode();
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {hours.split('').map((digit, index) => (
                                <span key={`hour-${index}`} className="time-digit">
                                  {digit}
                                </span>
                              ))}
                            </span>
                            <span className="time-colon-animated">
                              <span className="colon-dot top"></span>
                              <span className="colon-dot bottom"></span>
                            </span>
                            <span
                              className="time-digit-group time-digit-minutes"
                              onClick={(e) => {
                                e.stopPropagation();
                                activateTypingMode();
                              }}
                              style={{ cursor: 'pointer' }}
                            >
                              {minutes.split('').map((digit, index) => (
                                <span key={`minute-${index}`} className="time-digit">
                                  {digit}
                                </span>
                              ))}
                            </span>
                          </>
                        )}
                      </div>
                      <div className="time-unit-labels">
                        <span className="time-unit">دقیقه</span>
                        <span className="time-unit">ساعت</span>
                      </div>
                    </div>

                    <div className="time-controls">
                      <div className="time-control-group">
                        <div className="time-control-label">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#1c7bd1" strokeWidth="1.5"/>
                            <path d="M12 8V12L15 15" stroke="#1c7bd1" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          ساعت
                        </div>
                        <div className="time-control-buttons">
                          <button
                            className="time-control-btn time-control-btn-decrement"
                            onClick={decrementHour}
                            disabled={disabled}
                            type="button"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                          
                          <div 
                            className={`time-input-container ${isHoursFocused ? 'focused' : ''}`}
                            onClick={() => toggleSlider('hours')}
                          >
                            <input
                              type="number"
                              value={hours}
                              onChange={handleHourInputChange}
                              className="time-input-digit"
                              min="0"
                              max="23"
                              disabled={disabled}
                              onFocus={() => setIsHoursFocused(true)}
                              onBlur={() => setIsHoursFocused(false)}
                              inputMode="numeric"
                            />
                            <div className="time-input-overlay">
                              <span className="time-input-value">{hours}</span>
                            </div>
                          </div>
                          
                          <button
                            className="time-control-btn time-control-btn-increment"
                            onClick={incrementHour}
                            disabled={disabled}
                            type="button"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>

                      <div className="time-control-group">
                        <div className="time-control-label">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="9" stroke="#ff6b9d" strokeWidth="1.5"/>
                            <path d="M12 8V12L15 15" stroke="#ff6b9d" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                          دقیقه
                        </div>
                        <div className="time-control-buttons">
                          <button
                            className="time-control-btn time-control-btn-decrement"
                            onClick={decrementMinute}
                            disabled={disabled}
                            type="button"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                          
                          <div 
                            className={`time-input-container ${isMinutesFocused ? 'focused' : ''}`}
                            onClick={() => toggleSlider('minutes')}
                          >
                            <input
                              type="number"
                              value={minutes}
                              onChange={handleMinuteInputChange}
                              className="time-input-digit"
                              min="0"
                              max="59"
                              disabled={disabled}
                              onFocus={() => setIsMinutesFocused(true)}
                              onBlur={() => setIsMinutesFocused(false)}
                              inputMode="numeric"
                            />
                            <div className="time-input-overlay">
                              <span className="time-input-value">{minutes}</span>
                            </div>
                          </div>
                          
                          <button
                            className="time-control-btn time-control-btn-increment"
                            onClick={incrementMinute}
                            disabled={disabled}
                            type="button"
                          >
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                              <path d="M12 6V18M6 12H18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="time-quick-buttons">
                      <button
                        className="time-quick-btn"
                        onClick={setCurrentTime}
                        disabled={disabled}
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                            stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M12 6V12L16 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        زمان حال
                      </button>
                      
                      <button
                        className="time-quick-btn"
                        onClick={setMidnight} 
                        disabled={disabled}
                        type="button"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                            stroke="currentColor" strokeWidth="1.5"/>
                          <path d="M12 6V12L8 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        ۰۰:۰۰
                      </button>
                    </div>
                  </div>

                  {showSlider && (
                    <div className="time-slider-modal">
                      <div className="time-slider-backdrop" onClick={() => setShowSlider(false)}></div>
                      <div className="time-slider-content">
                        <div className="time-slider-header">
                          <h3 className="time-slider-title">
                            تنظیم {activeSlider === 'hours' ? 'ساعت' : 'دقیقه'}
                          </h3>
                          <button 
                            className="time-slider-close"
                            onClick={() => setShowSlider(false)}
                            type="button"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                            </svg>
                          </button>
                        </div>
                        
                        <div className="time-slider-body" dir="ltr">
                          {activeSlider === 'hours' ? (
                            <>
                              <div className="slider-value-display">
                                <span className="slider-value">{hours}</span>
                                <span className="slider-unit">ساعت</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="23"
                                value={hours}
                                onChange={handleHourSliderChange}
                                className="time-range-slider"
                                disabled={disabled}
                              />
                              <div className="slider-ticks">
                                {[0, 6, 12, 18, 23].map(tick => (
                                  <div key={tick} className="slider-tick">
                                    <span className="tick-label">{tick}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="slider-value-display">
                                <span className="slider-value">{minutes}</span>
                                <span className="slider-unit">دقیقه</span>
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="59"
                                value={minutes}
                                onChange={handleMinuteSliderChange}
                                className="time-range-slider"
                                step="1"
                                disabled={disabled}
                              />
                              <div className="slider-ticks">
                                {[0, 15, 30, 45, 59].map(tick => (
                                  <div key={tick} className="slider-tick">
                                    <span className="tick-label">{tick}</span>
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                        
                        <div className="time-slider-footer">
                          <button 
                            className="time-slider-preset"
                            onClick={() => {
                              if (activeSlider === 'hours') handleHourChange('12');
                              else handleMinuteChange('00');
                            }}
                            type="button"
                          >
                            تنظیم پیش‌فرض
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </>,
            document.body
          )}
        </div>
      );
    },
  [isTimePickerOpen, activeTimeField]
);

  useEffect(() => {
    const shouldHide =
      mode === "edit" || showMapPicker || cropModalOpen;

    if (shouldHide) {
      setHideNavbar(true);
      setHideFooter(true);
      document.body.style.overflow = "hidden";
    } else {
      setHideNavbar(false);
      setHideFooter(false);
      document.body.style.overflow = "";
    }

    return () => {
      setHideNavbar(false);
      setHideFooter(false);
      document.body.style.overflow = "";
    };
  }, [
    mode,
    showMapPicker,
    cropModalOpen,
    setHideNavbar,
    setHideFooter
  ]);
    
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
          lostTime = parseDateKeepClock(data.lost_time);
        }
        
        if (data.found_time) {
          foundTime = parseDateKeepClock(data.found_time);
        }

        const petAgeData = data.pet_age || {};
        const years = petAgeData.years !== null ? petAgeData.years : "";
        const months = petAgeData.months !== null ? petAgeData.months : "";

        setAgeYears(years.toString());
        setAgeMonths(months.toString());

        const backendImages = data.images?.map(img => {
          let imageUrl = img.image;
          if (imageUrl && !imageUrl.startsWith("http")) {
            if (imageUrl.startsWith("/")) {
              imageUrl = imageUrl.substring(1);
            }
            
            const BACKEND_URL = config.BACKEND_URL;
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
          gender: data.pet_sex === "male" ? "نر" : "ماده",
          location: locationInfo.readable || "",
          lostTime: lostTime,
          foundTime: foundTime,
          specialSigns: data.Specific_symptoms || "",
          description: data.description || "",
          breed: data.breed || "",
          animalType: PET_TYPE_EN_TO_FA[String(data.pet_type || "").toLowerCase()] || "سایر",
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

  const handleAgeYearsChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && value.length <= 3)) {
      setAgeYears(value);
    }
  };

  const handleAgeMonthsChange = (e) => {
    const value = e.target.value;
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) <= 11)) {
      setAgeMonths(value);
    }
  };

  const generateAgeDisplay = (years, months) => {
    if (!years && !months) return "";
    
    const parts = [];
    if (years && parseInt(years) > 0) {
      parts.push(`${years} سال`);
    }
    if (months && parseInt(months) > 0) {
      parts.push(`${months} ماه`);
    }
    
    return parts.join(" و ") || "";
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
      lostTime: time instanceof Date ? new Date(time) : time
    }));
  };

  const handleTimeChangeFound = (time) => {
    setFormData(prev => ({
      ...prev,
      foundTime: time instanceof Date ? new Date(time) : time
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

  const resetForm = () => {
    setFormData(initialFormState);
    setAgeYears("");
    setAgeMonths("");
    setSelectedLocation(null);
    setSelectedAdType("lost");
    setNotification(null);
    setShowMapPicker(false);
    setCropModalOpen(false);
    setImageToCrop(null);
    setCurrentImageIndex(null);
    setShowDeleteModal(false);
    setImageToDelete(null);
    setIsDeleting(false);
    setIsLoading(false);
    setIsTimePickerOpen(false);
    setActiveTimeField(null);
  };

  const handleCancel = () => {
    setIsTimePickerOpen(false);
    setActiveTimeField(null);
    
    if (mode === "edit") {
      onClose?.();
    }

    if (mode === "create") {
      resetForm();
    }
  };

  const validateForm = () => {
    const errors = [];
    
    if (ageYears && parseInt(ageYears) > 100) {
      errors.push("سن نمی‌تواند بیشتر از ۱۰۰ سال باشد");
    }
    
    if (ageMonths && parseInt(ageMonths) > 11) {
      errors.push("ماه نمی‌تواند بیشتر از ۱۱ باشد");
    }
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setNotification({
        message: validationErrors.join(" - "),
        type: "error"
      });
      return;
    }
    
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
          readable: selectedLocation.readable,
        }
      : null;

    const imageIds = formData.images
      .filter(img => img.backendId)
      .map(img => img.backendId);

    const petAgePayload = {
      years: ageYears ? parseInt(ageYears) : null,
      months: ageMonths ? parseInt(ageMonths) : null,
      display: generateAgeDisplay(ageYears, ageMonths)
    };

    const payload = {
      title: formData.type,
      pet_name: formData.name,
      breed: formData.breed || "",
      pet_type: PET_TYPE_FA_TO_EN[formData.animalType] || "other",
      pet_sex: formData.gender === "نر" ? "male" : "female",
      pet_age: petAgePayload,
      Specific_symptoms: formData.specialSigns || "",
      description: formData.description,
      diseases: formData.diseases || "",
      has_birth_certificate: formData.hasCertificate,
      vaccination: formData.isVaccinated,
      steriliz: formData.isSterilized,
      contact_email: formData.contact_email,
      location: locationPayload,
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

      if (mode === "edit") {
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
      }

      if (mode === "create") {
        if (selectedAdType === "lost") {
          payload.lost_time = toISO(formData.lostTime);
          result = await createLostPost(payload);
        } 
        else if (selectedAdType === "found") {
          payload.found_time = toISO(formData.foundTime);
          result = await createFoundPost(payload);
        } 
        else if (selectedAdType === "adoption") {
          result = await createSurrenderPost(payload);
        }

        showNotification("آگهی با موفقیت ثبت شد", "success");
      }

      setTimeout(() => {
        resetForm();
        onSave?.(result?.data || result);
        setIsLoading(false);
      }, 1200);

    } catch (err) {
      console.error("Submit error:", err);
      setIsLoading(false);
      showNotification("خطا در ثبت آگهی. لطفاً دوباره تلاش کنید", "error");
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
          {selectedLocation ? "تغییر موقعیت" : "ثبت موقعیت"}
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
      <div className={`notification-options-section${isEdit ? " edit-mode" : ""}`}>
        <div className="notification-options-container">
          <div className="notification-options-content">
            <div className="notification-options-content-wrapper">
              <div className="notification-options-inner">
              
              <div className="form-section-header">
                <h2 className="notification-options-title">{isEdit ? "ویرایش آگهی" : "ثبت آگهی جدید"}</h2>
                {isEdit && (
                  <button
                    onClick={onClose}
                    className="close-button"
                    disabled={isLoading}
                  >
                    ×
                  </button>
                )}

              </div>

              <form onSubmit={handleSubmit}>
              
                <div className="form-section">
                  <div className="form-vertical-fields">
                    <div className="form-field">
                      <h3 className="form-section-title">نوع آگهی</h3>
                      
                      <div className="professional-ad-type-selector">
                        <div className="ad-type-grid-pro">
                          <div
                            className={`ad-type-card-pro ${selectedAdType === "lost" ? 'active' : ''}`}
                            onClick={() => !isLoading && handleAdTypeSelect("lost")}
                            style={{
                              '--card-color': '#ea9799',
                              '--card-gradient': 'linear-gradient(135deg, #ea9799 0%, #f8c3c4 100%)',
                              '--icon-color': '#dc2626'
                            }}
                          >
                            <div className="ad-type-card-pro-inner">
                              <div className="ad-type-icon-wrapper">
                                <div className="ad-type-icon-bg">
                                  <img 
                                    src={searchIcon} 
                                    alt="گم شده"
                                    className="ad-type-icon-pro"
                                  />
                                </div>
                                {selectedAdType === "lost" && (
                                  <div className="selected-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ad-type-content">
                                <h4 className="ad-type-title">گم شده</h4>
                                <p className="ad-type-description">حیوان خانگی شما گم شده است</p>
                              </div>
                              
                              <div className="ad-type-indicator">
                                <div className="indicator-dot"></div>
                              </div>
                            </div>
                            
                            <div className="ad-type-wave-effect"></div>
                          </div>

                          <div
                            className={`ad-type-card-pro ${selectedAdType === "found" ? 'active' : ''}`}
                            onClick={() => !isLoading && handleAdTypeSelect("found")}
                            style={{
                              '--card-color': '#1c7bd1',
                              '--card-gradient': 'linear-gradient(135deg, #1c7bd1 0%, #5a9bc9 100%)',
                              '--icon-color': '#ffffff'
                            }}
                          >
                            <div className="ad-type-card-pro-inner">
                              <div className="ad-type-icon-wrapper">
                                <div className="ad-type-icon-bg">
                                  <img 
                                    src={checkmarkIcon} 
                                    alt="پیدا شده"
                                    className="ad-type-icon-pro"
                                  />
                                </div>
                                {selectedAdType === "found" && (
                                  <div className="selected-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ad-type-content">
                                <h4 className="ad-type-title">پیدا شده</h4>
                                <p className="ad-type-description">حیوان خانگی پیدا کرده‌اید</p>
                              </div>
                              
                              <div className="ad-type-indicator">
                                <div className="indicator-dot"></div>
                              </div>
                            </div>
                            
                            <div className="ad-type-wave-effect"></div>
                          </div>
                          <div
                            className={`ad-type-card-pro ${selectedAdType === "adoption" ? 'active' : ''}`}
                            onClick={() => !isLoading && handleAdTypeSelect("adoption")}
                            style={{
                              '--card-color': '#10b981',
                              '--card-gradient': 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
                              '--icon-color': '#ffffff'
                            }}
                          >
                            <div className="ad-type-card-pro-inner">
                              <div className="ad-type-icon-wrapper">
                                <div className="ad-type-icon-bg">
                                  <img 
                                    src={heartIcon} 
                                    alt="سرپرستی"
                                    className="ad-type-icon-pro"
                                  />
                                </div>
                                {selectedAdType === "adoption" && (
                                  <div className="selected-badge">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                      <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                                    </svg>
                                  </div>
                                )}
                              </div>
                              
                              <div className="ad-type-content">
                                <h4 className="ad-type-title">سرپرستی</h4>
                                <p className="ad-type-description">به دنبال سرپرست هستید</p>
                              </div>
                              
                              <div className="ad-type-indicator">
                                <div className="indicator-dot"></div>
                              </div>
                            </div>
                            
                            <div className="ad-type-wave-effect"></div>
                          </div>
                        </div>
                        
                        <div className="ad-type-status">
                          <div className="status-indicator">
                            <div className="status-dot active"></div>
                            <span className="status-text">
                              انتخاب شده: {
                                selectedAdType === "lost" ? "گم شده" :
                                selectedAdType === "found" ? "پیدا شده" :
                                "سرپرستی"
                              }
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
                          <div className="modern-glass-dropdown">
                            <div className="dropdown-header" onClick={() => !isLoading && setIsDropdownOpen(!isDropdownOpen)}>
                              <div className="dropdown-selected">
                                {formData.animalType ? (
                                  <>
                                    <div className="selected-icon">
                                      {formData.animalType === "سگ" && <img src="/src/assets/icons/dog.svg" alt="سگ" className="animal-icon" />}
                                      {formData.animalType === "گربه" && <img src="/src/assets/icons/cat.svg" alt="گربه" className="animal-icon" />}
                                      {formData.animalType === "پرنده" && <img src="/src/assets/icons/bird.svg" alt="پرنده" className="animal-icon" />}
                                      {formData.animalType === "خرگوش" && <img src="/src/assets/icons/rabbit.svg" alt="خرگوش" className="animal-icon" />}
                                      {formData.animalType === "همستر" && <img src="/src/assets/icons/hamster.svg" alt="همستر" className="animal-icon" />}
                                      {formData.animalType === "سایر" && (
                                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animal-icon">
                                          <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                                            stroke="#2c3e50" strokeWidth="1.5"/> 
                                          <path d="M12 16V12M12 8H12.01" stroke="#2c3e50" strokeWidth="1.5" strokeLinecap="round"/>
                                        </svg>
                                      )}
                                    </div>
                                    <span className="selected-text">{formData.animalType}</span>
                                  </>
                                ) : (
                                  <span className="dropdown-placeholder">نوع حیوان را انتخاب کنید</span>
                                )}
                              </div>
                              <div className={`dropdown-arrow ${isDropdownOpen ? 'open' : ''}`}>
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                  <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                              </div>
                            </div>
                            
                            {isDropdownOpen && (
                              <div className="dropdown-menu">
                                <div className="dropdown-content">
                                  <div className="dropdown-search">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="search-icon">
                                      <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                    </svg>
                                    <input 
                                      type="text" 
                                      className="search-input" 
                                      placeholder="جستجوی نوع حیوان..."
                                      value={searchTerm}
                                      onChange={(e) => setSearchTerm(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="dropdown-options">
                                    {animalOptions
                                      .filter(option => 
                                        option.label.includes(searchTerm) || 
                                        option.hint.includes(searchTerm)
                                      )
                                      .map((option) => (
                                        <div
                                          key={option.value}
                                          className={`dropdown-option ${formData.animalType === option.value ? 'selected' : ''}`}
                                          onClick={() => {
                                            setFormData(prev => ({ ...prev, animalType: option.value }));
                                            setIsDropdownOpen(false);
                                            setSearchTerm("");
                                          }}
                                        >
                                          <div className="option-icon">
                                            {option.icon}
                                          </div>
                                          <div className="option-info">
                                            <span className="option-label">{option.label}</span>
                                            <span className="option-description">{option.hint}</span>
                                          </div>
                                          {formData.animalType === option.value && (
                                            <div className="option-check">
                                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                                <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                              </svg>
                                            </div>
                                          )}
                                        </div>
                                      ))}
                                  </div>
                                  
                                  <div className="dropdown-footer">
                                    <span className="footer-text">
                                      {animalOptions.filter(option => 
                                        option.label.includes(searchTerm) || 
                                        option.hint.includes(searchTerm)
                                      ).length} گزینه موجود
                                    </span>
                                  </div>
                                </div>
                              </div>
                            )}
                            
                            <input type="hidden" name="animalType" value={formData.animalType} />
                          </div>
                        </div>

                        <div className="form-field">
                          <label className="form-label-edit">سن حیوان</label>
                          <div className="compact-age-input-container">
                            <div className="compact-age-input-fields">
                              <div className="compact-age-input-group">
                                <div className="compact-age-input-wrapper">
                                  <input
                                    type="number"
                                    value={ageYears}
                                    onChange={handleAgeYearsChange}
                                    className="form-input compact-age-input"
                                    placeholder="0"
                                    min="0"
                                    max="100"
                                    step="1"
                                    disabled={isLoading}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                  />
                                  <div className="compact-age-unit">سال</div>
                                </div>
                                
                              </div>
                              
                              <div className="compact-age-input-group">
                                <div className="compact-age-input-wrapper">
                                  <input
                                    type="number"
                                    value={ageMonths}
                                    onChange={handleAgeMonthsChange}
                                    className="form-input compact-age-input"
                                    placeholder="0"
                                    min="0"
                                    max="11"
                                    step="1"
                                    disabled={isLoading}
                                    inputMode="numeric"
                                    pattern="[0-9]*"
                                  />
                                  <div className="compact-age-unit">ماه</div>
                                </div>
                              </div>
                            </div>
                            
                            {(ageYears || ageMonths) && (
                              <div className="compact-age-display">
                                <span className="compact-age-display-text">
                                  سن: <strong>{generateAgeDisplay(ageYears, ageMonths)}</strong>
                                </span>
                              </div>
                            )}
                          </div>
                        </div>

                      <div className="form-field">
                        <label className="form-label-edit">جنسیت</label>
                        <div className="modern-glass-dropdown gender-dropdown">
                          <div 
                            className="dropdown-header" 
                            onClick={() => !isLoading && setIsGenderDropdownOpen(!isGenderDropdownOpen)}
                          >
                            <div className="dropdown-selected">
                              {formData.gender ? (
                                <>
                                  <div className="selected-icon">
                                    {formData.gender === "نر" && (
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animal-icon">
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                                          stroke="#1c7bd1" strokeWidth="1.5"/>
                                        <path d="M12 16V8M12 8L15 11M12 8L9 11" stroke="#1c7bd1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                    {formData.gender === "ماده" && (
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animal-icon">
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                                          stroke="#ff6b9d" strokeWidth="1.5"/>
                                        <path d="M12 16V8M8 12H16" stroke="#ff6b9d" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                                      </svg>
                                    )}
                                    {formData.gender === "نامشخص" && (
                                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="animal-icon">
                                        <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" 
                                          stroke="#94a3b8" strokeWidth="1.5"/>
                                        <path d="M12 16V12M12 8H12.01" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round"/>
                                      </svg>
                                    )}
                                  </div>
                                  <span className={`selected-text ${
                                    formData.gender === "نر" ? "gender-male" :
                                    formData.gender === "ماده" ? "gender-female" :
                                    "gender-unknown"
                                  }`}>
                                    {formData.gender}
                                  </span>
                                </>
                              ) : (
                                <span className="dropdown-placeholder">جنسیت را انتخاب کنید</span>
                              )}
                            </div>
                            <div className={`dropdown-arrow ${isGenderDropdownOpen ? 'open' : ''}`}>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                                <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          </div>
                          
                          {isGenderDropdownOpen && (
                            <div className="dropdown-menu gender-menu">
                              <div className="dropdown-content">
                                <div className="dropdown-options gender-options">
                                  {genderOptions.map((option) => (
                                    <div
                                      key={option.value}
                                      className={`dropdown-option gender-option ${
                                        formData.gender === option.value ? 'selected' : ''
                                      } ${
                                        option.value === "نر" ? "gender-option-male" :
                                        option.value === "ماده" ? "gender-option-female" :
                                        "gender-option-unknown"
                                      }`}
                                      onClick={() => handleGenderSelect(option.value)}
                                    >
                                      <div className="option-icon gender-option-icon">
                                        {option.icon}
                                      </div>
                                      <div className="option-info">
                                        <span className="option-label">{option.label}</span>
                                        <span className="option-description">{option.hint}</span>
                                      </div>
                                      {formData.gender === option.value && (
                                        <div className="option-check">
                                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                                            <path d="M20 6L9 17L4 12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                          </svg>
                                        </div>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
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
                                  ref={lostDateRef}
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
                                  fixMainPosition
                                  offsetY={8}
                                  disabled={isLoading}
                                  inputClass="form-input date-input-compact"
                                  containerStyle={{ width: '100%', overflow: 'visible' }}
                                  weekDays={["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]}
                                  portal={true}
                                />
                              </div>
                            </div>
                            
                            <div className="time-input-container-main">
                              <ProfessionalTimeSelector 
                                value={formData.lostTime} 
                                onChange={handleTimeChangeLost} 
                                disabled={isLoading}
                                label="ساعت گم شدن"
                                fieldType="lost"
                              />
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
                                  ref={foundDateRef}
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
                                  fixMainPosition
                                  offsetY={8}
                                  disabled={isLoading}
                                  inputClass="form-input date-input-compact"
                                  containerStyle={{ width: '100%', overflow: 'visible' }}
                                  weekDays={["شنبه", "یک‌شنبه", "دوشنبه", "سه‌شنبه", "چهارشنبه", "پنج‌شنبه", "جمعه"]}
                                  portal={true}
                                />
                              </div>
                            </div>
                            
                            <div className="time-input-container-main">
                              <ProfessionalTimeSelector 
                                value={formData.foundTime} 
                                onChange={handleTimeChangeFound} 
                                disabled={isLoading}
                                label="ساعت پیدا شدن"
                                fieldType="found"
                              />
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
                    onClick={handleCancel}
                    disabled={isLoading}
                  >
                    انصراف
                  </button>
                  <button 
                    type="submit" 
                    className={`form-button form-button-submit ${isLoading ? 'loading' : ''}`}
                    disabled={isLoading}
                  >
                    {isLoading
                      ? isEdit
                        ? "در حال ذخیره..."
                        : "در حال ثبت..."
                      : isEdit
                        ? "ذخیره تغییرات"
                        : "ثبت آگهی"
                    }
                  </button>
                </div>
              </form>
            </div>
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