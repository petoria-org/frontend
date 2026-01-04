import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import "../../styles/ImageCropper.css";
import { uploadPostImage } from "../../Services/userService";
import scissorsIcon from '../../assets/icons/Scissors.svg';
import { config } from "../../config";

const ImageCropper = ({
  image,
  onCropComplete,
  onClose,
  aspect = 4 / 3,
  cropSize = null,
  maxZoom = 3,
  minZoom = 0.1,
  format = "jpeg",
  quality = 0.95,
  uploadImageFn = uploadPostImage,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [imageDimensions, setImageDimensions] = useState({ width: 0, height: 0 });
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });

  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const cropAreaRef = useRef(null);
  const canvasRef = useRef(null);
  const imageWrapperRef = useRef(null);
  const dragState = useRef({
    isDragging: false,
    startX: 0,
    startY: 0,
    startCropX: 0,
    startCropY: 0,
  });

  const calculatedCropSize = useMemo(() => (
    cropSize && cropSize.width && cropSize.height
      ? cropSize
      : { width: 420, height: 250 }
  ), [cropSize]);


useEffect(() => {
  const initializeCropper = () => {
    if (!containerRef.current) return;

    const { width, height } = containerRef.current.getBoundingClientRect();
    setContainerSize({ width, height });

    const centerX = Math.max(0, (width - calculatedCropSize.width) / 2);
    const centerY = Math.max(0, (height - calculatedCropSize.height) / 2);
    setCrop({ x: centerX, y: centerY });

    const img = new Image();
    img.onload = () => {
      setImageDimensions({
        width: img.width,
        height: img.height,
      });
    };
    img.src = image;
  };

  initializeCropper();
  window.addEventListener("resize", initializeCropper);

  return () => {
    window.removeEventListener("resize", initializeCropper);
  };
}, [image, calculatedCropSize, scale]);

  const handleDragStart = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();

    const clientX = e.clientX || e.touches?.[0]?.clientX || 0;
    const clientY = e.clientY || e.touches?.[0]?.clientY || 0;

    dragState.current = {
      isDragging: true,
      startX: clientX,
      startY: clientY,
      startCropX: crop.x,
      startCropY: crop.y,
    };

    setIsDragging(true);

    const handleDragMove = (moveEvent) => {
      if (!dragState.current.isDragging) return;

      const currentX = moveEvent.clientX || moveEvent.touches?.[0]?.clientX || 0;
      const currentY = moveEvent.clientY || moveEvent.touches?.[0]?.clientY || 0;

      const deltaX = currentX - dragState.current.startX;
      const deltaY = currentY - dragState.current.startY;

      const maxX = Math.max(0, containerSize.width - calculatedCropSize.width);
      const maxY = Math.max(0, containerSize.height - calculatedCropSize.height);

      const newX = Math.max(0, Math.min(maxX, dragState.current.startCropX + deltaX));
      const newY = Math.max(0, Math.min(maxY, dragState.current.startCropY + deltaY));

      setCrop({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
      dragState.current.isDragging = false;
      setIsDragging(false);
      document.removeEventListener("mousemove", handleDragMove);
      document.removeEventListener("touchmove", handleDragMove);
      document.removeEventListener("mouseup", handleDragEnd);
      document.removeEventListener("touchend", handleDragEnd);
    };

    document.addEventListener("mousemove", handleDragMove);
    document.addEventListener("touchmove", handleDragMove, { passive: false });
    document.addEventListener("mouseup", handleDragEnd);
    document.addEventListener("touchend", handleDragEnd);
  }, [crop, containerSize, calculatedCropSize]);

  const handleWheel = useCallback((e) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.1 : 0.1;
    const newScale = Math.max(minZoom, Math.min(maxZoom, scale + delta));
    setScale(parseFloat(newScale.toFixed(2)));
  }, [scale, maxZoom, minZoom]);

  const handleScaleChange = (e) => {
    const newScale = parseFloat(e.target.value);
    setScale(newScale);
  };

  const handleRotationChange = (e) => {
    setRotation(parseInt(e.target.value));
  };

  const handleRotationIncrement = (value) => {
    setRotation(prev => (prev + value + 360) % 360);
  };

  const handleScaleIncrement = (value) => {
    const newScale = Math.max(minZoom, Math.min(maxZoom, scale + value));
    setScale(parseFloat(newScale.toFixed(2)));
  };

