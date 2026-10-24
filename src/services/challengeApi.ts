import type { Challenge2, Challenge2Item } from '../types/game';
import { shuffle } from '../utils/gameUtils';

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const MINIMUM_OPEN_ANSWERS = 12;
const MAX_OPEN_CHALLENGE_ANSWERS = 20;
const MINIMUM_ROUND2_CHALLENGES = 3;

interface WikidataBinding {
  item?: { value?: unknown };
  label?: { value?: unknown };
  alternateLabel?: { value?: unknown };
  country?: { value?: unknown };
  countryLabel?: { value?: unknown };
  capital?: { value?: unknown };
  image?: { value?: unknown };
}

interface WikidataPayload {
  results?: { bindings?: unknown };
}

const OPEN_CHALLENGE_QUERIES = [
  {
    id: 'wikidata-ballon-or-winners',
    theme: 'Sport',
    instruction: 'Citez des joueurs qui ont remporté au moins un Ballon d’Or',
    source: 'Wikidata · lauréats du Ballon d’Or',
    query: `
      SELECT DISTINCT ?item ?label ?alternateLabel ?image WHERE {
        ?item wdt:P166 wd:Q166177;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr" || LANG(?label) = "en")
        OPTIONAL { ?item wdt:P18 ?image. }
        OPTIONAL {
          ?item skos:altLabel ?alternateLabel.
          FILTER(LANG(?alternateLabel) = "fr" || LANG(?alternateLabel) = "en")
        }
      }
      ORDER BY ?label
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-brad-pitt-films',
    theme: 'Cinéma',
    instruction: 'Citez des films dans lesquels Brad Pitt a joué',
    source: 'Wikidata · filmographie de Brad Pitt',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P161 wd:Q35332;
          wdt:P31/wdt:P279* wd:Q11424;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr" || LANG(?label) = "en")
      }
      ORDER BY ?label
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-moliere-works',
    theme: 'Littérature',
    instruction: 'Citez des pièces de théâtre écrites par Molière',
    source: 'Wikidata · œuvres de Molière',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P50 wd:Q34660;
          wdt:P31/wdt:P279* wd:Q25379;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      ORDER BY ?label
      LIMIT 100
    `,
  },
  {
    id: 'wikidata-world-capitals',
    theme: 'Géographie',
    instruction: 'Donnez la capitale de chacun de ces pays',
    source: 'Wikidata · pays et capitales',
    query: `
      SELECT DISTINCT ?item ?label ?alternateLabel ?countryLabel WHERE {
        ?item wdt:P31/wdt:P279* wd:Q515;
          rdfs:label ?label.
        ?country wdt:P31 wd:Q6256;
          wdt:P36 ?item.
        FILTER(LANG(?label) = "fr")
        ?country rdfs:label ?countryLabel.
        FILTER(LANG(?countryLabel) = "fr")
        OPTIONAL {
          ?item skos:altLabel ?alternateLabel.
          FILTER(LANG(?alternateLabel) = "fr")
        }
      }
      LIMIT 200
    `,
  },
];

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === 'object' && value !== null
    ? value as Record<string, unknown>
    : null;
}

function readBindingValue(binding: WikidataBinding, key: keyof WikidataBinding): string | null {
  const value = binding[key]?.value;
  return typeof value === 'string' && value.trim() ? value.trim() : null;
}

function itemIdFromUri(uri: string, fallbackIndex: number): string {
  return uri.split('/').pop()?.replace(/[^A-Za-z0-9-]/g, '') || `result-${fallbackIndex}`;
}

function parseBindings(payload: unknown): WikidataBinding[] {
  const response = asRecord(payload) as WikidataPayload | null;
  const result = asRecord(response?.results);
  return Array.isArray(result?.bindings)
    ? result.bindings.map(asRecord).filter((binding): binding is Record<string, unknown> => binding !== null) as WikidataBinding[]
    : [];
}

