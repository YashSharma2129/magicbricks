import { useState } from 'react';
import { FaStar } from 'react-icons/fa';
import { addPropertyRating } from '../services/api';
import { useLoading } from '../hooks/useLoading';

const PropertyRatings = ({ propertyId, onRatingAdded }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const { setLoading } = useLoading();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await addPropertyRating(propertyId, { rating, comment });
      setRating(0);
      setComment('');
      if (onRatingAdded) onRatingAdded();
    } catch (error) {
      console.error('Error submitting rating:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-xl font-semibold mb-4">Add Your Review</h3>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          {[...Array(5)].map((_, index) => {
            const ratingValue = index + 1;
            return (
              <button
                type="button"
                key={ratingValue}
                className="text-2xl focus:outline-none"
                onClick={() => setRating(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(0)}
              >
                <FaStar 
                  className={`${
                    ratingValue <= (hover || rating) 
                      ? 'text-yellow-400' 
                      : 'text-gray-300'
                  } transition-colors`}
                />
              </button>
            );
          })}
        </div>

        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500"
          rows="4"
          required
        />

        <button 
          type="submit"
          disabled={!rating}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Submit Review
        </button>
      </form>
    </div>
  );
};

export default PropertyRatings;
