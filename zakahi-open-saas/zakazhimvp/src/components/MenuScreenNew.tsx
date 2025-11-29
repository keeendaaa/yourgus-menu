import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { MenuItem } from '../types';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Search, Filter, X } from 'lucide-react';
import ItemDetailSheet from './ItemDetailSheet';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet';

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

interface MenuScreenNewProps {
  menuItems: MenuItem[];
}

const categoryLabels = {
  all: 'Все',
  'Выпечка': 'Выпечка',
  'Салаты и закуски': 'Салаты и закуски',
  'Шашлык & Гриль': 'Шашлык & Гриль',
  'Рыба и морепродукты': 'Рыба и морепродукты',
  'Горячие блюда': 'Горячие блюда',
  'Греческий стрит фуд': 'Греческий стрит фуд',
  'Гарниры': 'Гарниры',
};

export default function MenuScreenNew({ menuItems }: MenuScreenNewProps) {
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [excludedAllergens, setExcludedAllergens] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000]);
  const [caloriesRange, setCaloriesRange] = useState<[number, number]>([0, 2000]);
  const [showOnlyPopular, setShowOnlyPopular] = useState(false);
  const [showOnlyNew, setShowOnlyNew] = useState(false);
  const [showOnlyFavorite, setShowOnlyFavorite] = useState(false);

  const categories = Object.keys(categoryLabels).filter(cat => cat !== 'all');
  
  // Get all unique tags from menu items in current category
  // But filter selected tags to only those available in current category
  const allTags = Array.from(
    new Set(
      menuItems
        .filter(item => activeCategory === 'all' || item.category === activeCategory)
        .flatMap(item => item.tags || [])
    )
  ).sort();

  // Get all unique allergens from menu items in current category
  const allAllergens = Array.from(
    new Set(
      menuItems
        .filter(item => activeCategory === 'all' || item.category === activeCategory)
        .flatMap(item => item.allergens || [])
    )
  ).sort();

  // Get price range from menu items
  const categoryItems = menuItems.filter(item => {
    if (activeCategory === 'all') return true;
    return item.subcategory === activeCategory;
  });
  const minPrice = categoryItems.length > 0 ? Math.min(...categoryItems.map(item => item.price || 0)) : 0;
  const maxPrice = categoryItems.length > 0 ? Math.max(...categoryItems.map(item => item.price || 0)) : 10000;
  const minCalories = categoryItems.length > 0 ? Math.min(...categoryItems.map(item => item.calories || 0).filter(c => c > 0)) : 0;
  const maxCalories = categoryItems.length > 0 ? Math.max(...categoryItems.map(item => item.calories || 0)) : 2000;

  // Reset ranges when category changes
  useEffect(() => {
    setPriceRange([minPrice, maxPrice]);
    setCaloriesRange([minCalories, maxCalories]);
  }, [activeCategory, minPrice, maxPrice, minCalories, maxCalories]);

  const toggleTag = (tag: string) => {
    setSelectedTags(prev => 
      prev.includes(tag) 
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const toggleAllergen = (allergen: string) => {
    setExcludedAllergens(prev => 
      prev.includes(allergen) 
        ? prev.filter(a => a !== allergen)
        : [...prev, allergen]
    );
  };

  const clearFilters = () => {
    setSelectedTags([]);
    setExcludedAllergens([]);
    setPriceRange([minPrice, maxPrice]);
  };

  const hasActiveFilters = () => {
    return (
      selectedTags.length > 0 ||
      excludedAllergens.length > 0 ||
      priceRange[0] !== minPrice ||
      priceRange[1] !== maxPrice
    );
  };

  const activeFiltersCount = () => {
    let count = 0;
    if (selectedTags.length > 0) count += selectedTags.length;
    if (excludedAllergens.length > 0) count += excludedAllergens.length;
    if (priceRange[0] !== minPrice || priceRange[1] !== maxPrice) count += 1;
    return count;
  };

  // Filter items based on category, search query and all filters
  const filteredItems = menuItems.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.subcategory === activeCategory;
    if (!matchesCategory) return false;
    
    // Search filter
    if (searchQuery) {
      const matchesSearch = (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      if (!matchesSearch) return false;
    }
    
    // Tags filter
    if (selectedTags.length > 0) {
      const matchesTags = selectedTags.some(tag => 
        item.tags?.includes(tag)
      );
      if (!matchesTags) return false;
    }
    
    // Allergens filter (exclude items with selected allergens)
    if (excludedAllergens.length > 0) {
      const hasExcludedAllergen = excludedAllergens.some(allergen =>
        item.allergens?.includes(allergen)
      );
      if (hasExcludedAllergen) return false;
    }
    
    // Price filter
    const itemPrice = item.price || 0;
    if (itemPrice < priceRange[0] || itemPrice > priceRange[1]) return false;
    
    
    return true;
  });

  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 pb-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-40 bg-white pt-6 px-4 pb-2 shadow-md border-b border-amber-100">
        <div className="text-center mb-4">
          <h1 className="mb-2 text-2xl font-bold text-amber-900" style={{ fontFamily: 'serif' }}>
            Йоргос Греческая Таверна
          </h1>
          <p className="text-xs text-amber-800 italic">
            "Греческое веселье - это не праздник, это образ жизни..."
          </p>
        </div>
        
        {/* Search Bar */}
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="relative flex items-center">
            <input
              type="text"
              placeholder="Поиск блюд..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pr-12 py-3 bg-white/90 backdrop-blur-sm rounded-2xl border border-amber-200 focus:border-amber-500 focus:ring-2 focus:ring-amber-200 focus:outline-none transition-all text-base shadow-sm"
              style={{ paddingLeft: '16px' }}
            />
            <Search className="absolute right-4 text-amber-600 w-5 h-5 pointer-events-none" />
          </div>
        </motion.div>
        
        {/* Category tabs and filters */}
        <div className="flex flex-col gap-4 pb-4">
          <div className="flex gap-6 overflow-x-auto scrollbar-hide">
            {categories.map(category => (
              <motion.button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`pb-2 whitespace-nowrap transition-all relative ${
                  activeCategory === category
                    ? 'text-[#0068AD] font-semibold'
                    : 'text-amber-600 hover:text-amber-800'
                }`}
                whileTap={{ scale: 0.95 }}
              >
                {categoryLabels[category as keyof typeof categoryLabels] || category}
                {activeCategory === category && (
                  <motion.div
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0068AD]"
                    layoutId="activeTab"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
          
          <motion.button
            onClick={() => setShowFilters(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all whitespace-nowrap flex-shrink-0 ${
              hasActiveFilters()
                ? 'bg-[#0068AD] text-white'
                : 'bg-white/80 text-amber-700 border border-amber-200 hover:bg-amber-50'
            }`}
            whileTap={{ scale: 0.95 }}
          >
            <Filter className="w-4 h-4" />
            <span>Фильтры</span>
            {hasActiveFilters() && (
              <span className="bg-white text-[#0068AD] rounded-full px-2 py-0.5 text-xs font-semibold">
                {activeFiltersCount()}
              </span>
            )}
          </motion.button>
        </div>
      </div>

      <div className="px-4 pt-6">
        {/* Items list */}
        <motion.section 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
          key={activeCategory}
        >
          {filteredItems.map((item, index) => {
            // First item - horizontal card
            if (index === 0) {
              return (
                <motion.div
                  key={item.id}
                  variants={itemVariants}
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-[0.98] transition-all flex items-center gap-4 scroll-mt-[250px]"
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <ImageWithFallback
                    src={item.image}
                    alt={item.name}
                    className="w-28 h-28 object-cover rounded-xl flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="mb-1">{item.name}</h3>
                    <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                      {item.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span>{item.price} ₽</span>
                    </div>
                  </div>
                </motion.div>
              );
            }

            // Grid items in pairs
            const isEven = (index - 1) % 2 === 0;
            if (!isEven) return null;

            const nextItem = filteredItems[index + 1];

            return (
              <motion.div 
                key={item.id} 
                className="grid grid-cols-2 gap-4"
                variants={itemVariants}
              >
                {/* Current item */}
                <motion.div
                  className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
                  onClick={() => setSelectedItem(item)}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className="aspect-square mb-3">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>
                  <h3 className="text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                    {item.name}
                  </h3>
                  <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                    {item.weight}
                  </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{item.price} ₽</span>
                    </div>
                </motion.div>

                {/* Next item if exists */}
                {nextItem && (
                  <motion.div
                    className="bg-white rounded-2xl p-4 shadow-sm cursor-pointer hover:shadow-lg hover:-translate-y-1 active:scale-95 transition-all"
                    onClick={() => setSelectedItem(nextItem)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div className="aspect-square mb-3">
                      <ImageWithFallback
                        src={nextItem.image}
                        alt={nextItem.name}
                        className="w-full h-full object-cover rounded-xl"
                      />
                    </div>
                    <h3 className="text-sm mb-1 line-clamp-2 min-h-[2.5rem]">
                      {nextItem.name}
                    </h3>
                    <p className="text-xs text-gray-500 mb-2 line-clamp-2">
                      {nextItem.weight}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">{nextItem.price} ₽</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </motion.section>
      </div>

      {/* Item Detail Sheet */}
      {selectedItem && (
        <ItemDetailSheet
          item={selectedItem}
          menuItems={menuItems}
          onClose={() => setSelectedItem(null)}
          onItemSelect={setSelectedItem}
        />
      )}

      {/* Filters Sheet */}
      <Sheet open={showFilters} onOpenChange={setShowFilters}>
        <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl overflow-y-auto p-0">
          <div className="px-6 pt-6">
            <SheetHeader>
              <div className="flex items-center justify-between mb-4">
                <SheetTitle>Фильтры</SheetTitle>
                {hasActiveFilters() && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-[#0068AD] hover:text-[#005a94]"
                  >
                    Сбросить все
                  </button>
                )}
              </div>
            </SheetHeader>
          </div>
          
          <div className="px-6 mt-6 space-y-6 pb-6">
            {/* Tags Filter */}
            {allTags.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Теги</h3>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allTags.map(tag => {
                    const isSelected = selectedTags.includes(tag);
                    return (
                      <motion.button
                        key={tag}
                        onClick={() => toggleTag(tag)}
                        className={`px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                          isSelected
                            ? 'text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        style={isSelected ? { backgroundColor: '#0068AD' } : {}}
                        whileTap={{ scale: 0.95 }}
                      >
                        {tag}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Allergens Filter */}
            {allAllergens.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Исключить аллергены</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Выберите аллергены, которые нужно исключить из результатов
                </p>
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                  {allAllergens.map(allergen => {
                    const isExcluded = excludedAllergens.includes(allergen);
                    return (
                      <motion.button
                        key={allergen}
                        onClick={() => toggleAllergen(allergen)}
                        className={`px-4 py-2 rounded-full text-sm transition-all whitespace-nowrap flex-shrink-0 ${
                          isExcluded
                            ? 'bg-red-100 text-red-700 border-2 border-red-300'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                        whileTap={{ scale: 0.95 }}
                      >
                        {isExcluded && '✕ '}
                        {allergen}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Price Range */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">
                Цена: {priceRange[0]} ₽ - {priceRange[1]} ₽
              </h3>
              <div className="space-y-2">
                <div className="flex gap-4 items-center">
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                  <span className="text-gray-400">—</span>
                  <input
                    type="number"
                    min={minPrice}
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                  />
                </div>
                <input
                  type="range"
                  min={minPrice}
                  max={maxPrice}
                  value={priceRange[1]}
                  onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                  className="w-full"
                />
              </div>
            </div>

          </div>
        </SheetContent>
      </Sheet>
    </motion.div>
  );
}
