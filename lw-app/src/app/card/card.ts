import { Word } from "./word";

export class Card {
    constructor(
        public id: number,
        public collectionId: number,
        public learnt: boolean,
        public words: Array<Word>
    ) { }
}