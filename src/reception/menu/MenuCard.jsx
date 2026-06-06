import { Plus } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { resolveMenuImageUrl } from '../../lib/menuImageUrl'

export default function MenuCard({ item, onAdd }) {
  const available = item.available !== false
  const popularRank = Number(item.popularRank) || 0
  const imageSrc = resolveMenuImageUrl(item.image || item.image_url)

  return (
    <div
      className={`flex flex-col rounded-lg border border-neutral-200 bg-white overflow-hidden ${
        !available ? 'opacity-50' : 'hover:border-neutral-300'
      }`}
    >
      <div className="relative h-[5.5rem] w-full bg-neutral-100 shrink-0">
        {imageSrc ? (
          <img src={imageSrc} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[10px] text-neutral-400">
            No image
          </div>
        )}
        {popularRank > 0 && available && (
          <span className="absolute top-1.5 left-1.5 rounded bg-neutral-900 px-1.5 py-0.5 text-[9px] font-medium text-white">
            Popular
          </span>
        )}
        {!available && (
          <div className="absolute inset-0 flex items-center justify-center bg-neutral-900/45">
            <span className="text-[10px] font-medium text-white">Unavailable</span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col justify-between gap-2 p-2.5 min-h-[4.25rem]">
        <div className="min-w-0">
          <div className="line-clamp-2 text-sm font-medium text-neutral-900 leading-snug">{item.name}</div>
          <div className="mt-0.5 text-xs text-neutral-500">₹{item.price.toFixed(2)}</div>
        </div>
        <Button
          size="sm"
          variant="default"
          onClick={() => onAdd(item)}
          disabled={!available}
          className="h-8 w-full rounded-md text-xs"
          aria-label={`Add ${item.name}`}
        >
          <Plus size={14} className="mr-1" />
          Add
        </Button>
      </div>
    </div>
  )
}
