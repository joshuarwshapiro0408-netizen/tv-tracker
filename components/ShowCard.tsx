import Link from 'next/link'
import Image from 'next/image'
import { tmdbImageUrl } from '@/lib/tmdb'
import { TMDBShow } from '@/lib/types'

export default function ShowCard({ show }: { show: TMDBShow }) {
  const imageUrl = tmdbImageUrl(show.poster_path, 'w185')

  return (
    <Link href={`/shows/${show.id}`} className="group flex gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
      <div className="flex-shrink-0 w-12 h-18 rounded overflow-hidden bg-gray-700">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={show.name}
            width={48}
            height={72}
            className="object-cover w-full h-full"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs text-center p-1">
            No image
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white font-medium group-hover:text-blue-400 transition-colors truncate">
          {show.name}
        </p>
        <p className="text-gray-400 text-sm mt-0.5">
          {show.first_air_date ? new Date(show.first_air_date).getFullYear() : 'Unknown year'}
        </p>
        <p className="text-gray-500 text-sm mt-1 line-clamp-2">{show.overview}</p>
      </div>
    </Link>
  )
}
