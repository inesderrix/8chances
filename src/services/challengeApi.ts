import type { Challenge2, Challenge2Item } from '../types/game';
import { shuffle } from '../utils/gameUtils';

const WIKIDATA_ENDPOINT = 'https://query.wikidata.org/sparql';
const MINIMUM_OPEN_ANSWERS = 12;
const MAX_OPEN_CHALLENGE_ANSWERS = 20;
const MINIMUM_ROUND2_CHALLENGES = 3;
const MAX_CONCURRENT_WIKIDATA_QUERIES = 4;

interface WikidataBinding {
  item?: { value?: unknown };
  label?: { value?: unknown };
  alternateLabel?: { value?: unknown };
  capitalLabel?: { value?: unknown };
  authorLabel?: { value?: unknown };
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
        FILTER(LANG(?label) = "fr")
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
        FILTER(LANG(?label) = "fr")
      }
      ORDER BY ?label
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-tom-hanks-films',
    theme: 'Cinéma',
    instruction: 'Citez des films dans lesquels Tom Hanks a joué',
    source: 'Wikidata · filmographie de Tom Hanks',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P161 wd:Q2263;
          wdt:P31/wdt:P279* wd:Q11424;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-leonardo-dicaprio-films',
    theme: 'Cinéma',
    instruction: 'Citez des films dans lesquels Leonardo DiCaprio a joué',
    source: 'Wikidata · filmographie de Leonardo DiCaprio',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P161 wd:Q38111;
          wdt:P31/wdt:P279* wd:Q11424;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-robert-de-niro-films',
    theme: 'Cinéma',
    instruction: 'Citez des films dans lesquels Robert De Niro a joué',
    source: 'Wikidata · filmographie de Robert De Niro',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P161 wd:Q36949;
          wdt:P31/wdt:P279* wd:Q11424;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-actress-films',
    theme: 'Cinéma',
    instruction: 'Citez des films dans lesquels Meryl Streep a joué',
    source: 'Wikidata · filmographie de Meryl Streep',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P161 wd:Q873;
          wdt:P31/wdt:P279* wd:Q11424;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-world-capitals',
    theme: 'Géographie',
    instruction: 'Devinez le pays correspondant à chaque capitale',
    source: 'Wikidata · capitales et pays',
    query: `
      SELECT DISTINCT ?item ?label ?capitalLabel WHERE {
        ?item wdt:P31/wdt:P279* wd:Q6256;
          wdt:P36 ?capital;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
        ?capital rdfs:label ?capitalLabel.
        FILTER(LANG(?capitalLabel) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-famous-books-authors',
    theme: 'Littérature',
    instruction: 'Trouvez l’auteur ou l’autrice de chaque roman connu',
    source: 'Wikidata · romans populaires et auteurs',
    query: `
      SELECT DISTINCT ?item ?label ?authorLabel ?popularity WHERE {
        ?item wdt:P31/wdt:P279* wd:Q8261;
          wdt:P50 ?author;
          wikibase:sitelinks ?popularity;
          rdfs:label ?label.
        ?author rdfs:label ?authorLabel.
        FILTER(LANG(?label) = "fr")
        FILTER(LANG(?authorLabel) = "fr")
        FILTER(?popularity >= 30)
      }
      ORDER BY DESC(?popularity)
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-asian-countries',
    theme: 'Géographie',
    instruction: 'Citez des pays situés en Asie',
    source: 'Wikidata · pays d’Asie',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P31/wdt:P279* wd:Q6256;
          wdt:P30 wd:Q48;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-european-countries',
    theme: 'Géographie',
    instruction: 'Citez des pays situés en Europe',
    source: 'Wikidata · pays d’Europe',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P31/wdt:P279* wd:Q6256;
          wdt:P30 wd:Q46;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-islands',
    theme: 'Géographie',
    instruction: 'Citez des îles du monde',
    source: 'Wikidata · îles',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P31/wdt:P279* wd:Q23442;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-seas',
    theme: 'Géographie',
    instruction: 'Citez des mers du monde',
    source: 'Wikidata · mers',
    query: `
      SELECT DISTINCT ?item ?label WHERE {
        ?item wdt:P31/wdt:P279* wd:Q165;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-actor-photos',
    theme: 'Devine qui c’est',
    instruction: 'Reconnaissez ces acteurs et actrices sur leur photo',
    source: 'Wikidata · acteurs et actrices',
    query: `
      SELECT DISTINCT ?item ?label ?alternateLabel ?image WHERE {
        ?item wdt:P106/wdt:P279* wd:Q33999;
          wdt:P18 ?image;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
        OPTIONAL {
          ?item skos:altLabel ?alternateLabel.
          FILTER(LANG(?alternateLabel) = "fr")
        }
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-singer-photos',
    theme: 'Devine qui c’est',
    instruction: 'Reconnaissez ces chanteurs et chanteuses sur leur photo',
    source: 'Wikidata · chanteurs et chanteuses',
    query: `
      SELECT DISTINCT ?item ?label ?alternateLabel ?image WHERE {
        ?item wdt:P106 wd:Q177220;
          wdt:P18 ?image;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
        OPTIONAL {
          ?item skos:altLabel ?alternateLabel.
          FILTER(LANG(?alternateLabel) = "fr")
        }
      }
      LIMIT 200
    `,
  },
  {
    id: 'wikidata-country-flags',
    theme: 'Géographie',
    instruction: 'Devinez le pays représenté par chaque drapeau',
    source: 'Wikidata · drapeaux des pays',
    query: `
      SELECT DISTINCT ?item ?label ?image WHERE {
        ?item wdt:P31/wdt:P279* wd:Q6256;
          wdt:P41 ?image;
          rdfs:label ?label.
        FILTER(LANG(?label) = "fr")
      }
      LIMIT 200
    `,
  },
];

