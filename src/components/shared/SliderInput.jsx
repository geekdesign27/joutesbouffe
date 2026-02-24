import { useState, useEffect, useRef, useCallback } from 'react';

export function SliderInput({
  label,
  value,
  onChange,
  min = 0,
  max = 500,
  step = 1,
  unit = '',
  className = '',
}) {
  const [localMax, setLocalMax] = useState(max);
  const [localValue, setLocalValue] = useState(value);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(value);
    }
  }, [value]);

  useEffect(() => {
    if (localValue > localMax) {
      setLocalMax(Math.ceil(localValue * 1.5));
    }
  }, [localValue, localMax]);

  const commitValue = useCallback((v) => {
    if (v !== value) onChange(v);
  }, [onChange, value]);

  const handleSlider = (e) => {
    isDragging.current = true;
    setLocalValue(Number(e.target.value));
  };

  const handleSliderEnd = () => {
    isDragging.current = false;
    commitValue(localValue);
  };

  const handleInput = (e) => {
    const v = Number(e.target.value);
    if (isNaN(v)) return;
    setLocalValue(v);
  };

  const handleInputBlur = () => {
    commitValue(localValue);
  };

  const handleMaxChange = (e) => {
    const newMax = Number(e.target.value);
    if (isNaN(newMax) || newMax <= 0) return;
    setLocalMax(newMax);
    if (localValue > newMax) {
      setLocalValue(newMax);
      commitValue(newMax);
    }
  };

  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && (
        <span className="text-sm font-medium">{label}</span>
      )}
      <div className="flex items-center gap-3">
        <input
          type="range"
          min={min}
          max={localMax}
          step={step}
          value={localValue}
          onChange={handleSlider}
          onMouseUp={handleSliderEnd}
          onTouchEnd={handleSliderEnd}
          className="range range-primary range-sm flex-1"
        />
        <input
          type="number"
          value={localValue}
          onChange={handleInput}
          onBlur={handleInputBlur}
          min={min}
          step={step}
          className="input input-sm w-24 text-right font-mono"
        />
        {unit && <span className="text-sm text-base-content/60">{unit}</span>}
      </div>
      <div className="flex justify-between text-xs text-base-content/40 mt-1">
        <span>{min.toLocaleString('fr-CH')}</span>
        <input
          type="number"
          value={localMax}
          onChange={handleMaxChange}
          className="input input-ghost input-xs w-20 text-right p-0"
          title="Max ajustable"
        />
      </div>
    </div>
  );
}
