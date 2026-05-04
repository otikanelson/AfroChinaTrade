import { useEffect, useState } from 'react'
import { Search, Check, X } from 'lucide-react'
import Layout from '@/components/Layout'
import apiClient from '@/services/api'
import { Review } from '@/types'

export default function Reviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await apiClient.get('/reviews')
        setReviews(response.data)
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
  }, [])

  const filteredReviews = reviews.filter((r) =>
    r.comment.toLowerCase().includes(search.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-700'
      case 'rejected':
        return 'bg-error/10 text-error'
      default:
        return 'bg-yellow-100 text-yellow-700'
    }
  }

  const renderStars = (rating: number) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating)
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-neutral-900">Reviews</h1>
          <p className="text-neutral-600 mt-1">Moderate product reviews</p>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
          <input
            type="text"
            placeholder="Search reviews..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-neutral-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-700/30 focus:border-red-700"
          />
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8 text-neutral-500">Loading...</div>
          ) : filteredReviews.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">No reviews found</div>
          ) : (
            filteredReviews.map((review) => (
              <div key={review.id} className="bg-white rounded-lg border border-neutral-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-medium text-neutral-900">Product: {review.productId}</p>
                    <p className="text-sm text-neutral-600">By: {review.userId}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(review.status)}`}>
                    {review.status}
                  </span>
                </div>

                <div className="mb-4">
                  <p className="text-lg text-accent mb-2">{renderStars(review.rating)}</p>
                  <p className="text-neutral-700">{review.comment}</p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-neutral-100">
                  <button className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                    <Check size={18} />
                    Approve
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-error/10 text-error rounded-lg hover:bg-error/20 transition-colors">
                    <X size={18} />
                    Reject
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </Layout>
  )
}
