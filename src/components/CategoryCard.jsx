import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { HiOutlinePhoto } from "react-icons/hi2";

function CategoryCard({ category }) {
  const navigate = useNavigate()
  const imagePath = category?.image
  const [failedImagePath, setFailedImagePath] = useState(null)

  return category ? (
    <div onClick={() => navigate(`/categories/${category.id}`)} className="category-card border-base-300">
      {imagePath && failedImagePath !== imagePath ? (
        <img
          src={`/storage/${imagePath}`}
          alt={category.name}
          className="category-card__image"
          onError={() => setFailedImagePath(imagePath)}
        />
      ) : (
        <div className="category-card__empty bg-base-300/10">
          <HiOutlinePhoto className="category-card__empty-icon text-base-400/60" />
        </div>
      )}

      <div className="category-card__content">
        <h3 className="category-card__name">{category.name}</h3>
      </div>
    </div>
  ) : null
}

export default CategoryCard