const ANIMAL_CHALLENGES: Challenge2[] = [
  {
    id: 'animal-young',
    theme: 'Animaux',
    instruction: 'Comment appelle-t-on le petit de chaque animal ?',
    type: 'free-text',
    source: 'Vocabulaire animalier',
    items: [
      { id: 'foal', label: 'poulain', screenTitle: 'Cheval' },
      { id: 'calf', label: 'veau', screenTitle: 'Vache' },
      { id: 'lamb', label: 'agneau', screenTitle: 'Mouton' },
      { id: 'puppy', label: 'chiot', screenTitle: 'Chien' },
      { id: 'kitten', label: 'chaton', screenTitle: 'Chat' },
      { id: 'kid', label: 'chevreau', screenTitle: 'Chèvre' },
      { id: 'piglet', label: 'porcelet', screenTitle: 'Cochon' },
      { id: 'cub-lion', label: 'lionceau', screenTitle: 'Lion' },
      { id: 'duckling', label: 'caneton', screenTitle: 'Canard' },
      { id: 'gosling', label: 'oison', screenTitle: 'Oie' },
      { id: 'fawn', label: 'faon', screenTitle: 'Cerf' },
      { id: 'bear-cub', label: 'ourson', screenTitle: 'Ours' },
      { id: 'rabbit-young', label: 'lapereau', screenTitle: 'Lapin' },
      { id: 'fox-cub', label: 'renardeau', screenTitle: 'Renard' },
      { id: 'elephant-calf', label: 'éléphanteau', screenTitle: 'Éléphant' },
      { id: 'wolf-cub', label: 'louveteau', screenTitle: 'Loup' },
    ],
  },
  {
    id: 'animal-female',
    theme: 'Animaux',
    instruction: 'Comment appelle-t-on la femelle de chaque animal ?',
    type: 'free-text',
    source: 'Vocabulaire animalier',
    items: [
      { id: 'mare', label: 'jument', screenTitle: 'Cheval' },
      { id: 'cow', label: 'vache', screenTitle: 'Taureau' },
      { id: 'ewe', label: 'brebis', screenTitle: 'Bélier' },
      { id: 'hen', label: 'poule', screenTitle: 'Coq' },
      { id: 'lioness', label: 'lionne', screenTitle: 'Lion' },
      { id: 'doe', label: 'biche', screenTitle: 'Cerf' },
      { id: 'sow', label: 'truie', screenTitle: 'Cochon' },
      { id: 'duck-female', label: 'cane', screenTitle: 'Canard' },
      { id: 'goose-female', label: 'oie', screenTitle: 'Jars' },
      { id: 'fox-female', label: 'renarde', screenTitle: 'Renard' },
      { id: 'wolf-female', label: 'louve', screenTitle: 'Loup' },
      { id: 'rabbit-female', label: 'lapine', screenTitle: 'Lapin' },
      { id: 'goat-female', label: 'chèvre', screenTitle: 'Bouc' },
      { id: 'tiger-female', label: 'tigresse', screenTitle: 'Tigre' },
      { id: 'elephant-female', label: 'éléphante', screenTitle: 'Éléphant' },
      { id: 'deer-female', label: 'daine', screenTitle: 'Daim' },
    ],
  },
  {
    id: 'animal-cries',
    theme: 'Animaux',
    instruction: 'Comment appelle-t-on le cri de chaque animal ?',
    type: 'free-text',
    source: 'Vocabulaire animalier',
    items: [
      { id: 'horse-neigh', label: 'hennissement', screenTitle: 'Cheval' },
      { id: 'dog-bark', label: 'aboiement', screenTitle: 'Chien' },
      { id: 'cat-meow', label: 'miaulement', screenTitle: 'Chat' },
      { id: 'cow-moo', label: 'meuglement', screenTitle: 'Vache' },
      { id: 'sheep-bleat', label: 'bêlement', screenTitle: 'Mouton' },
      { id: 'rooster-crow', label: 'chant', screenTitle: 'Coq' },
      { id: 'duck-quack', label: 'cancanement', screenTitle: 'Canard' },
      { id: 'lion-roar', label: 'rugissement', screenTitle: 'Lion' },
      { id: 'wolf-howl', label: 'hurlement', screenTitle: 'Loup' },
      { id: 'pig-oink', label: 'grognement', screenTitle: 'Cochon' },
      { id: 'snake-hiss', label: 'sifflement', screenTitle: 'Serpent' },
      { id: 'elephant-trumpet', label: 'barrissement', screenTitle: 'Éléphant' },
      { id: 'frog-croak', label: 'coassement', screenTitle: 'Grenouille' },
      { id: 'owl-hoot', label: 'hululement', screenTitle: 'Chouette' },
      { id: 'bee-buzz', label: 'bourdonnement', screenTitle: 'Abeille' },
      { id: 'dove-coo', label: 'roucoulement', screenTitle: 'Pigeon' },
    ],
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

function toOpenAnswerItems(bindings: WikidataBinding[]): Challenge2Item[] {
  const items = new Map<string, Challenge2Item>();
  for (const [index, binding] of bindings.entries()) {
    const uri = readBindingValue(binding, 'item');
    const label = readBindingValue(binding, 'label');
    if (!uri || !label || label.startsWith('Q')) continue;

    const alternateLabel = readBindingValue(binding, 'alternateLabel');
    items.set(uri, {
      id: itemIdFromUri(uri, index),
      label,
      ...(alternateLabel && alternateLabel !== label ? { aliases: [alternateLabel] } : {}),
    });
  }
  return [...items.values()];
}

function createImageChallenge(
  bindings: WikidataBinding[],
  id = 'wikidata-ballon-or-photo',
  theme = 'Devine qui c’est',
  instruction = 'Reconnaissez ces joueurs sur leur photo',
  source = 'Wikidata · images de Wikimedia Commons',
): Challenge2 | null {
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
    id,
    theme,
    instruction,
    type: 'image-identify',
    source,
    items,
  };
}

function toCapitalCountryItems(bindings: WikidataBinding[]): Challenge2Item[] {
  const items = new Map<string, Challenge2Item>();
  for (const [index, binding] of bindings.entries()) {
    const uri = readBindingValue(binding, 'item');
    const country = readBindingValue(binding, 'label');
    const capital = readBindingValue(binding, 'capitalLabel');
    if (!uri || !country || !capital || country.startsWith('Q')) continue;
    items.set(uri, {
      id: itemIdFromUri(uri, index),
      label: country,
      screenTitle: capital,
    });
  }
  return [...items.values()];
}

function toBookAuthorItems(bindings: WikidataBinding[]): Challenge2Item[] {
  const items = new Map<string, Challenge2Item>();
  for (const [index, binding] of bindings.entries()) {
    const uri = readBindingValue(binding, 'item');
    const title = readBindingValue(binding, 'label');
    const author = readBindingValue(binding, 'authorLabel');
    if (!uri || !title || !author || title.startsWith('Q') || author.startsWith('Q')) continue;
    items.set(author.toLocaleLowerCase('fr'), {
      id: itemIdFromUri(uri, index),
      label: author,
      screenTitle: title,
    });
  }
  return [...items.values()];
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
  const results: PromiseSettledResult<Challenge2[]>[] = [];
  for (let offset = 0; offset < OPEN_CHALLENGE_QUERIES.length; offset += MAX_CONCURRENT_WIKIDATA_QUERIES) {
    const batch = OPEN_CHALLENGE_QUERIES.slice(offset, offset + MAX_CONCURRENT_WIKIDATA_QUERIES);
    const batchResults = await Promise.allSettled(
      batch.map(async definition => {
        const bindings = await fetchWikidataQuery(definition.query, definition.theme);
        const challenges: Challenge2[] = [];
        const isImageChallenge = definition.id.endsWith('-photos') || definition.id === 'wikidata-country-flags';

        if (isImageChallenge) {
          const challenge = createImageChallenge(
            bindings,
            definition.id,
            definition.theme,
            definition.instruction,
            definition.source,
          );
          if (challenge) challenges.push(challenge);
        } else {
          const sourceItems = definition.id === 'wikidata-world-capitals'
            ? toCapitalCountryItems(bindings)
            : definition.id === 'wikidata-famous-books-authors'
              ? toBookAuthorItems(bindings)
              : toOpenAnswerItems(bindings);
          const hasPromptPerScreen = sourceItems.some(item => item.screenTitle);
          const maxItems = hasPromptPerScreen ? 8 : MAX_OPEN_CHALLENGE_ANSWERS;
          const items = shuffle(sourceItems).slice(0, maxItems);
          const minimumItems = hasPromptPerScreen ? 8 : MINIMUM_OPEN_ANSWERS;
          if (items.length >= minimumItems) {
            challenges.push({
              id: definition.id,
              theme: definition.theme,
              instruction: definition.instruction,
              type: 'free-text',
              source: `${definition.source} · ${items.length} réponses acceptées`,
              items,
            });
          }
        }

        if (definition.id === 'wikidata-ballon-or-winners') {
          const photoChallenge = createImageChallenge(bindings);
          if (photoChallenge) challenges.push(photoChallenge);
        }
        return challenges;
      }),
    );
    results.push(...batchResults);
  }

  const challenges = results.flatMap(result =>
    result.status === 'fulfilled' ? result.value : [],
  );
  const wikidataChallenges = challenges.filter(challenge =>
    !ANIMAL_CHALLENGES.some(animalChallenge => animalChallenge.id === challenge.id),
  );
  const failures = results.filter(result => result.status === 'rejected');
  for (const failure of failures) {
    if (failure.status === 'rejected') {
      console.warn('[Manche 2 API] Un défi Wikidata n’a pas pu être chargé.', failure.reason);
    }
  }
  if (wikidataChallenges.length < MINIMUM_ROUND2_CHALLENGES) {
    throw new Error(`Wikidata n’a fourni que ${wikidataChallenges.length} défis, il en faut au moins ${MINIMUM_ROUND2_CHALLENGES}.`);
  }
  const animalChallenges = ANIMAL_CHALLENGES.map(challenge => ({
    ...challenge,
    items: shuffle(challenge.items).slice(0, 8),
  }));
  return [...challenges, ...animalChallenges];
}