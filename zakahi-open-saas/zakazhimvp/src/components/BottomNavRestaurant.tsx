import { Sparkles, UtensilsCrossed, Bot } from 'lucide-react';

interface BottomNavRestaurantProps {
  activeView: string;
  onViewChange: (view: string) => void;
}

export default function BottomNavRestaurant({
  activeView,
  onViewChange,
}: BottomNavRestaurantProps) {
  const tabs = [
    { id: 'collections', label: 'подборки', icon: Sparkles },
    { id: 'menu', label: 'меню', icon: UtensilsCrossed },
    { id: 'assistant', label: 'AI официант', icon: Bot },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50 safe-area-bottom">
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = activeView === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onViewChange(tab.id)}
              className={`flex flex-col items-center justify-center gap-1 px-2 py-2 rounded-lg transition-colors relative min-w-[60px] ${
                isActive ? 'text-gray-900' : 'text-gray-400'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs">{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