const getCroppedImage = useCallback(() => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      const pixelRatio = window.devicePixelRatio || 1;

      if (!imageRef.current || !containerRef.current) {
        reject(new Error("Cropper refs not ready"));
        return;
      }

      const imageRect = imageRef.current.getBoundingClientRect();
      const containerRect = containerRef.current.getBoundingClientRect();

      const offsetX = imageRect.left - containerRect.left;
      const offsetY = imageRect.top - containerRect.top;

      // نسبت تصویر اصلی به نمایشی
      const scaleX = img.naturalWidth / imageRect.width;
      const scaleY = img.naturalHeight / imageRect.height;

      // مختصات واقعی کراپ روی تصویر اصلی
      const sx = (crop.x - offsetX) * scaleX;
      const sy = (crop.y - offsetY) * scaleY;
      const sw = calculatedCropSize.width * scaleX;
      const sh = calculatedCropSize.height * scaleY;

      // canvas با رزولوشن واقعی
      const canvas = document.createElement("canvas");
      canvas.width = sw * pixelRatio;
      canvas.height = sh * pixelRatio;

      const ctx = canvas.getContext("2d");
      ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
      ctx.imageSmoothingQuality = "high";
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, sw, sh);

      ctx.save();

      if (rotation !== 0) {
        ctx.translate(sw / 2, sh / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.translate(-sw / 2, -sh / 2);
      }

      ctx.drawImage(
        img,
        sx,
        sy,
        sw,
        sh,
        0,
        0,
        sw,
        sh
      );

      ctx.restore();

      canvas.toBlob(
        (blob) => {
          if (!blob) reject(new Error("Blob failed"));
          resolve(blob);
        },
        `image/${format}`,
        format === "jpeg" ? quality : 1
      );
    };

    img.onerror = reject;
    img.src = image;
  });
}, [
  image,
  crop,
  calculatedCropSize,
  rotation,
  format,
  quality,
]);

