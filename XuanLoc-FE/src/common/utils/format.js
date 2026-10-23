export const formatCurrency = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return `${num.toLocaleString('vi-VN')} đ`;
};

export const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('vi-VN');
};

// "2026-09" -> "09/2026"
export const formatMonthYear = (monthStr) => {
  if (!monthStr) return '—';
  const [year, month] = monthStr.split('-');
  return `${month}/${year}`;
};

// BE lưu class_schedules.start_time/end_time dạng @db.Time không kèm timezone, ép parse
// theo digit-literal UTC (xem schedule.service.js) -> đọc lại cũng phải dùng getUTCHours/Minutes,
// không được dùng getHours (sẽ lệch theo timezone trình duyệt).
export const formatTime = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  const h = String(date.getUTCHours()).padStart(2, '0');
  const m = String(date.getUTCMinutes()).padStart(2, '0');
  return `${h}:${m}`;
};

export const formatPercent = (value) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '—';
  return `${num.toFixed(1)}%`;
};
