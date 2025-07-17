// Calendar utility constants and functions
export const months = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export const monthsShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export const daysOfWeek = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

export const categories = [
  "all",
  "Kajian",
  "Pendidikan",
  "Sosial",
  "Ibadah",
  "Lainnya",
];

// Calendar utility functions
export const getDaysInMonth = (month, year) =>
  new Date(year, month + 1, 0).getDate();
export const getFirstDayOfMonth = (month, year) =>
  new Date(year, month, 1).getDay();

// Helper functions for category colors and icons
export const getCategoryColor = (category) => {
  switch (category) {
    case "Kajian":
      return "bg-green-600";
    case "Pendidikan":
      return "bg-emerald-600";
    case "Sosial":
      return "bg-teal-600";
    case "Ibadah":
      return "bg-green-700";
    default:
      return "bg-gray-600";
  }
};

export const getCategoryColorLight = (category) => {
  switch (category) {
    case "Kajian":
      return "bg-green-50 text-green-700 border-green-200";
    case "Pendidikan":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Sosial":
      return "bg-teal-50 text-teal-700 border-teal-200";
    case "Ibadah":
      return "bg-green-50 text-green-800 border-green-300";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

export const getCategoryIcon = (category) => {
  switch (category) {
    case "Kajian":
      return "📚";
    case "Pendidikan":
      return "🎓";
    case "Sosial":
      return "🤝";
    case "Ibadah":
      return "🕌";
    default:
      return "📅";
  }
};

// Date utilities
export const isToday = (date) => {
  const today = new Date();
  return date.toDateString() === today.toDateString();
};

export const isWeekend = (date) => {
  const day = date.getDay();
  return day === 0 || day === 6;
};

export const formatEventDate = (date) => {
  return new Date(date).toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};

export const formatEventTime = (date) => {
  return new Date(date).toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};
