export interface BaseEntity {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
  email?: string
}

export interface User extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  password: string
  role: string
}

export interface Book extends BaseEntity {
  title: string
  author: string
  isbn: string
  description: string
  ownerId: string
  reviews: number
  averageRating: number
  reviewCount: number
}
