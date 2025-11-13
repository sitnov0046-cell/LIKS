import { StarryBackground } from '@/components/StarryBackground';

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center pb-24">
      <StarryBackground />
      <div className="text-center">
        <div className="text-5xl mb-3">⏳</div>
        <p className="text-white/90 text-base drop-shadow-lg">Загрузка...</p>
      </div>
    </div>
  );
}
