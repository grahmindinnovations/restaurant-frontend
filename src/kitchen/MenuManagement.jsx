import React from 'react'
import tw, { styled } from 'twin.macro'
import { Plus, MoreVertical, Search, ChevronDown, Edit2, Trash2, Package } from 'lucide-react'

const SectionTitle = tw.h3`text-lg font-bold text-slate-800`
const SearchInput = tw.div`relative mb-6`
const SearchField = tw.input`w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all`

const MenuList = tw.div`space-y-4 overflow-y-auto flex-1 pr-2`
const MenuItemCard = tw.div`flex items-center gap-4 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer border border-transparent hover:border-slate-100 relative`

const MenuImg = styled.img`
  ${tw`w-16 h-16 rounded-xl object-cover shadow-sm group-hover:scale-105 transition-transform`}
  background-color: #f1f5f9;
`

const ImageWithFallback = ({ src, alt, ...props }) => {
  const [error, setError] = React.useState(false)
  const fallback = "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=200&q=80"
  
  return (
    <MenuImg 
      src={error || !src ? fallback : src} 
      alt={alt} 
      onError={() => setError(true)}
      {...props} 
    />
  )
}

const MenuInfo = tw.div`flex-1`
const MenuTitle = tw.h4`font-bold text-slate-800 text-sm mb-1`
const MenuMeta = tw.div`flex items-center gap-3 text-xs text-slate-500`
const PendingBadge = tw.span`text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold`
const MenuActions = tw.div`absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity`
const MenuActionBtn = tw.button`p-1.5 bg-white rounded-lg shadow-sm border border-slate-100 text-slate-400 hover:text-rose-600 hover:border-rose-200`

export default function MenuManagement({ menuItems, onAddDish, onEditDish, onDeleteDish, onUpdateQuantity, onRefresh }) {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false)
  const menuRef = React.useRef(null)

  React.useEffect(() => {
    const onPointerDown = (e) => {
      if (!menuRef.current) return
      if (menuRef.current.contains(e.target)) return
      setIsMenuOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  const refresh = async () => {
    if (typeof onRefresh !== 'function') return
    setIsMenuOpen(false)
    try {
      await onRefresh()
    } catch (e) {
      console.error('Menu refresh failed:', e)
      alert('Failed to refresh menu.')
    }
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <SectionTitle>Menu Management</SectionTitle>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onAddDish}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-600 text-white font-semibold shadow-sm hover:bg-rose-700 active:scale-[0.99] transition"
            title="Add Dish"
          >
            <Plus size={18} />
            <span>Add Dish</span>
          </button>
          <div ref={menuRef} className="relative">
            <button
              type="button"
              className="inline-flex items-center justify-center h-10 w-10 rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition"
              onClick={() => setIsMenuOpen((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={isMenuOpen}
              title="More"
            >
              <MoreVertical size={18} />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden z-20">
                <button
                  type="button"
                  onClick={refresh}
                  disabled={typeof onRefresh !== 'function'}
                  className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  Refresh Menu
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <SearchInput>
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <SearchField type="text" placeholder="Search Item..." />
      </SearchInput>

      <div className="flex items-center justify-between mb-4 text-sm font-medium text-slate-500">
        <span>All Categories</span>
        <ChevronDown size={14} />
      </div>

      <MenuList>
        {menuItems.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            No items found. <br /> Click “Add Dish” to add a menu item.
          </div>
        )}
        {menuItems.map((item) => (
          <MenuItemCard key={item.id} className="group">
            <ImageWithFallback src={item.image_url} alt={item.name} />
            <MenuInfo>
              <MenuTitle>{item.name}</MenuTitle>
              <MenuMeta>
                <PendingBadge>{item.pending_orders_count || 0} Pending</PendingBadge>
                <span>• {item.daily_quantity} left</span>
                <span>• {item.size || 'Regular'}</span>
              </MenuMeta>
            </MenuInfo>
            
            <MenuActions>
              <MenuActionBtn onClick={() => onUpdateQuantity(item.id, item.daily_quantity)} title="Update Qty">
                <Package size={14} />
              </MenuActionBtn>
              <MenuActionBtn onClick={() => onEditDish?.(item)} title="Edit Dish">
                <Edit2 size={14} />
              </MenuActionBtn>
              <MenuActionBtn onClick={() => onDeleteDish(item.id)}>
                <Trash2 size={14} />
              </MenuActionBtn>
            </MenuActions>
          </MenuItemCard>
        ))}
      </MenuList>
    </>
  )
}

