export interface BaseEntity {
  id: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface User extends BaseEntity {
  firstName: string
  lastName: string
  email: string
  password: string
}

export interface Book extends BaseEntity {
  title: string
  athour: string
  isbn: string
  description: string
  ownerId: string
  reviews: number
}
