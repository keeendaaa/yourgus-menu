import { MenuItem } from '../types';
import dishesData from './dishes.json';

// Маппинг категорий из JSON в категории приложения
const categoryMapping: Record<string, 'appetizers' | 'soups' | 'mains' | 'desserts' | 'drinks'> = {
  'Салаты и закуски': 'appetizers',
  'Выпечка': 'appetizers',
  'Горячие блюда': 'mains',
  'Шашлык & Гриль': 'mains',
  'Рыба и морепродукты': 'mains',
  'Греческий стрит фуд': 'mains',
  'Гарниры': 'mains',
  'Напитки': 'drinks',
  'Десерты': 'desserts',
};

// Функция для парсинга цены из строки "1 900 ₽" в число
const parsePrice = (priceString: string): number => {
  if (!priceString) return 0;
  // Убираем все пробелы и символ ₽, затем парсим
  const cleaned = priceString.replace(/\s/g, '').replace('₽', '');
  return parseInt(cleaned, 10) || 0;
};

// Генерация ID из названия
const generateId = (name: string, index: number): string => {
  return `dish_${index}_${name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-zа-яё0-9_]/g, '')}`;
};

// Генерация тегов на основе категории и названия
const generateTags = (category: string, name: string, description: string): string[] => {
  const tags: string[] = [];
  
  // Теги по категории
  if (category.includes('Греческий')) tags.push('греческое');
  if (category.includes('Стрит фуд')) tags.push('стрит-фуд');
  if (category.includes('Шашлык') || category.includes('Гриль')) tags.push('гриль');
  if (category.includes('Рыба') || category.includes('морепродукты')) tags.push('с рыбой');
  if (category.includes('Выпечка')) tags.push('выпечка');
  if (category.includes('Салаты')) tags.push('салат');
  
  // Теги по названию
  const nameLower = name.toLowerCase();
  if (nameLower.includes('гиро') || nameLower.includes('сувлаки')) tags.push('популярное');
  if (nameLower.includes('мезе')) tags.push('мезе', 'популярное');
  if (nameLower.includes('мини')) tags.push('мини');
  
  // Теги по описанию
  const descLower = description.toLowerCase();
  if (descLower.includes('традиционный')) tags.push('традиционное');
  if (descLower.includes('греческий')) tags.push('греческое');
  
  return [...new Set(tags)]; // Убираем дубликаты
};

// Конвертация данных - фильтруем только блюда с категориями
export const restaurantMenuFromParse: MenuItem[] = dishesData
  .filter((dish: any) => dish.category != null) // Убираем блюда без категории
  .map((dish: any, index: number) => {
  const category = dish.category;
  const mappedCategory = categoryMapping[category] || 'mains';
  
  // Определяем популярные блюда
  const popularDishes = [
    'Гиро', 'Сувлаки', 'Греческое мясное мезе', 'Морское мезе', 
    'Тиропита', 'Спанакопита', 'Салат Хорьятики'
  ];
  const isPopular = popularDishes.some(pop => dish.name.includes(pop));
  
  // Определяем избранные
  const favoriteDishes = ['Гиро', 'Сувлаки', 'Тиропита'];
  const isFavorite = favoriteDishes.some(fav => dish.name.includes(fav));
  
  // Путь к изображению - исправляем путь для загрузки из public/images
  // В JSON путь: "images/тиропита.jpg"
  // Vite автоматически обрабатывает пути из public
  // Используем import.meta.env.BASE_URL для правильного пути с учетом base: '/mvp/'
  const baseUrl = import.meta.env.BASE_URL || '/';
  let imagePath = `${baseUrl}images/restaurant-table.jpg`.replace('//', '/');
  if (dish.image_url) {
    if (dish.image_url.startsWith('/')) {
      imagePath = `${baseUrl}${dish.image_url.slice(1)}`.replace('//', '/');
    } else if (dish.image_url.startsWith('images/')) {
      // "images/тиропита.jpg" -> "/images/тиропита.jpg" или "/mvp/images/тиропита.jpg"
      imagePath = `${baseUrl}${dish.image_url}`.replace('//', '/');
    } else {
      imagePath = `${baseUrl}images/${dish.image_url}`.replace('//', '/');
    }
  }
  
  return {
    id: generateId(dish.name, index),
    name: dish.name,
    description: dish.description || '',
    price: parsePrice(dish.price),
    image: imagePath,
    category: mappedCategory,
    subcategory: category,
    weight: undefined,
    ingredients: [],
    allergens: [],
    tags: generateTags(category, dish.name, dish.description || ''),
    isPopular,
    isFavorite,
    isNew: false,
  };
});

