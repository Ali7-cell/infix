'use client';

import React, { useState } from 'react';
import { usePOS } from '@/context/POSContext';
import { MenuItem } from '@/types/pos';
import { Plus, Search, Edit3, Trash2, X, UtensilsCrossed } from 'lucide-react';
import { PermissionGuard } from '@/components/layout/PermissionGuard';

export default function MenuManagementPage() {
  const {
    menuItems,
    categories,
    addMenuItem,
    updateMenuItem,
    deleteMenuItem,
    settings,
    hasPermission,
  } = usePOS();

  const canAdd = hasPermission('menu', 'canAdd');
  const canEdit = hasPermission('menu', 'canEdit');
  const canDelete = hasPermission('menu', 'canDelete');

  const [selectedCat, setSelectedCat] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [costPrice, setCostPrice] = useState<number>(0);
  const [categoryId, setCategoryId] = useState(categories[1]?.id || 'cat-burgers');
  const [imageUrl, setImageUrl] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');

  const filteredItems = menuItems.filter((i) => {
    const matchCat = selectedCat === 'ALL' || i.categoryId === selectedCat;
    const matchSearch =
      search === '' ||
      i.name.toLowerCase().includes(search.toLowerCase()) ||
      i.barcode?.includes(search);
    return matchCat && matchSearch;
  });

  const handleOpenAdd = () => {
    setEditingItem(null);
    setName('');
    setPrice(0);
    setCostPrice(0);
    setImageUrl('');
    setBarcode('');
    setDescription('');
    setShowAddModal(true);
  };

  const handleOpenEdit = (item: MenuItem) => {
    setEditingItem(item);
    setName(item.name);
    setPrice(item.price);
    setCostPrice(item.costPrice || 0);
    setCategoryId(item.categoryId);
    setImageUrl(item.imageUrl || '');
    setBarcode(item.barcode || '');
    setDescription(item.description || '');
    setShowAddModal(true);
  };

  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || price <= 0) return;

    const catObj = categories.find((c) => c.id === categoryId);

    if (editingItem) {
      updateMenuItem(editingItem.id, {
        name,
        price,
        costPrice,
        categoryId,
        categoryName: catObj?.name,
        imageUrl,
        barcode,
        description,
      });
    } else {
      addMenuItem({
        name,
        price,
        costPrice,
        categoryId,
        categoryName: catObj?.name,
        imageUrl: imageUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&auto=format&fit=crop&q=80',
        barcode,
        description,
        isAvailable: true,
      });
    }
    setShowAddModal(false);
  };

  return (
    <PermissionGuard module="menu">
      <div className="flex-1 flex flex-col h-full bg-[#FAF5EC] overflow-hidden">
        {/* Header */}
        <div className="bg-white border-b border-[#D9C4A5] px-8 py-5">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-xl font-brand font-bold text-[#2B180F]">Menu & Food Catalog</h1>
              <p className="text-xs text-[#725B49]">
                Manage dishes, prices, categories, and item availability across Zaad
              </p>
            </div>

            <div className="flex items-center gap-3">
              {canAdd && (
                <button
                  onClick={handleOpenAdd}
                  className="btn-wood btn-wood-primary px-4 py-2 text-xs font-bold rounded-xl shadow-md"
                >
                  <Plus className="w-4 h-4 text-[#F1D18A]" />
                  <span>Add New Item</span>
                </button>
              )}
            </div>
          </div>

        {/* Categories Bar & Search */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-[#FAF5EC] pt-3">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <button
              onClick={() => setSelectedCat('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                selectedCat === 'ALL'
                  ? 'btn-wood text-white !border-[#D6A447]'
                  : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5]/70 hover:bg-[#EFE3D0]'
              }`}
            >
              All Categories
            </button>
            {categories.filter((c) => c.id !== 'cat-all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                  selectedCat === cat.id
                    ? 'btn-wood text-white !border-[#D6A447]'
                    : 'bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5]/70 hover:bg-[#EFE3D0]'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>

          <div className="relative w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#8B572F]" />
            <input
              type="text"
              placeholder="Search dishes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-1.5 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl text-xs text-[#2B180F] focus:outline-none focus:ring-2 focus:ring-[#D6A447]/30 focus:border-[#D6A447]"
            />
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="bg-white rounded-2xl border border-[#D9C4A5] shadow-sm overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FAF5EC] border-b border-[#D9C4A5] text-[#5A2E19] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">Dish Details</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Cost</th>
                <th className="py-3.5 px-4">Profit Margin</th>
                <th className="py-3.5 px-4">Availability</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF5EC]">
              {filteredItems.map((item) => {
                const profit = item.costPrice ? item.price - item.costPrice : 0;
                const margin = item.costPrice ? Math.round((profit / item.price) * 100) : 0;

                return (
                  <tr key={item.id} className="hover:bg-[#FAF5EC]/70 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-[#FAF5EC] overflow-hidden shrink-0 border border-[#D9C4A5]">
                          {item.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UtensilsCrossed className="w-5 h-5 text-[#8B572F] m-auto mt-3" />
                          )}
                        </div>
                        <div>
                          <p className="font-brand font-bold text-[#2B180F] text-sm">{item.name}</p>
                          <p className="text-[11px] text-[#725B49] line-clamp-1 max-w-xs">
                            {item.description || 'No description provided'}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2.5 py-1 rounded-md bg-[#FAF5EC] text-[#5A2E19] border border-[#D9C4A5] font-bold text-[11px]">
                        {item.categoryName || 'General'}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-black text-[#3B1F12]">
                      {settings.currencySymbol} {item.price.toLocaleString()}
                    </td>

                    <td className="py-3 px-4 text-[#725B49]">
                      {item.costPrice
                        ? `${settings.currencySymbol} ${item.costPrice.toLocaleString()}`
                        : '-'}
                    </td>

                    <td className="py-3 px-4">
                      {margin > 0 ? (
                        <span className="text-emerald-700 font-bold text-[11px]">
                          +{margin}% ({settings.currencySymbol} {profit})
                        </span>
                      ) : (
                        '-'
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <button
                        onClick={() =>
                          updateMenuItem(item.id, { isAvailable: !item.isAvailable })
                        }
                        className={`px-3 py-1 rounded-full text-[11px] font-bold transition-all ${
                          item.isAvailable
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                            : 'bg-rose-50 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {item.isAvailable ? 'In Stock' : 'Out of Stock'}
                      </button>
                    </td>

                    <td className="py-3 px-4 text-right space-x-1">
                      {canEdit && (
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-[#8B572F] hover:text-[#2B180F] rounded-lg hover:bg-[#FAF5EC] transition-colors"
                          title="Edit Dish"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          onClick={() => {
                            if (confirm(`Delete "${item.name}" from menu?`)) {
                              deleteMenuItem(item.id);
                            }
                          }}
                          className="p-1.5 text-[#8B572F] hover:text-rose-600 rounded-lg hover:bg-[#FAF5EC] transition-colors"
                          title="Delete Dish"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {!canEdit && !canDelete && (
                        <span className="text-[10px] text-[#725B49] italic">Read-Only</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-[#1D0C05]/65 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleSaveItem}
            className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4 border border-[#D9C4A5] animate-in fade-in"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[#D9C4A5]">
              <h3 className="font-brand font-bold text-[#2B180F] text-base">
                {editingItem ? 'Edit Menu Dish' : 'Add New Menu Dish'}
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-[#8B572F] hover:text-[#2B180F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="col-span-2">
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Dish Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zinger Burger"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Selling Price (Rs.) *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  value={price || ''}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Cost Price (Rs.)
                </label>
                <input
                  type="number"
                  min="0"
                  value={costPrice || ''}
                  onChange={(e) => setCostPrice(Number(e.target.value))}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Category *
                </label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                >
                  {categories.filter((c) => c.id !== 'cat-all').map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Barcode / SKU
                </label>
                <input
                  type="text"
                  placeholder="e.g. 8901001"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>

              <div className="col-span-2">
                <label className="font-bold text-[#3B1F12] block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Ingredients, preparation details..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2 bg-[#FAF5EC] border border-[#D9C4A5] rounded-xl outline-none text-[#2B180F] focus:border-[#D6A447]"
                />
              </div>
            </div>

            <div className="pt-3 flex gap-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="btn-wood-secondary flex-1 py-2.5 rounded-xl text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-wood flex-1 py-2.5 rounded-xl text-xs font-bold shadow-md"
              >
                Save Dish
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  </PermissionGuard>
);
}
