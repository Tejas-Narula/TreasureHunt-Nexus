import { useEffect, useState } from 'react';

/**
 * Types out a string character-by-character, slowly, then stops.
 * Does not loop. Splits on sentence boundaries ("X. Y.") so it can
 * pause briefly between sentences, matching how the clue reads.
 *
 * Scoped to the Mission page only — nothing outside pages/mission
 * depends on this.
 */
export function useTypewriter(
  fullText: string,
  { charDelay = 45, sentenceDelay = 450, startDelay = 300 } = {}
) {
  const [displayedText, setDisplayedText] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timeouts.push(setTimeout(resolve, ms));
      });

    // Split "A. B." into ["A.", "B."] so we can pause between sentences.
    const sentences = fullText
      .split(/(?<=\.)\s+/)
      .filter(Boolean);

    setDisplayedText('');
    setIsDone(false);

    async function run() {
      await wait(startDelay);
      let soFar = '';
      for (let s = 0; s < sentences.length; s++) {
        if (cancelled) return;
        const sentence = sentences[s];
        const prefix = soFar ? soFar + ' ' : '';
        for (let c = 1; c <= sentence.length; c++) {
          if (cancelled) return;
          await wait(charDelay);
          if (cancelled) return;
          setDisplayedText(prefix + sentence.slice(0, c));
        }
        soFar = prefix + sentence;
        if (cancelled) return;
        await wait(sentenceDelay);
      }
      if (!cancelled) setIsDone(true);
    }

    run();
    return () => {
      cancelled = true;
      timeouts.forEach(clearTimeout);
    };
  }, [fullText, charDelay, sentenceDelay, startDelay]);

  return { displayedText, isDone };
}
