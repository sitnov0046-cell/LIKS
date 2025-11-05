import React, { useState } from 'react';
import { Button } from './Button';

type Model = 'sora' | 'veo';

const GenerationForm = () => {
  const [prompt, setPrompt] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [selectedModel, setSelectedModel] = useState<Model>('sora');

  const handleModelChange = () => {
    setSelectedModel(prev => prev === 'sora' ? 'veo' : 'sora');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
    }
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Здесь будет логика отправки данных для генерации
    console.log('Отправка:', { prompt, imageFile });
  };

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-2xl p-8 border-4 border-gradient">
        <div className="space-y-6">
          <label className="block text-gray-800 font-semibold text-lg">
            ✨ Опишите видео, которое хотите создать
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="mt-3 w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all text-base"
              placeholder="Например: Красивый закат на берегу моря с пальмами, волны плещутся о берег..."
              rows={4}
            />
          </label>

          <div className="mt-6">
            <label className="block text-gray-800 font-semibold mb-3 text-lg">
              🖼️ Добавить референс (необязательно)
            </label>
            <div className="flex items-center space-x-4">
              <label className="flex items-center justify-center px-6 py-3 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition-all">
                <span className="text-gray-700 font-medium">📎 Выбрать изображение</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </label>
              {imageFile && (
                <span className="text-green-600 font-medium flex items-center gap-2">
                  ✓ {imageFile.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Слайдер выбора модели */}
        <div className="mb-6 mt-8">
          <label className="block text-gray-800 font-semibold mb-3 text-lg">
            🤖 Выберите нейросеть
          </label>
          <button
            onClick={handleModelChange}
            type="button"
            className="w-full relative h-16 bg-gray-100 rounded-xl overflow-hidden transition-all duration-300 border-2 border-gray-200 hover:border-purple-300"
          >
            <div
              className={`absolute top-0 h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-300 ${
                selectedModel === 'sora' ? 'left-0 w-1/2' : 'left-1/2 w-1/2'
              }`}
            />
            <div className="relative z-10 h-full flex items-center justify-between px-4">
              <div className={`flex-1 text-center transition-colors duration-300 font-bold text-lg ${
                selectedModel === 'sora' ? 'text-white' : 'text-gray-600'
              }`}>
                Sora 2
              </div>
              <div className={`flex-1 text-center transition-colors duration-300 font-bold text-lg ${
                selectedModel === 'veo' ? 'text-white' : 'text-gray-600'
              }`}>
                Veo 3
              </div>
            </div>
          </button>
        </div>

        <button
          type="submit"
          className="w-full mt-6 text-xl py-5 px-6 rounded-xl font-bold bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 text-white hover:scale-105 active:scale-95 transition-all duration-200 shadow-lg hover:shadow-2xl animate-pulse-slow"
        >
          🎬 Начать генерацию
        </button>
        <p className="text-center text-gray-500 text-sm font-medium mt-3 flex items-center justify-center gap-2">
          <span>💎</span>
          <span>При генерации будет списано 2 токена</span>
        </p>
      </form>
    </div>
  );
};

export default GenerationForm;