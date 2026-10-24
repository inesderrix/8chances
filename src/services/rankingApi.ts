import type { RankingOption, RankingQuestion } from '../types/game';
import { rankingQuestions as curatedRankingQuestions } from '../data/rankingQuestions';

const API_ROOT = 'https://api.worldbank.org/v2';
const START_YEAR = 2015;
const END_YEAR = new Date().getFullYear() - 1;
const CACHE_KEY = '8chances_worldbank_rankings_v1';
const MINIMUM_QUESTIONS = 80;

interface RankingIndicator {
  code: string;
  category: string;
  question: string;
  format: 'number' | 'currency' | 'decimal' | 'percent';
}

interface WorldBankCountry {
  id?: unknown;
  iso2Code?: unknown;
  name?: unknown;
  region?: { id?: unknown };
}

interface WorldBankObservation {
  countryiso3code?: unknown;
  country?: { value?: unknown };
  date?: unknown;
  value?: unknown;
}

const INDICATORS: RankingIndicator[] = [
  { code: 'SP.POP.TOTL', category: 'Géographie', question: 'Quel pays est le plus peuplé ?', format: 'number' },
  { code: 'NY.GDP.MKTP.CD', category: 'Économie', question: 'Quel pays a le PIB total le plus élevé ?', format: 'currency' },
  { code: 'NY.GDP.PCAP.CD', category: 'Économie', question: 'Quel pays a le PIB par habitant le plus élevé ?', format: 'currency' },
  { code: 'SP.DYN.LE00.IN', category: 'Santé', question: 'Dans quel pays l’espérance de vie est-elle la plus élevée ?', format: 'decimal' },
  { code: 'EN.ATM.CO2E.PC', category: 'Environnement', question: 'Quel pays émet le plus de CO2 par habitant ?', format: 'decimal' },
  { code: 'IT.NET.USER.ZS', category: 'Technologie', question: 'Dans quel pays la part de la population utilisant Internet est-elle la plus élevée ?', format: 'percent' },
  { code: 'SL.UEM.TOTL.ZS', category: 'Société', question: 'Quel pays a le taux de chômage le plus élevé ?', format: 'percent' },
  { code: 'FP.CPI.TOTL.ZG', category: 'Économie', question: 'Quel pays a connu la plus forte inflation annuelle ?', format: 'percent' },
  { code: 'EG.FEC.RNEW.ZS', category: 'Environnement', question: 'Dans quel pays la part d’énergie renouvelable est-elle la plus élevée ?', format: 'percent' },
  { code: 'AG.LND.FRST.ZS', category: 'Environnement', question: 'Quel pays a la plus grande part de son territoire couverte de forêts ?', format: 'percent' },
  { code: 'SP.URB.TOTL.IN.ZS', category: 'Géographie', question: 'Dans quel pays la part de la population urbaine est-elle la plus élevée ?', format: 'percent' },
  { code: 'SP.DYN.TFRT.IN', category: 'Société', question: 'Quel pays a l’indice de fécondité le plus élevé ?', format: 'decimal' },
  { code: 'NY.GDP.MKTP.KD.ZG', category: 'Économie', question: 'Quel pays a connu la plus forte croissance économique annuelle ?', format: 'percent' },
];

function asObject(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function formatValue(value: number, format: RankingIndicator['format']): string {
  if (format === 'currency') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} $US`;
  }
  if (format === 'percent') {
    return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value)} %`;
  }
  if (format === 'decimal') {
    return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(value);
  }
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, { signal: AbortSignal.timeout(20000) });
  if (!response.ok) throw new Error(`World Bank returned HTTP ${response.status}`);
  const payload = await response.json() as unknown;
  if (import.meta.env.DEV) {
    const label = url.includes('/indicator/')
      ? new URL(url).pathname.split('/').at(-1)
      : 'liste des pays';
    const observations = Array.isArray(payload) && Array.isArray(payload[1]) ? payload[1] : null;
    console.groupCollapsed(`[API 8 Chances] Banque mondiale · ${label} · HTTP ${response.status}`);
    if (observations) console.info(`${observations.length} observations reçues`);
    else console.info('Liste des pays reçue');
    console.groupEnd();
  }
  return payload;
}

async function fetchCountryNames(): Promise<Map<string, string>> {
  const payload = await fetchJson(`${API_ROOT}/country?format=json&per_page=400`);
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
    throw new Error('Invalid World Bank country response');
  }

  const names = new Map<string, string>();
  for (const rawCountry of payload[1]) {
    const country = asObject(rawCountry) as WorldBankCountry | null;
    if (
      !country ||
      typeof country.id !== 'string' ||
      !/^[A-Z]{3}$/.test(country.id) ||
      country.region?.id === 'NA' ||
      typeof country.iso2Code !== 'string' ||
      !/^[A-Z]{2}$/.test(country.iso2Code) ||
      typeof country.name !== 'string'
    ) continue;

    const localizedName = new Intl.DisplayNames(['fr'], { type: 'region' }).of(country.iso2Code);
    names.set(country.id, localizedName && localizedName !== country.iso2Code ? localizedName : country.name);
  }
  return names;
}

