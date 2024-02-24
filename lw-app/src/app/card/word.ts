export class Word {
    constructor(
        public id: number | null,
        public value: string,
        public transcription: string,
        public translation: string
    ) { }
}