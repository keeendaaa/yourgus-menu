import React, { useState, useEffect } from 'react';
import { MenuItem } from './types';
import { restaurantMenuFromParse as restaurantMenu } from './data/restaurant-menu-from-parse';
import CollectionsScreenNew from './components/CollectionsScreenNew';
import MenuScreenNew from './components/MenuScreenNew';
import AIAssistantNew from './components/AIAssistantNew';
import BottomNavRestaurant from './components/BottomNavRestaurant';
import { Toaster } from './components/ui/sonner';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeView, setActiveView] = useState<string>('collections');
  const [restaurantId, setRestaurantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Получаем ID ресторана из URL
  useEffect(() => {
    const path = window.location.pathname;
    const match = path.match(/\/restaurant\/(\d+)/);
    if (match) {
      setRestaurantId(match[1]);
    }
  }, []);

  // Скрываем экран загрузки после загрузки
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  // Обработка кнопки "назад" на телефоне
  useEffect(() => {
    // Добавляем запись в историю при первой загрузке
    if (window.history.state === null) {
      window.history.pushState({ preventBack: true }, '');
    }

    const handlePopState = (event: PopStateEvent) => {
      // Предотвращаем выход из приложения
      if (event.state && event.state.preventBack) {
        window.history.pushState({ preventBack: true }, '');
      } else {
        window.history.pushState({ preventBack: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-white"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center"
            >
              <motion.img
                src={`${import.meta.env.BASE_URL || '/'}logo.png`}
                alt="Йоргос Греческая Таверна"
                className="w-48 h-auto mx-auto mb-4"
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              />
              <motion.div
                className="w-12 h-1 bg-[#0068AD] mx-auto rounded-full"
                initial={{ width: 0 }}
                animate={{ width: 48 }}
                transition={{ duration: 1, delay: 0.5 }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {!isLoading && (
        <>
          {activeView === 'collections' && (
            <CollectionsScreenNew menuItems={restaurantMenu} />
          )}

          {activeView === 'menu' && (
            <MenuScreenNew menuItems={restaurantMenu} />
          )}

          {activeView === 'assistant' && (
            <AIAssistantNew menuItems={restaurantMenu} />
          )}

          <BottomNavRestaurant
            activeView={activeView}
            onViewChange={setActiveView}
          />

          <Toaster position="top-center" richColors />
        </>
      )}
    </div>
  );
}