const handleCrop = async () => {
  try {
    setIsLoading(true);

    const blob = await getCroppedImage();

    const arr = await uploadImageFn(blob);
    const result = arr[0]
    console.log(result)

    const BACKEND_URL = config.BACKEND_URL;
    let fullImageUrl;
    
    if (result.image.startsWith("http")) {
      fullImageUrl = result.image;
    } 
    
    else {
      let imagePath = result.image;
      if (imagePath.startsWith("/")) {
        imagePath = imagePath.substring(1);
      }
      fullImageUrl = `${BACKEND_URL}/${imagePath}`;
    }
    
    const timestamp = Date.now();
    const imageUrlWithTimestamp = `${fullImageUrl}${fullImageUrl.includes('?') ? '&' : '?'}t=${timestamp}`;
    
    const croppedResult = {
      id: result.id,
      image: imageUrlWithTimestamp,
      backendId: result.id,
      originalData: result
    };

    onCropComplete(croppedResult);
    onClose();
  } catch (error) {
    console.error("Upload failed:", error);
  } finally {
    setIsLoading(false);
  }
};

  const handleReset = () => {
    setScale(1);
    setRotation(0);
    const centerX = Math.max(0, (containerSize.width - calculatedCropSize.width) / 2);
    const centerY = Math.max(0, (containerSize.height - calculatedCropSize.height) / 2);
    setCrop({ x: centerX, y: centerY });
    setImagePosition({ x: 0, y: 0 });
  };

  const handleZoomToZero = () => {
    setScale(minZoom);
    setImagePosition({ x: 0, y: 0 });
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "r" || e.key === "R") handleReset();
      if (e.key === "Enter" && !isLoading) handleCrop();
      if (e.key === "0") handleZoomToZero(); 
      if (e.key === "z" || e.key === "Z") handleZoomToZero(); 
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onClose, handleReset, handleCrop, isLoading, handleZoomToZero]);

  const imageStyle = useMemo(() => ({
    left: "50%",
    top: "50%",
    transform: `translate(calc(-50% + ${imagePosition.x}px), calc(-50% + ${imagePosition.y}px)) scale(${scale}) rotate(${rotation}deg)`,
    transformOrigin: "center center",
    transition: isDragging ? "none" : "transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
    position: "absolute",
    willChange: "transform",
  }), [scale, rotation, imagePosition, isDragging]);

  const handleImageLoad = useCallback(() => {
    setImagePosition({ x: 0, y: 0 });
  }, []);

  const cropAreaStyle = useMemo(() => ({
    width: `${calculatedCropSize.width}px`,
    height: `${calculatedCropSize.height}px`,
    left: `${crop.x}px`,
    top: `${crop.y}px`,
    cursor: isDragging ? "grabbing" : "grab",
  }), [calculatedCropSize, crop, isDragging]);

  const modalHeight = useMemo(() => {
    return window.innerHeight * 0.9; 
  }, []);

  

  return (
    <div className="image-cropper-modal-overlay">
      <div 
        className="image-cropper-modal" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: `${modalHeight}px` }}
      >

        <div className="cropper-modal-header">
          <div className="cropper-header-left">
            <h3 className="cropper-title">
              <span className="cropper-title-icon">
                    <img 
                      src={scissorsIcon} 
                      alt="قیچی" 
                      className="scissors-svg-icon"
                    />
              </span>
              ویرایش تصویر
            </h3>
            <div className="image-dimensions">
              <span className="dimension-label">
                {calculatedCropSize.width} × {calculatedCropSize.height}
              </span>
            </div>
          </div>
          
          <div className="cropper-header-actions">
            <div className="status-indicator">
              {isLoading && (
                <span className="loading-indicator">
                  <span className="loading-spinner"></span>
                  در حال پردازش...
                </span>
              )}
            </div>
            <button
              className="reset-btn"
              onClick={handleReset}
              title="بازنشانی تنظیمات (R)"
              disabled={isLoading}
            >
              بازنشانی
            </button>
            <button
              className="cropper-close-btn"
              onClick={onClose}
              title="بستن (ESC)"
              disabled={isLoading}
            >
              ×
            </button>
          </div>
        </div>

        <div className="cropper-content-wrapper">
          <div 
            className="cropper-container" 
            ref={containerRef}
            onWheel={handleWheel}
          >
            <div className="image-wrapper" ref={imageWrapperRef}>
                <img
                  ref={imageRef}
                  src={image}
                  alt="تصویر برای ویرایش"
                  className="cropper-image"
                  style={imageStyle}
                  onLoad={handleImageLoad}
                  draggable="false"
                />
              <div className="grid-overlay">
                <div className="grid-line horizontal"></div>
                <div className="grid-line vertical"></div>
              </div>
            </div>

            <div
              className="crop-area"
              ref={cropAreaRef}
              style={cropAreaStyle}
              onMouseDown={handleDragStart}
              onTouchStart={handleDragStart}
            >
              <div className="crop-area-border">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className={`corner-handle corner-${i + 1}`}>
                    <div className="corner-dot"></div>
                  </div>
                ))}
              </div>
              <div className="crop-area-overlay">
                <div className="dimension-display">
                  {Math.round(calculatedCropSize.width)} × {Math.round(calculatedCropSize.height)}
                </div>
              </div>
              <div className="crop-area-handle">
                <div className="handle-icon">↔</div>
                <span className="handle-text">کشیدن برای جابجایی کادر</span>
              </div>
            </div>

            <div className="guide-lines">
              <div className="guide-line guide-line-vertical" style={{ left: "33.33%" }}></div>
              <div className="guide-line guide-line-vertical" style={{ left: "66.66%" }}></div>
              <div className="guide-line guide-line-horizontal" style={{ top: "33.33%" }}></div>
              <div className="guide-line guide-line-horizontal" style={{ top: "66.66%" }}></div>
            </div>
          </div>

          <div className="cropper-controls">
            <div className="controls-row">
              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">
                    <span className="control-icon">🔍</span>
                    میزان زوم
                  </label>
                  <div className="control-value-group">
                    <span className="control-value">{scale.toFixed(2)}x</span> {/* تغییر به 2 رقم اعشار */}
                    <div className="control-buttons">
                      <button
                        className="control-btn control-btn-minus"
                        onClick={() => handleScaleIncrement(-0.1)}
                        disabled={scale <= minZoom || isLoading} /* تغییر شرط */
                      >
                        −
                      </button>
                      <button
                        className="control-btn control-btn-plus"
                        onClick={() => handleScaleIncrement(0.1)}
                        disabled={scale >= maxZoom || isLoading}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min={minZoom} 
                  max={maxZoom}
                  step="0.01" 
                  value={scale}
                  onChange={handleScaleChange}
                  className="control-slider"
                  style={{ "--value": (scale - minZoom) / (maxZoom - minZoom) }} /* تغییر فرمول */
                  disabled={isLoading}
                />
                <div className="control-ticks">
                  <span>{minZoom}x</span> 
                  <span>0.5x</span>
                  <span>1x</span>
                  <span>2x</span>
                  <span>{maxZoom}x</span>
                </div>
              </div>

              <div className="control-group">
                <div className="control-header">
                  <label className="control-label">
                    <span className="control-icon">🔄</span>
                    چرخش تصویر
                  </label>
                  <div className="control-value-group">
                    <span className="control-value">{rotation}°</span>
                    <div className="control-buttons">
                      <button
                        className="control-btn control-btn-minus"
                        onClick={() => handleRotationIncrement(-15)}
                        disabled={isLoading}
                      >
                        −15°
                      </button>
                      <button
                        className="control-btn control-btn-plus"
                        onClick={() => handleRotationIncrement(15)}
                        disabled={isLoading}
                      >
                        +15°
                      </button>
                    </div>
                  </div>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  step="1"
                  value={rotation}
                  onChange={handleRotationChange}
                  className="control-slider"
                  style={{ "--value": rotation / 360 }}
                  disabled={isLoading}
                />
                <div className="control-ticks">
                  <span>0°</span>
                  <span>90°</span>
                  <span>180°</span>
                  <span>270°</span>
                  <span>360°</span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <button
                className="quick-action-btn"
                onClick={() => setRotation(90)}
                disabled={isLoading}
              >
                ↻ 90°
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setRotation(180)}
                disabled={isLoading}
              >
                ↻ 180°
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setRotation(270)}
                disabled={isLoading}
              >
                ↻ 270°
              </button>
              <button
                className="quick-action-btn"
                onClick={() => setScale(1)}
                disabled={isLoading}
              >
                🔍 100%
              </button>
              <button
                className="quick-action-btn"
                onClick={handleZoomToZero} 
                disabled={isLoading}
                title="زوم به حداقل (کلید Z یا 0)"
              >
                🔍 {minZoom}x
              </button>
            </div>
          </div>

          <div className="cropper-actions">
            <button
              className="cropper-cancel-btn"
              onClick={onClose}
              disabled={isLoading}
            >
              لغو
            </button>
            <button
              className="cropper-confirm-btn"
              onClick={handleCrop}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="loading-spinner-small"></span>
                  در حال پردازش...
                </>
              ) : (
                <>
                  <span className="btn-icon">✓</span>
                  تایید و برش تصویر
                </>
              )}
            </button>
          </div>

          <div className="cropper-info-panel">
            <div className="info-section">
              <div className="info-icon">💡</div>
              <div className="info-content">
                <p className="info-title">راهنمای استفاده:</p>
                <ul className="info-tips">
                  <li><strong>کادر برش</strong> را با موس یا لمس کردن بکشید تا جابجا شود</li>
                  <li>از <strong>اسکرول ماوس</strong> برای زوم کردن استفاده کنید</li>
                  <li>از اسلایدرها برای تنظیم دقیق زوم (تا {minZoom}x) و چرخش استفاده کنید</li>
                  <li>کلیدهای میانبر: <kbd>ESC</kbd> بستن، <kbd>R</kbd> بازنشانی، <kbd>Z</kbd> یا <kbd>0</kbd> زوم حداقل</li>
                </ul>
              </div>
            </div>
            <div className="info-section">
              <div className="info-icon">📐</div>
              <div className="info-content">
                <p className="info-title">مشخصات:</p>
                <div className="info-specs">
                  <div className="spec-item">
                    <span className="spec-label">ابعاد اصلی:</span>
                    <span className="spec-value">
                      {imageDimensions.width} × {imageDimensions.height}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">ابعاد برش:</span>
                    <span className="spec-value">
                      {calculatedCropSize.width} × {calculatedCropSize.height}
                    </span>
                  </div>
                  <div className="spec-item">
                    <span className="spec-label">محدوده زوم:</span>
                    <span className="spec-value">{minZoom}x تا {maxZoom}x</span> {/* اضافه کردن محدوده زوم */}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <canvas ref={canvasRef} style={{ display: "none" }} />
        </div>
      </div>
    </div>
  );
};

ImageCropper.propTypes = {
  image: PropTypes.string.isRequired,
  onCropComplete: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
  aspect: PropTypes.number,
  cropSize: PropTypes.shape({
    width: PropTypes.number,
    height: PropTypes.number,
  }),
  maxZoom: PropTypes.number,
  minZoom: PropTypes.number, 
  format: PropTypes.oneOf(["jpeg", "png", "webp"]),
  quality: PropTypes.number,
  uploadImageFn: PropTypes.func,
};

ImageCropper.defaultProps = {
  aspect: 4 / 3,
  maxZoom: 3,
  minZoom: 0.1,
  format: "jpeg",
  quality: 0.95,
  uploadImageFn: uploadPostImage,
};

export { ImageCropper };
