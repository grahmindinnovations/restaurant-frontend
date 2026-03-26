import { Plus } from 'lucide-react'
import { Card, CardContent } from '../../components/ui/card'
import { Button } from '../../components/ui/button'

export default function MenuCard({ item, onAdd }){
  const available = item.available !== false
  const popularRank = Number(item.popularRank) || 0
  return (
    <Card className={`shadow-soft overflow-hidden transition-opacity ${!available ? 'opacity-60 grayscale' : ''}`}>
      <div className="relative h-32 w-full">
        {item.image ? (
          <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">No Image</div>
        )}
        {popularRank > 0 && available && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center rounded-full bg-rose-600 text-white px-2 py-1 text-[10px] font-extrabold tracking-wide shadow">
              {popularRank === 1 ? 'Top Seller' : 'Popular'}
            </span>
          </div>
        )}
        {!available && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white font-bold bg-red-600 px-2 py-1 rounded text-sm">Unavailable</span>
          </div>
        )}
      </div>
      <CardContent>
        <div className="flex items-start justify-between">
          <div>
            <div className="font-semibold">{item.name}</div>
            <div className="text-sm text-gray-500">₹{item.price.toFixed(2)}</div>
          </div>
          <Button 
            size="sm" 
            variant="primary" 
            onClick={()=>onAdd(item)} 
            disabled={!available}
            className="rounded-full h-9 w-9 p-0"
          >
            <Plus size={18} />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

