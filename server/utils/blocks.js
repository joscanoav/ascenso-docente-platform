const ACADEMIC_BLOCKS = [
  'methodologies',
  'reading',
  'writing',
  'listening',
  'speaking',
  'grammar_vocabulary'
];

const BLOCK_LABELS = {
  methodologies: 'Metodologias',
  reading: 'Reading',
  writing: 'Writing',
  listening: 'Listening',
  speaking: 'Speaking',
  grammar_vocabulary: 'Grammar & Vocabulary'
};

function round(num, decimals = 1) {
  const factor = 10 ** decimals;
  return Math.round(num * factor) / factor;
}

function percentage(correct, total) {
  if (!total) return 0;
  return round((correct / total) * 100);
}

module.exports = { ACADEMIC_BLOCKS, BLOCK_LABELS, round, percentage };
