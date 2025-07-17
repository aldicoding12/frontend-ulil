import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import costumAPI from "../../api";

function DetailBerita() {
  const { id } = useParams();
  const [berita, setBerita] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dataBerita = async () => {
    try {
      setLoading(true);
      const { data } = await costumAPI.get(`news/${id}`);
      console.log(data);
      setBerita(data.data);
      setError(null);
    } catch (error) {
      console.error("Gagal mengambil data berita:", error);
      setError("Gagal memuat berita. Silakan coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      dataBerita();
    }
  }, [id]);

  // Format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    };
    return new Date(dateString).toLocaleDateString("id-ID", options);
  };

  // Handle share functionality
  const handleShare = (platform) => {
    const url = window.location.href;
    const title = berita?.title || "";

    switch (platform) {
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
            url
          )}`,
          "_blank"
        );
        break;
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?url=${encodeURIComponent(
            url
          )}&text=${encodeURIComponent(title)}`,
          "_blank"
        );
        break;
      case "whatsapp":
        window.open(
          `https://wa.me/?text=${encodeURIComponent(title + " " + url)}`,
          "_blank"
        );
        break;
      default:
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
          alert("Link berhasil disalin!");
        });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-center">
          <p>{error}</p>
          <button
            onClick={dataBerita}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  if (!berita) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-gray-500">Berita tidak ditemukan</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            {berita.title}
          </h1>

          {/* Meta Info */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-6">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                  clipRule="evenodd"
                />
              </svg>
              <span className="font-medium">{berita.author}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{formatDate(berita.createdAt)}</span>
            </div>
          </div>

          {/* Share */}
          <div className="flex flex-wrap items-center gap-2 mb-6">
            <span className="text-sm font-medium text-gray-700">Bagikan:</span>
            <button
              onClick={() => handleShare("facebook")}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
              Facebook
            </button>
            <button
              onClick={() => handleShare("twitter")}
              className="px-3 py-1 bg-sky-500 text-white text-sm rounded hover:bg-sky-600 transition-colors">
              Twitter
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors">
              WhatsApp
            </button>
            <button
              onClick={() => handleShare("copy")}
              className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors">
              Salin Link
            </button>
          </div>
        </div>

        {/* Featured Image */}
        {berita.image && (
          <div className="px-6">
            <img
              src={berita.image}
              alt={berita.title}
              className="w-full h-64 md:h-96 object-cover rounded-lg"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
            <p className="text-sm text-gray-500 mt-2 text-center">
              {formatDate(berita.createdAt)}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="px-6 py-6">
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-800 leading-relaxed whitespace-pre-line">
              <span className="font-bold text-green-600">ULIL ALBAB</span> -{" "}
              {berita.content}
            </p>
          </div>
        </div>

        {/* Tags (if available) */}
        {berita.tags && berita.tags.length > 0 && (
          <div className="px-6 py-4 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700">Tags:</span>
              {berita.tags.map((tag, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}

export default DetailBerita;
