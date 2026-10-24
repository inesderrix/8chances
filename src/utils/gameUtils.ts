// Utilitaire de normalisation des réponses
// Accepte les majuscules/minuscules, accents manquants, espaces extra

function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function normalize(str: string): string {
  return removeAccents(str.trim().toLowerCase()).replace(/\s+/g, ' ');
}

export function matchesAnswer(input: string, correct: string, aliases: string[] = []): boolean {
  const normalInput = normalize(input);
  if (!normalInput || normalInput.length === 0) return false; // Refuse les réponses vides
  const allTargets = [correct, ...aliases].map(normalize);
  return allTargets.some(t => normalInput === t || normalInput.includes(t) || t.includes(normalInput));
}

// Mélange de tableau (Fisher-Yates)
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Sélectionne N éléments aléatoires d'un tableau
export function pickRandom<T>(arr: T[], n: number): T[] {
  return shuffle(arr).slice(0, n);
}

// Formatage des scores avec animations-friendly (ajoute +)
export function formatScore(score: number): string {
  return score.toLocaleString('fr-FR');
}

// Calcule le rang réel d'une option parmi les 8 options triées
export function getRank(optionId: string, sortedOptions: { id: string }[]): number {
  const idx = sortedOptions.findIndex(o => o.id === optionId);
  return idx === -1 ? 8 : idx + 1;
}

// Retourne les points selon le rang (1er = 8 pts, 8e = 1 pt)
export function pointsForRank(rank: number): number {
  return Math.max(1, 9 - rank);
}

// Logique IA ordinateur : choix pondéré (favorise les rangs 1-4)
export function computerPickWeighted(optionIds: string[]): string {
  // Poids décroissants: position 1 = poids 8, position 8 = poids 1
  const weights = [8, 7, 5, 4, 3, 2, 1, 1];
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  let random = Math.random() * totalWeight;
  for (let i = 0; i < optionIds.length; i++) {
    random -= weights[i] ?? 1;
    if (random <= 0) return optionIds[i];
  }
  return optionIds[optionIds.length - 1];
}
