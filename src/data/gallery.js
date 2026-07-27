import { products } from './products'
export const gallery = products.slice(0, 8).map((product, index) => ({ id: index + 1, image: product.images[0], title: product.name, category: product.category }))
