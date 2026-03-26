import MenuCard from './MenuCard'

export default function MenuGrid({ items, onAdd }){
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {items.map(item => <MenuCard key={item.id} item={item} onAdd={onAdd} />)}
    </div>
  )
}

