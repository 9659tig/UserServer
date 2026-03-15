declare module 'mecab-ya' {
  type MecabCallback = (err: Error | null, result: string[][]) => void;

  const mecab: {
    pos(text: string, callback: MecabCallback): void;
    morphs(text: string, callback: MecabCallback): void;
    nouns(text: string, callback: MecabCallback): void;
  };

  export default mecab;
}
