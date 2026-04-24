import React from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

/**
 * Reusable dark-themed DatePicker.
 * value: 'YYYY-MM-DD' string or ''
 * onChange: receives 'YYYY-MM-DD' string or ''
 * showTime: if true, shows time picker too
 * placeholder: input placeholder
 */
export default function DatePickerInput({ value, onChange, showTime, placeholder, minDate, maxDate }) {
  const toDate = (str) => {
    if (!str) return null;
    const d = new Date(str + (str.includes('T') ? '' : 'T12:00:00'));
    return isNaN(d.getTime()) ? null : d;
  };

  const fromDate = (d) => {
    if (!d) return '';
    if (showTime) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      const hh = String(d.getHours()).padStart(2, '0');
      const min = String(d.getMinutes()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
    }
    return d.toISOString().split('T')[0];
  };

  return (
    <DatePicker
      selected={toDate(value)}
      onChange={(d) => onChange(fromDate(d))}
      dateFormat={showTime ? "MMM d, yyyy h:mm aa" : "MMM d, yyyy"}
      showTimeSelect={!!showTime}
      timeFormat="h:mm aa"
      timeIntervals={15}
      placeholderText={placeholder || 'Select date...'}
      minDate={toDate(minDate)}
      maxDate={toDate(maxDate)}
      isClearable
      showPopperArrow={false}
      popperPlacement="bottom-start"
      className="datepicker-dark-input"
      calendarClassName="datepicker-dark-calendar"
      wrapperClassName="datepicker-dark-wrapper"
    />
  );
}
