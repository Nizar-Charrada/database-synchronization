import { randProduct } from '@ngneat/falso'
import { BOPREFIX, HOPREFIX, TABLENAME, COLUMNLIST } from './constants'

export type IData = { article: string, quantite: number, prix: number, date: string }[]

export const generateData = (nbRows: number): IData => {
    const data: IData = []
    for (let i = 0; i < nbRows; i++) {
        const product = randProduct()
        const article = product.title
        const quantite = Math.floor(Math.random() * 100)
        const prix = Math.floor(Math.random() * 100)
        const date = `2019-01-${Math.floor(Math.random() * 30) + 1}`
        data.push({ article, quantite, prix, date })
    }
    return data
}