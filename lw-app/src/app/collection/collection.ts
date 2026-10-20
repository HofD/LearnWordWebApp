import { Card } from "../card/card";

export class Collection {
    constructor(
        public id: number,
        public name: string,
        public cards: Array<Card>,
        public visibility: number = 0,
        public publicId: string = '',
        public forkedFromCollectionId: number | null = null
    ) { }
}