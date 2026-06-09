import { useState, useRef, useEffect, useCallback } from 'react';
import { vocabWordsExtended } from '../../data/english/vocabulary-extended';
import type { VocabWord } from '../../types/english';

const vocabMap = new Map<string, VocabWord>();
vocabWordsExtended.forEach(w => vocabMap.set(w.word.toLowerCase(), w));

// Quick lookup: tries exact match, then lowercase, then partial
function lookupWord(text: string): VocabWord | null {
  const clean = text.trim().toLowerCase().replace(/[^a-z\s-]/g, '');
  if (!clean || clean.length < 2) return null;
  // exact match
  if (vocabMap.has(clean)) return vocabMap.get(clean)!;
  // try removing trailing 's' for plurals
  if (clean.endsWith('s') && vocabMap.has(clean.slice(0, -1))) return vocabMap.get(clean.slice(0, -1))!;
  // try removing trailing 'ing' for gerunds
  if (clean.endsWith('ing') && clean.length > 5) {
    const base = clean.slice(0, -3);
    if (vocabMap.has(base)) return vocabMap.get(base)!;
    if (vocabMap.has(base + 'e')) return vocabMap.get(base + 'e')!;
  }
  // try removing trailing 'ed' for past tense
  if (clean.endsWith('ed') && clean.length > 4) {
    const base = clean.slice(0, -2);
    if (vocabMap.has(base)) return vocabMap.get(base)!;
    if (vocabMap.has(base + 'e')) return vocabMap.get(base + 'e')!;
  }
  // partial match (word contains)
  for (const [key, val] of vocabMap) {
    if (clean.includes(key) || key.includes(clean)) return val;
  }
  return null;
}

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function ClickableText({ children, className }: Props) {
  const [popup, setPopup] = useState<{ word: VocabWord; x: number; y: number } | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const selection = window.getSelection();
    const selectedText = selection?.toString().trim();

    // Use selected text if available, otherwise try to get clicked word
    const text = (selectedText && selectedText.length > 1 && selectedText.length < 30)
      ? selectedText
      : target.textContent?.trim().slice(0, 30) || '';

    const word = lookupWord(text);
    if (word) {
      const rect = target.getBoundingClientRect();
      const containerRect = containerRef.current?.getBoundingClientRect();
      setPopup({
        word,
        x: rect.left + rect.width / 2 - (containerRect?.left || 0),
        y: rect.top - (containerRect?.top || 0) - 8,
      });
      // Clear selection
      selection?.removeAllRanges();
    }
  }, []);

  useEffect(() => {
    if (popup) {
      const timer = setTimeout(() => setPopup(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [popup]);

  return (
    <div ref={containerRef} onClick={handleClick} className={`relative ${className || ''}`}>
      {children}

      {popup && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: `${popup.x}px`,
            top: `${popup.y}px`,
            transform: 'translate(-50%, -100%)',
          }}
        >
          <div className="bg-slate-800 text-white rounded-xl p-3 shadow-2xl max-w-xs animate-bounce">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-base">{popup.word.word}</span>
              <span className="text-slate-400 text-xs">{popup.word.phonetic}</span>
            </div>
            <div className="text-sm text-slate-300">
              <span className="text-primary-300 font-medium">{popup.word.translation}</span>
              <span className="text-slate-500 text-xs ml-1">{popup.word.partOfSpeech}</span>
            </div>
            {popup.word.exampleSentence && (
              <div className="text-xs text-slate-400 mt-1 italic">
                "{popup.word.exampleSentence}"
              </div>
            )}
          </div>
          {/* Arrow */}
          <div className="w-0 h-0 mx-auto border-l-8 border-r-8 border-t-8 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
}
