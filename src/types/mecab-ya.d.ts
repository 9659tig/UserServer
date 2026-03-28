declare module 'mecab-ya' {
  interface Mecab {
    pos(
      text: string,
      callback: (err: Error | null, result: string[][]) => void,
    ): void;
  }
  const mecab: Mecab;
  export default mecab;
}
