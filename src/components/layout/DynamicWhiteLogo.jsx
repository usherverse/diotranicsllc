import React, { useState, useEffect } from 'react';

const DynamicWhiteLogo = ({ src, alt, className, style, onSunFound }) => {
  const [dataUrl, setDataUrl] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      ctx.drawImage(img, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      let minX = canvas.width, minY = canvas.height, maxX = 0, maxY = 0;
      let sumX = 0, sumY = 0, yellowCount = 0;
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        const a = data[i+3];
        
        if (a === 0) continue;
        
        const isYellow = r > 160 && g > 130 && b < 100;
        
        let outA, outR, outG, outB;
        if (isYellow) {
           outR = r; outG = g; outB = b; outA = a;
           const x = (i / 4) % canvas.width;
           const y = Math.floor((i / 4) / canvas.width);
           // Only count pixels in the top 45% of the total height as the "sun" 
           // to avoid the drill rig pulling the centroid right/down.
           if (y < canvas.height * 0.45) {
             sumX += x;
             sumY += y;
             yellowCount++;
           }
        } else {
           const brightness = (r + g + b) / 3;
           const darkness = 255 - brightness;
           outA = Math.min(255, Math.max(0, (darkness - 10) * 1.5));
           outR = 255; outG = 255; outB = 255;
        }
        
        data[i] = outR;
        data[i+1] = outG;
        data[i+2] = outB;
        data[i+3] = outA;
        
        if (outA > 15) {
          const x = (i / 4) % canvas.width;
          const y = Math.floor((i / 4) / canvas.width);
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      
      if (maxX > minX && maxY > minY) {
        const padding = 2;
        const cropX = Math.max(0, minX - padding);
        const cropY = Math.max(0, minY - padding);
        const cropW = Math.min(canvas.width - 1, maxX + padding) - cropX + 1;
        const cropH = Math.min(canvas.height - 1, maxY + padding) - cropY + 1;
        
        const cropCanvas = document.createElement('canvas');
        cropCanvas.width = cropW;
        cropCanvas.height = cropH;
        cropCanvas.getContext('2d').drawImage(canvas, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
        
        setDataUrl(cropCanvas.toDataURL('image/png'));

        if (onSunFound && yellowCount > 0) {
          const sunCenterX = sumX / yellowCount;
          const sunCenterY = sumY / yellowCount;
          onSunFound({
            xPerc: ((sunCenterX - cropX) / cropW) * 100,
            yPerc: ((sunCenterY - cropY) / cropH) * 100
          });
        }
      } else {
        setDataUrl(canvas.toDataURL('image/png'));
      }
    };
    img.src = src;
  }, [src, onSunFound]);

  if (!dataUrl) return null;

  return <img src={dataUrl} alt={alt} className={className} style={style} />;
};

export default DynamicWhiteLogo;