function toOpenAnswerItems(bindings: WikidataBinding[], withCountry = false): Challenge2Item[] {
  const items = new Map<string, Challenge2Item>();
  for (const [index, binding] of bindings.entries()) {
    const uri = readBindingValue(binding, 'item');
    const label = readBindingValue(binding, 'label');
    if (!uri || !label || label.startsWith('Q')) continue;

    const country = withCountry ? readBindingValue(binding, 'countryLabel') : null;
    const aliases = [...new Set([
      readBindingValue(binding, 'alternateLabel'),
      country,
    ].filter((alias): alias is string => Boolean(alias) && alias !== label))];
    items.set(uri, {
      id: itemIdFromUri(uri, index),
      label,
      ...(country ? { screenTitle: country } : {}),
      ...(aliases.length ? { aliases } : {}),
    });
  }
  return [...items.values()];
}

function createImageChallenge(bindings: WikidataBinding[]): Challenge2 | null {
  const images = new Map<string, Challenge2Item>();
  for (const [index, binding] of bindings.entries()) {
    const uri = readBindingValue(binding, 'item');
    const label = readBindingValue(binding, 'label');
    const image = readBindingValue(binding, 'image');
    if (!uri || !label || label.startsWith('Q') || !image) continue;

    const filename = image.split('/').pop();
    if (!filename) continue;
    const imageUrl = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(decodeURIComponent(filename))}?width=480`;
    images.set(uri, {
      id: itemIdFromUri(uri, index),
      label,
      aliases: [readBindingValue(binding, 'alternateLabel')].filter((alias): alias is string => Boolean(alias)),
      imageUrl,
      imageCredit: 'Wikimedia Commons',
    });
  }

  const items = shuffle([...images.values()]).slice(0, 8);
  if (items.length < 8) return null;

  return {
    id: 'wikidata-ballon-or-photo',
    theme: 'Devine qui c’est',
    instruction: 'Reconnaissez ces joueurs sur leur photo',
    type: 'image-identify',
    source: 'Wikidata · images de Wikimedia Commons',
    items,
  };
}

async function fetchWikidataQuery(query: string, label: string): Promise<WikidataBinding[]> {
  const url = `${WIKIDATA_ENDPOINT}?query=${encodeURIComponent(query)}&format=json&origin=*`;
  const response = await fetch(url, {
    headers: { Accept: 'application/sparql-results+json' },
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok) throw new Error(`Wikidata ${label} returned HTTP ${response.status}`);

  const payload = await response.json() as unknown;
  if (import.meta.env.DEV) {
    const bindings = parseBindings(payload);
    console.groupCollapsed(`[Manche 2 API] Wikidata · ${label} · ${bindings.length} éléments`);
    console.info('Réponses gardées en mémoire et affichées uniquement au démarrage de leur défi.');
    console.groupEnd();
  }
  return parseBindings(payload);
}

export async function fetchOpenRound2Challenges(): Promise<Challenge2[]> {
  const results = await Promise.allSettled(
    OPEN_CHALLENGE_QUERIES.map(async definition => {
      const bindings = await fetchWikidataQuery(definition.query, definition.theme);
      const items = shuffle(toOpenAnswerItems(bindings, definition.id === 'wikidata-world-capitals'))
        .slice(0, MAX_OPEN_CHALLENGE_ANSWERS);
      const challenges: Challenge2[] = [];

      if (items.length >= MINIMUM_OPEN_ANSWERS) {
        challenges.push({
          id: definition.id,
          theme: definition.theme,
          instruction: definition.instruction,
          type: 'free-text',
          source: `${definition.source} · ${items.length} réponses acceptées`,
          items,
        });
      }

      if (definition.id === 'wikidata-ballon-or-winners') {
        const photoChallenge = createImageChallenge(bindings);
        if (photoChallenge) challenges.push(photoChallenge);
      }
      return challenges;
    }),
  );

  const challenges = results.flatMap(result =>
    result.status === 'fulfilled' ? result.value : [],
  );
  const failures = results.filter(result => result.status === 'rejected');
  for (const failure of failures) {
    if (failure.status === 'rejected') {
      console.warn('[Manche 2 API] Un défi Wikidata n’a pas pu être chargé.', failure.reason);
    }
  }
  if (challenges.length < MINIMUM_ROUND2_CHALLENGES) {
    throw new Error(`Wikidata n’a fourni que ${challenges.length} défis, il en faut au moins ${MINIMUM_ROUND2_CHALLENGES}.`);
  }
  return challenges;
}