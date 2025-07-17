import React, { useState, useEffect } from "react";
import {
  Clock,
  MapPin,
  Calendar,
  X,
  AlertCircle,
  Users,
  ArrowRight,
  CalendarDays,
  Star,
  Eye,
  UserPlus,
  CheckCircle,
  Share2,
  Heart,
  Phone,
  Mail,
  Loader2,
} from "lucide-react";
import { Coordinates, CalculationMethod, PrayerTimes } from "adhan";
import costumAPI from "../../api";

// Custom hook for user location
const useGeolocation = () => {
  const [location, setLocation] = useState({
    coordinates: null,
    city: null,
    country: null,
    loading: true,
    error: null,
  });

  const getLocationName = async (lat, lng) => {
    try {
      // Using free OpenStreetMap Nominatim reverse geocoding
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=id`
      );
      const data = await response.json();

      return {
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          data.address?.county ||
          "Unknown",
        country: data.address?.country || "Unknown",
      };
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return { city: "Unknown", country: "Unknown" };
    }
  };

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((prev) => ({
        ...prev,
        loading: false,
        error: "Geolocation tidak didukung browser ini",
      }));
      return;
    }

    const options = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000, // Cache for 5 minutes
    };

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const locationName = await getLocationName(latitude, longitude);

        setLocation({
          coordinates: { latitude, longitude },
          city: locationName.city,
          country: locationName.country,
          loading: false,
          error: null,
        });
      },
      (error) => {
        let errorMessage = "Gagal mendapatkan lokasi";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Akses lokasi ditolak. Menggunakan lokasi default Makassar.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Informasi lokasi tidak tersedia. Menggunakan lokasi default Makassar.";
            break;
          case error.TIMEOUT:
            errorMessage =
              "Timeout mencari lokasi. Menggunakan lokasi default Makassar.";
            break;
        }

        // Use Makassar as fallback
        setLocation({
          coordinates: { latitude: -5.147665, longitude: 119.432732 },
          city: "Makassar",
          country: "Indonesia",
          loading: false,
          error: errorMessage,
        });
      },
      options
    );
  }, []);

  return location;
};

// Custom hook for prayer times using Adhan library with user location
const usePrayerTimes = () => {
  const location = useGeolocation();
  const [prayerTimes, setPrayerTimes] = useState({});
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState("");
  const [currentTime, setCurrentTime] = useState(new Date());

  const prayerNames = {
    fajr: "Subuh",
    dhuhr: "Dzuhur",
    asr: "Ashar",
    maghrib: "Maghrib",
    isha: "Isya",
  };

  const prayerIcons = {
    fajr: "🌅",
    dhuhr: "☀️",
    asr: "🌤️",
    maghrib: "🌅",
    isha: "🌙",
  };

  const calculatePrayerTimes = (date = new Date(), coords) => {
    if (!coords) return {};

    try {
      const coordinates = new Coordinates(coords.latitude, coords.longitude);

      // Auto-select calculation method based on country/region
      let params;
      if (
        location.country === "Indonesia" ||
        location.country === "Malaysia" ||
        location.country === "Singapore"
      ) {
        params = CalculationMethod.Singapore();
      } else if (location.country === "Saudi Arabia") {
        params = CalculationMethod.UmmAlQura();
      } else if (location.country === "Egypt") {
        params = CalculationMethod.Egyptian();
      } else {
        params = CalculationMethod.MuslimWorldLeague();
      }

      const times = new PrayerTimes(coordinates, date, params);

      return {
        fajr: times.fajr,
        dhuhr: times.dhuhr,
        asr: times.asr,
        maghrib: times.maghrib,
        isha: times.isha,
      };
    } catch (error) {
      console.error("Prayer times calculation error:", error);
      return {};
    }
  };

  const findNextPrayer = (currentTime, times) => {
    const prayers = ["fajr", "dhuhr", "asr", "maghrib", "isha"];

    for (const prayer of prayers) {
      if (times[prayer] && currentTime < times[prayer]) {
        return { name: prayer, time: times[prayer] };
      }
    }

    // If all prayers passed, next is tomorrow's Fajr
    const tomorrow = new Date(currentTime);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowTimes = calculatePrayerTimes(tomorrow, location.coordinates);

    return tomorrowTimes.fajr
      ? { name: "fajr", time: tomorrowTimes.fajr, isTomorrow: true }
      : null;
  };

  const formatCountdown = (targetTime, currentTime) => {
    const diff = targetTime - currentTime;
    if (diff <= 0) return "00:00:00";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
  };

  const formatTime = (date) => {
    if (!date) return "--:--";
    return date.toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  useEffect(() => {
    if (!location.coordinates) return;

    const updateTimes = () => {
      const now = new Date();
      setCurrentTime(now);

      const times = calculatePrayerTimes(now, location.coordinates);
      setPrayerTimes(times);

      const next = findNextPrayer(now, times);
      setNextPrayer(next);

      if (next) {
        setCountdown(formatCountdown(next.time, now));
      }
    };

    updateTimes();
    const interval = setInterval(updateTimes, 1000);
    return () => clearInterval(interval);
  }, [location.coordinates]);

  return {
    prayerTimes,
    nextPrayer,
    countdown,
    currentTime,
    prayerNames,
    prayerIcons,
    formatTime,
    location,
  };
};

// Prayer Times Popup Component
const PrayerTimesPopup = ({ isOpen, onClose }) => {
  const {
    prayerTimes,
    nextPrayer,
    countdown,
    currentTime,
    prayerNames,
    prayerIcons,
    formatTime,
    location,
  } = usePrayerTimes();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-green-800 via-green-700 to-emerald-800 rounded-2xl text-white shadow-2xl border border-green-600/30 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-white/20">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-2 rounded-lg">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Jadwal Shalat Hari Ini</h3>
              <p className="text-green-200 text-sm flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location.loading
                  ? "Mencari lokasi..."
                  : `${location.city}, ${location.country}`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {location.error && (
            <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-3 mb-4 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-yellow-400" />
              <p className="text-yellow-200 text-sm">{location.error}</p>
            </div>
          )}

          <div className="text-center mb-6">
            <div className="text-3xl font-bold font-mono mb-2">
              {currentTime.toLocaleTimeString("id-ID", { hour12: false })}
            </div>
            <div className="text-green-200">
              {currentTime.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </div>
          </div>

          {nextPrayer && (
            <div className="bg-white/10 rounded-xl p-4 mb-6 border border-white/20">
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">
                    {prayerIcons[nextPrayer.name]}
                  </span>
                  <h4 className="text-lg font-semibold">
                    {nextPrayer.isTomorrow ? "Besok - " : ""}
                    {prayerNames[nextPrayer.name]}
                  </h4>
                </div>
                <div className="text-4xl font-bold font-mono mb-2 text-green-300">
                  {countdown}
                </div>
                <p className="text-green-200 text-sm">
                  Menuju waktu {prayerNames[nextPrayer.name]} -{" "}
                  {formatTime(nextPrayer.time)}
                </p>
              </div>
            </div>
          )}

          <div className="space-y-3 mb-6">
            {Object.entries(prayerTimes).map(([prayer, time]) => (
              <div
                key={prayer}
                className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-all">
                <div className="flex items-center gap-3">
                  <span className="text-xl">{prayerIcons[prayer]}</span>
                  <h5 className="font-semibold text-green-100">
                    {prayerNames[prayer]}
                  </h5>
                </div>
                <div className="font-mono text-lg font-bold text-white">
                  {formatTime(time)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center pt-4 border-t border-white/20">
            <div className="flex items-center justify-center gap-2 text-green-200 text-sm">
              <Calendar className="w-4 h-4" />
              <span>
                {new Date().toLocaleDateString("ar-SA", {
                  calendar: "islamic",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Prayer Countdown Card
const PrayerCountdownCard = ({ onShowPopup }) => {
  const {
    nextPrayer,
    countdown,
    currentTime,
    prayerNames,
    prayerIcons,
    location,
  } = usePrayerTimes();

  if (location.loading) {
    return (
      <div className="bg-gradient-to-br from-green-800/90 via-green-700/90 to-emerald-800/90 backdrop-blur-sm rounded-2xl p-4 text-white shadow-2xl border border-green-600/30 max-w-xs">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent mx-auto mb-2"></div>
          <p className="text-sm text-green-200">Mencari lokasi...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-green-800/90 via-green-700/90 to-emerald-800/90 backdrop-blur-sm rounded-2xl p-4 text-white shadow-2xl border border-green-600/30 max-w-xs">
      <div className="text-center">
        <div className="mb-3">
          <div className="text-lg font-bold font-mono mb-1 text-green-200">
            {currentTime.toLocaleTimeString("id-ID", { hour12: false })}
          </div>
          <div className="text-xs text-green-300 flex items-center justify-center gap-1">
            <MapPin className="w-3 h-3" />
            {location.city}
          </div>
        </div>

        {nextPrayer && (
          <div className="bg-white/10 rounded-xl p-3 mb-3 border border-white/20">
            <div className="flex items-center justify-center gap-2 mb-2">
              <span className="text-lg">{prayerIcons[nextPrayer.name]}</span>
              <h4 className="text-sm font-semibold">
                {nextPrayer.isTomorrow ? "Besok - " : ""}
                {prayerNames[nextPrayer.name]}
              </h4>
            </div>
            <div className="text-xl font-bold font-mono mb-1 text-green-300">
              {countdown}
            </div>
          </div>
        )}

        <button
          onClick={onShowPopup}
          className="w-full bg-white/20 hover:bg-white/30 py-2 px-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 font-medium text-sm">
          <Clock className="w-3 h-3" />
          <span>Jadwal Lengkap</span>
        </button>
      </div>
    </div>
  );
};

// Event Countdown Component
const EventCountdown = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor(
          (difference % (1000 * 60 * 60)) / (1000 * 60)
        );
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className="flex gap-2 mt-2">
      {Object.entries(timeLeft).map(([unit, value]) => (
        <div key={unit} className="text-center">
          <div className="bg-white/20 rounded-lg px-2 py-1 min-w-[32px]">
            <div className="text-lg font-bold">
              {value.toString().padStart(2, "0")}
            </div>
          </div>
          <div className="text-xs mt-1 capitalize">
            {unit === "days"
              ? "Hari"
              : unit === "hours"
              ? "Jam"
              : unit === "minutes"
              ? "Menit"
              : "Detik"}
          </div>
        </div>
      ))}
    </div>
  );
};

// Event Detail Modal Component (seperti di KegiatanView)
const EventDetailModal = ({ event, isOpen, onClose, onRegister }) => {
  if (!isOpen || !event) return null;

  const isEventFull = event.registeredCount >= event.maxParticipants;
  const isEventPassed = new Date(event.date) < new Date();

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="relative">
          <img
            src={
              event.image ||
              "https://images.unsplash.com/photo-1584502905346-b7b90d6a7c66?w=600&h=300&fit=crop"
            }
            alt={event.title}
            className="w-full h-64 object-cover rounded-t-2xl"
          />
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors">
            <X className="w-5 h-5" />
          </button>
          {!isEventPassed && (
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-4 text-white">
                <p className="text-center font-medium mb-2">Dimulai dalam:</p>
                <EventCountdown targetDate={event.date} />
              </div>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <span className="inline-block bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium mb-2">
                {event.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {event.title}
              </h2>
            </div>
          </div>

          <p className="text-gray-700 mb-6 leading-relaxed">
            {event.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Tanggal & Waktu</p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleDateString("id-ID", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                  <p className="text-sm text-gray-600">
                    {new Date(event.date).toLocaleTimeString("id-ID", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}{" "}
                    WIB
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Lokasi</p>
                  <p className="text-sm text-gray-600">{event.location}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="w-5 h-5 text-green-600" />
                <div>
                  <p className="font-medium">Peserta</p>
                  <p className="text-sm text-gray-600">
                    {event.registeredCount || 0} / {event.maxParticipants}{" "}
                    terdaftar
                  </p>
                  <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                    <div
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{
                        width: `${
                          ((event.registeredCount || 0) /
                            event.maxParticipants) *
                          100
                        }%`,
                      }}></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="font-medium mb-2">Persyaratan</p>
                <ul className="space-y-1">
                  {event.requirements && event.requirements.length > 0 ? (
                    event.requirements.map((req, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-600">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        {req}
                      </li>
                    ))
                  ) : (
                    <li className="text-sm text-gray-500">
                      Tidak ada persyaratan khusus
                    </li>
                  )}
                </ul>
              </div>

              <div>
                <p className="font-medium mb-2">Kontak</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Phone className="w-4 h-4 text-green-600" />
                    <span>{event.contact || "Hubungi panitia"}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="w-4 h-4 text-green-600" />
                    <span>{event.email || "info@masjid.com"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            {event.isRegistered ? (
              <button className="flex-1 bg-gray-100 text-gray-600 py-3 rounded-lg font-medium flex items-center justify-center gap-2">
                <CheckCircle className="w-5 h-5" />
                Sudah Terdaftar
              </button>
            ) : (
              <button
                onClick={() => onRegister(event)}
                disabled={isEventFull || isEventPassed}
                className="flex-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-3 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors">
                <UserPlus className="w-5 h-5" />
                {isEventPassed
                  ? "Kegiatan Selesai"
                  : isEventFull
                  ? "Penuh"
                  : "Daftar Sekarang"}
              </button>
            )}
            <button className="bg-blue-100 text-blue-600 hover:bg-blue-200 p-3 rounded-lg transition-colors">
              <Share2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Event Card Component dengan warna hijau konsisten
const EventCard = ({ event, index, onViewDetail, onRegister }) => {
  const getCategoryIcon = (category) => {
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

  const getCategoryColor = (category) => {
    switch (category) {
      case "Kajian":
        return "from-green-500 to-green-600";
      case "Pendidikan":
        return "from-emerald-500 to-emerald-600";
      case "Sosial":
        return "from-green-600 to-green-700";
      case "Ibadah":
        return "from-green-700 to-emerald-700";
      default:
        return "from-green-500 to-green-600";
    }
  };

  const isEventSoon = (date) => {
    const now = new Date();
    const eventDate = new Date(date);
    const diffHours = (eventDate - now) / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div
      className={`group relative bg-gradient-to-br ${getCategoryColor(
        event.category
      )} rounded-3xl overflow-hidden shadow-2xl transform transition-all duration-700 hover:scale-105 hover:rotate-1 ${
        index % 2 === 0 ? "hover:-rotate-1" : "hover:rotate-1"
      }`}>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            backgroundSize: "30px 30px",
          }}
        />
      </div>

      {/* Soon Badge */}
      {isEventSoon(event.date) && (
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-yellow-400 text-yellow-900 px-3 py-1 rounded-full text-xs font-bold animate-pulse">
            ⏰ SEGERA!
          </div>
        </div>
      )}

      <div className="relative p-6 text-white h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{getCategoryIcon(event.category)}</div>
            <div>
              <div className="text-sm font-medium opacity-90 uppercase tracking-wide">
                {event.category}
              </div>
              <div className="flex items-center gap-1 text-xs opacity-75">
                <Users className="w-3 h-3" />
                <span>
                  {event.registeredCount || 0}/{event.maxParticipants}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold mb-3 leading-tight group-hover:text-yellow-200 transition-colors">
          {event.title}
        </h3>

        {/* Date & Location */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <CalendarDays className="w-4 h-4" />
            <span>{formatDate(event.date)}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(event.date)} WIB</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4" />
            <span>{event.location}</span>
          </div>
        </div>

        {/* Countdown */}
        <div className="mb-4">
          <div className="text-sm font-medium mb-1">Dimulai dalam:</div>
          <EventCountdown targetDate={event.date} />
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span>Pendaftar</span>
            <span>
              {Math.round(
                ((event.registeredCount || 0) / event.maxParticipants) * 100
              )}
              %
            </span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  ((event.registeredCount || 0) / event.maxParticipants) * 100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        {/* Description */}
        <p className="text-sm opacity-90 leading-relaxed mb-6 line-clamp-3 flex-grow">
          {event.description}
        </p>

        {/* Action Button - dengan style seperti KegiatanView */}
        <div className="mt-auto flex gap-2">
          <button
            onClick={() => onViewDetail(event)}
            className="flex-1 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105">
            <Eye className="w-4 h-4" />
            <span>Detail</span>
          </button>

          <button
            onClick={() => onRegister(event)}
            className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-3 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg">
            <UserPlus className="w-4 h-4" />
            <span>Daftar</span>
          </button>
        </div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute -top-10 -right-10 w-20 h-20 bg-white/10 rounded-full blur-xl" />
      <div className="absolute -bottom-10 -left-10 w-16 h-16 bg-white/10 rounded-full blur-xl" />
    </div>
  );
};

// Registration Form Component
const RegistrationForm = ({ event, isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nama harus diisi";
    } else if (formData.name.trim().length < 3) {
      newErrors.name = "Nama minimal 3 karakter";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Nomor HP harus diisi";
    } else if (!/^[0-9+\-\s]+$/.test(formData.phone)) {
      newErrors.phone = "Format nomor HP tidak valid";
    } else if (formData.phone.replace(/[^0-9]/g, "").length < 10) {
      newErrors.phone = "Nomor HP minimal 10 digit";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);

    try {
      const registrationData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
      };

      await onSubmit(registrationData);

      // Reset form
      setFormData({ name: "", phone: "" });
      setErrors({});
    } catch (error) {
      console.error("Registration error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    // Allow only numbers, +, -, and spaces
    if (/^[0-9+\-\s]*$/.test(value)) {
      setFormData((prev) => ({ ...prev, phone: value }));
      // Clear error when user starts typing
      if (errors.phone) {
        setErrors((prev) => ({ ...prev, phone: "" }));
      }
    }
  };

  const handleNameChange = (e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
    // Clear error when user starts typing
    if (errors.name) {
      setErrors((prev) => ({ ...prev, name: "" }));
    }
  };

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Daftar Kegiatan</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900">{event.title}</h3>
            <p className="text-sm text-gray-600">{event.category}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama Lengkap *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Masukkan nama lengkap"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nomor HP/WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={formData.phone}
                onChange={handlePhoneChange}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent ${
                  errors.phone ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="08xxxxxxxxxx"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                Nomor HP akan digunakan untuk konfirmasi kegiatan
              </p>
            </div>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <AlertCircle className="w-5 h-5 text-yellow-400 mr-2 flex-shrink-0 mt-0.5" />
                <div className="text-sm">
                  <p className="text-yellow-700 font-medium">Perhatian:</p>
                  <p className="text-yellow-600">
                    Pastikan data yang Anda masukkan benar. Anda akan menerima
                    konfirmasi melalui nomor HP yang didaftarkan.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors disabled:opacity-50">
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Daftar Sekarang
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
function DashboardView() {
  const [isVisible, setIsVisible] = useState(false);
  const [berita, setBerita] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventsError, setEventsError] = useState(null);
  const [showPrayerPopup, setShowPrayerPopup] = useState(false);

  // Event modal states
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(false);
  const [registrationEvent, setRegistrationEvent] = useState(null);

  const getBerita = async () => {
    try {
      setLoading(true);
      const { data } = await costumAPI.get("/news?limit=3");
      setBerita(data.data || []);
      setError(null);
    } catch (error) {
      console.error("Error fetching news:", error);
      setError("Gagal memuat berita. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  const getUpcomingEvents = async () => {
    try {
      setEventsLoading(true);
      const { data } = await costumAPI.get("/events/upcoming");
      setEvents(data.data || []);
      setEventsError(null);
    } catch (error) {
      console.error("Error fetching events:", error);
      setEventsError("Gagal memuat kegiatan. Silakan coba lagi.");
    } finally {
      setEventsLoading(false);
    }
  };

  // Handle event detail view
  const handleViewEventDetail = (event) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  // Handle event registration
  const handleEventRegister = (event) => {
    setRegistrationEvent(event);
    setIsRegistrationOpen(true);
  };

  // Handle registration form submission
  const handleSubmitRegistration = async (registrationData) => {
    try {
      await costumAPI.post(
        `/events/${registrationEvent._id}/participants`,
        registrationData
      );

      alert("Pendaftaran berhasil! Anda akan segera menerima konfirmasi.");

      // Refresh events to get updated participant count
      await getUpcomingEvents();

      // Close modals
      setIsRegistrationOpen(false);
      setRegistrationEvent(null);
    } catch (error) {
      console.error("Registration error:", error);

      if (error.response?.status === 400) {
        const message = error.response.data.message;
        if (message.includes("penuh")) {
          alert("Maaf, kegiatan sudah penuh!");
        } else if (message.includes("terdaftar")) {
          alert("Nomor telepon sudah terdaftar untuk kegiatan ini!");
        } else {
          alert(message || "Pendaftaran gagal!");
        }
      } else {
        alert("Terjadi kesalahan saat mendaftar. Silakan coba lagi.");
      }
    }
  };

  useEffect(() => {
    getBerita();
    getUpcomingEvents();
    setIsVisible(true);

    // Show prayer popup after 3 seconds
    const timer = setTimeout(() => {
      setShowPrayerPopup(true);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <>
      <PrayerTimesPopup
        isOpen={showPrayerPopup}
        onClose={() => setShowPrayerPopup(false)}
      />

      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onRegister={handleEventRegister}
      />

      {/* Registration Form Modal */}
      <RegistrationForm
        event={registrationEvent}
        isOpen={isRegistrationOpen}
        onClose={() => {
          setIsRegistrationOpen(false);
          setRegistrationEvent(null);
        }}
        onSubmit={handleSubmitRegistration}
      />

      {/* Hero Section */}
      <div className="relative w-full h-screen overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-fixed transform scale-110 transition-transform duration-1000"
          style={{
            backgroundImage:
              "url(https://res.cloudinary.com/dymmwbvx0/image/upload/v1747143410/bq7xdycb2dsx07jpmuai.jpg)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />

        <div className="absolute inset-0 flex items-start md:items-center pt-20 md:pb-40 justify-between px-6 md:px-12">
          <div
            className={`text-left space-y-6 z-10 transform transition-all duration-1000 flex-1 max-w-2xl ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "-translate-x-20 opacity-0"
            }`}>
            <h3 className="text-3xl md:text-4xl font-bold text-white">
              <span className="inline-block">🕌</span> Ahwal wa Ahsalan
            </h3>
            <h1 className="text-4xl md:text-5xl font-bold text-green-400 drop-shadow-2xl">
              Masjid Ulil Albab
            </h1>
            <h2 className="text-5xl md:text-7xl mt-3 font-bold text-white drop-shadow-xl">
              Universitas Negeri Makassar
            </h2>
            <button
              className="group relative bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold mt-8 px-8 py-4 rounded-lg shadow-xl transform transition-all duration-300 hover:scale-110"
              onClick={() => (window.location.href = "/laporan")}>
              <span className="relative z-10">Lihat Laporan</span>
            </button>
          </div>

          {/* Prayer Countdown Card - Desktop */}
          <div
            className={`hidden lg:block transform transition-all duration-1000 delay-500 ${
              isVisible
                ? "translate-x-0 opacity-100"
                : "translate-x-20 opacity-0"
            }`}>
            <PrayerCountdownCard onShowPopup={() => setShowPrayerPopup(true)} />
          </div>
        </div>

        {/* Prayer Countdown Card - Mobile */}
        <div
          className={`lg:hidden absolute bottom-8 right-6 max-w-xs transform transition-all duration-1000 delay-500 ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-20 opacity-0"
          }`}>
          <PrayerCountdownCard onShowPopup={() => setShowPrayerPopup(true)} />
        </div>
      </div>

      {/* Upcoming Events Section dengan warna hijau konsisten */}
      <section className="min-h-screen px-6 md:px-12 py-20 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            🎯 Kegiatan Mendatang
          </h2>
          <p className="text-green-200 text-lg mb-6">
            Ikuti kegiatan-kegiatan menarik yang akan segera dimulai
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-emerald-500 mx-auto rounded-full" />
        </div>

        {eventsLoading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-transparent"></div>
          </div>
        )}

        {eventsError && !eventsLoading && (
          <div className="text-center py-20">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-white mb-4">{eventsError}</p>
              <button
                onClick={getUpcomingEvents}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {!eventsLoading && !eventsError && (
          <>
            {events.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-8">
                {events.slice(0, 6).map((event, index) => (
                  <EventCard
                    key={event._id || index}
                    event={event}
                    index={index}
                    onViewDetail={handleViewEventDetail}
                    onRegister={handleEventRegister}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Belum Ada Kegiatan Terjadwal
                </h3>
                <p className="text-green-200">
                  Pantau terus untuk update kegiatan terbaru
                </p>
              </div>
            )}

            {events.length > 6 && (
              <div className="text-center">
                <a
                  href="/kegiatan"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105">
                  <span>Lihat Semua Kegiatan</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            )}
          </>
        )}
      </section>

      {/* News Section */}
      <section className="min-h-screen px-6 md:px-12 py-20 bg-gradient-to-br from-green-900 via-green-800 to-emerald-900">
        <div className="text-center mb-12">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-4">
            📰 Berita Terbaru
          </h2>
          <p className="text-green-200 text-lg mb-6">
            Informasi terkini seputar kegiatan masjid dan komunitas
          </p>
          <div className="w-24 h-1 bg-gradient-to-r from-green-400 to-green-600 mx-auto rounded-full" />
        </div>

        {loading && (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-green-400 border-t-transparent"></div>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-20">
            <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-white mb-4">{error}</p>
              <button
                onClick={getBerita}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-300">
                Coba Lagi
              </button>
            </div>
          </div>
        )}

        {!loading && !error && (
          <>
            {berita.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto mb-8">
                {berita.map((item, index) => (
                  <div
                    key={item._id || index}
                    className="group bg-white rounded-2xl shadow-lg overflow-hidden transform transition-all duration-500 hover:scale-105 hover:shadow-2xl">
                    <div className="relative overflow-hidden h-56">
                      <img
                        src={
                          item.image ||
                          "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&h=300&fit=crop"
                        }
                        alt={item.title || "Gambar Berita"}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.src =
                            "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&h=300&fit=crop";
                        }}
                      />
                      <div className="absolute top-4 left-4 bg-green-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                        📅 {item.tanggal || formatDate(item.createdAt)}
                      </div>
                    </div>

                    <div className="p-6 space-y-4">
                      <h2 className="text-xl font-bold text-gray-800 group-hover:text-green-600 transition-colors duration-300">
                        {item.title}
                      </h2>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {item.content?.substring(0, 150)}...
                      </p>
                      <a
                        href={`/berita/${item._id}`}
                        className="inline-flex items-center gap-2 text-green-600 font-semibold hover:text-green-700 transition-all duration-300">
                        <span>Baca Selengkapnya</span>
                        <ArrowRight className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <div className="text-6xl mb-4">📰</div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Belum Ada Berita
                </h3>
                <p className="text-green-200">
                  Pantau terus untuk update berita terbaru
                </p>
              </div>
            )}

            {berita.length > 0 && (
              <div className="text-center">
                <a
                  href="/berita"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-semibold px-8 py-4 rounded-xl shadow-xl transform transition-all duration-300 hover:scale-105">
                  <span>Lihat Semua Berita</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
              </div>
            )}
          </>
        )}
      </section>
      {/* Back to Top Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-green-600 hover:bg-green-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-110 z-50">
        ↑
      </button>

      {/* Custom Styles */}
      <style jsx>{`
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @keyframes float {
          0%,
          100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </>
  );
}

export default DashboardView;
