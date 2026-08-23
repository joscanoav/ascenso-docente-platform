// Parses the `explanation` string into visual sections WITHOUT altering the
// original text. Pure presentation transform: JSON -> explanation -> parser -> UI.
//
// Detected pattern (verified against the full question bank before building this):
//   "La respuesta correcta es X porque..."      -> correct-answer block
//   "X es incorrecta porque..." (one per option)  -> incorrect-option blocks
//   "TIP / RECUERDA: ..."                         -> tip block (optional)
//   trailing "\n\n*...*" block                    -> extra context/passage (optional)
//
// If the text doesn't match this pattern, parse() returns { ok: false } and
// the caller should fall back to rendering the raw text as a plain paragraph.
// This guarantees old-format explanations (or anything unexpected) never
// break the UI.

const CORRECT_RE = /La respuesta correcta es\s+([A-D])\s+porque/i;
const INCORRECT_RE = /\b([A-D])\s+es incorrecta porque/gi;
const TIP_RE = /TIP\s*\/\s*RECUERDA\s*:?\s*/i;
const PASSAGE_RE = /\n\n\*([\s\S]+?)\*\s*$/;

export function parseExplanation(raw) {
  if (typeof raw !== 'string' || !raw.trim()) {
    return { ok: false, raw: raw || '' };
  }

  let text = raw;
  let passage = null;

  const passageMatch = PASSAGE_RE.exec(text);
  if (passageMatch) {
    passage = passageMatch[1].trim();
    text = text.slice(0, passageMatch.index);
  }

  let tip = null;
  const tipMatch = TIP_RE.exec(text);
  if (tipMatch) {
    tip = text.slice(tipMatch.index + tipMatch[0].length).trim();
    text = text.slice(0, tipMatch.index).trim();
  }

  const correctMatch = CORRECT_RE.exec(text);
  if (!correctMatch) {
    // Doesn't match the expected pedagogical pattern at all - safe fallback.
    return { ok: false, raw };
  }

  // Reset lastIndex since INCORRECT_RE is a global regex reused across calls.
  INCORRECT_RE.lastIndex = 0;
  const incorrectMatches = [];
  let m;
  while ((m = INCORRECT_RE.exec(text)) !== null) {
    incorrectMatches.push({ letter: m[1].toUpperCase(), index: m.index });
  }

  const correctEnd = incorrectMatches.length > 0 ? incorrectMatches[0].index : text.length;
  const correctBlock = text.slice(correctMatch.index, correctEnd).trim();

  const incorrectBlocks = incorrectMatches.map((im, i) => {
    const end = i + 1 < incorrectMatches.length ? incorrectMatches[i + 1].index : text.length;
    return {
      letter: im.letter,
      text: text.slice(im.index, end).trim()
    };
  });

  return {
    ok: true,
    correctLetter: correctMatch[1].toUpperCase(),
    correctBlock,
    incorrectBlocks,
    tip,
    passage
  };
}
