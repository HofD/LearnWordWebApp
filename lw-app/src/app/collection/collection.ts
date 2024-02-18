import { Card } from "../card/card";

export class Collection {
    constructor(
        public id: number,
        public name: string,
        public cards: Array<Card>
    ) { }
}