function makeQuestions(
  rawObservations: unknown,
  indicator: RankingIndicator,
  countryNames: Map<string, string>,
): RankingQuestion[] {
  if (!Array.isArray(rawObservations)) return [];

  const observationsByYear = new Map<number, Array<{ country: string; value: number }>>();
  for (const rawObservation of rawObservations) {
    const observation = asObject(rawObservation) as WorldBankObservation | null;
    if (
      !observation ||
      typeof observation.countryiso3code !== 'string' ||
      typeof observation.date !== 'string' ||
      typeof observation.value !== 'number' ||
      !Number.isFinite(observation.value)
    ) continue;

    const countryName = countryNames.get(observation.countryiso3code);
    if (!countryName) continue;

    const year = Number(observation.date);
    if (!Number.isInteger(year) || year < START_YEAR || year > END_YEAR) continue;

    const yearObservations = observationsByYear.get(year) ?? [];
    yearObservations.push({ country: countryName, value: observation.value });
    observationsByYear.set(year, yearObservations);
  }

  const questions: RankingQuestion[] = [];
  for (const [year, observations] of observationsByYear) {
    const topEight = observations
      .sort((left, right) => right.value - left.value)
      .slice(0, 8);
    if (
      topEight.length !== 8 ||
      new Set(topEight.map(item => item.country)).size !== 8 ||
      new Set(topEight.map(item => item.value)).size !== 8
    ) continue;

    const options: RankingOption[] = topEight.map((item, index) => ({
      id: `${indicator.code.toLowerCase().replaceAll('.', '-')}-${year}-${index}`,
      label: item.country,
      value: item.value,
      displayValue: formatValue(item.value, indicator.format),
    }));

    questions.push({
      id: `worldbank-${indicator.code.toLowerCase().replaceAll('.', '-')}-${year}`,
      category: indicator.category,
      question: `${indicator.question} (données ${year})`,
      criterion: `plus élevé au moins élevé en ${year}`,
      options,
      sourceYear: year,
      source: `Banque mondiale · ${indicator.code}`,
    });
  }

  return questions;
}

async function fetchIndicatorQuestions(
  indicator: RankingIndicator,
  countryNames: Map<string, string>,
): Promise<RankingQuestion[]> {
  const url = `${API_ROOT}/country/all/indicator/${encodeURIComponent(indicator.code)}?format=json&date=${START_YEAR}:${END_YEAR}&per_page=10000`;
  const payload = await fetchJson(url);
  if (!Array.isArray(payload) || !Array.isArray(payload[1])) {
    throw new Error(`Invalid World Bank response for ${indicator.code}`);
  }
  return makeQuestions(payload[1], indicator, countryNames);
}

async function fetchAllRankingQuestions(): Promise<RankingQuestion[]> {
  const countryNames = await fetchCountryNames();
  const allQuestions: RankingQuestion[] = [];
  const results = await Promise.allSettled(
    INDICATORS.map(indicator => fetchIndicatorQuestions(indicator, countryNames)),
  );
  for (const result of results) {
    if (result.status === 'fulfilled') allQuestions.push(...result.value);
  }

  if (allQuestions.length < MINIMUM_QUESTIONS) {
    throw new Error(`World Bank returned only ${allQuestions.length} usable ranking questions`);
  }

  return [...curatedRankingQuestions, ...allQuestions];
}

function mergeCuratedQuestions(questions: RankingQuestion[]): RankingQuestion[] {
  const questionsById = new Map(questions.map(question => [question.id, question]));
  for (const question of curatedRankingQuestions) {
    questionsById.set(question.id, question);
  }
  return [...questionsById.values()];
}

export async function fetchRankingQuestions(): Promise<RankingQuestion[]> {
  try {
    const cached = sessionStorage.getItem(CACHE_KEY);
    if (cached) {
      const questions = JSON.parse(cached) as RankingQuestion[];
      if (Array.isArray(questions) && questions.length >= MINIMUM_QUESTIONS) {
        if (import.meta.env.DEV) console.info(`[API 8 Chances] ${questions.length} classements World Bank chargés depuis le cache de session.`);
        return mergeCuratedQuestions(questions);
      }
    }
  } catch {
    try {
      sessionStorage.removeItem(CACHE_KEY);
    } catch {
      // Storage can be disabled by the browser.
    }
  }

  const questions = mergeCuratedQuestions(await fetchAllRankingQuestions());
  if (import.meta.env.DEV) console.info(`[API 8 Chances] Catalogue prêt : ${questions.length} classements utilisables.`);
  try {
    sessionStorage.setItem(CACHE_KEY, JSON.stringify(questions));
  } catch {
    // Continue without cache when browser storage is unavailable or full.
  }
  return questions;
}