import React from "react";
import { X, User, Calendar } from "lucide-react";

const NewsViewModal = ({ isOpen, onClose, news }) => {
  if (!isOpen || !news) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Preview Berita</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">{news.title}</h1>

            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center">
                <User size={16} className="mr-1" />
                {news.author}
              </div>
              <div className="flex items-center">
                <Calendar size={16} className="mr-1" />
                {new Date(news.createdAt).toLocaleDateString("id-ID", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>

            {news.image && (
              <div className="my-6">
                <img
                  src={news.image}
                  alt={news.title}
                  className="w-full h-64 object-cover rounded-lg"
                  onError={(e) => {
                    e.target.style.display = "none";
                  }}
                />
              </div>
            )}

            <div
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: news.content }}
            />
          </div>

          <div className="flex justify-end pt-6 border-t mt-6">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NewsViewModal;
