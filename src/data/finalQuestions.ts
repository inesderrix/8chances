import type { FinalQuestion, FinalTheme } from '../types/game';

export const finalQuestions: FinalQuestion[] = [
  // ANIMAUX
  {
    id: 'animaux-1',
    theme: 'Animaux',
    question: 'Quel est le seul mammifère capable de voler ?',
    choices: ['L\'écureuil volant', 'La chauve-souris', 'Le flying fish', 'Le lémur volant'],
    correctIndex: 1,
    explanation: 'La chauve-souris est le seul vrai mammifère volant. L\'écureuil volant et le lémur planent, ils ne volent pas.'
  },
  {
    id: 'animaux-2',
    theme: 'Animaux',
    question: 'Combien de cœurs possède un poulpe ?',
    choices: ['1', '2', '3', '4'],
    correctIndex: 2,
    explanation: 'Un poulpe possède 3 cœurs : un cœur systémique et deux cœurs branchiaux.'
  },
  {
    id: 'animaux-3',
    theme: 'Animaux',
    question: 'Quel animal peut se retourner la tête à 270 degrés ?',
    choices: ['Le hibou', 'Le caméléon', 'Le serpent', 'La girafe'],
    correctIndex: 0,
    explanation: 'Le hibou peut tourner la tête à 270 degrés grâce à ses 14 vertèbres cervicales (contre 7 pour les humains).'
  },
  // GÉOGRAPHIE
  {
    id: 'geo-1',
    theme: 'Géographie',
    question: 'Quelle est la capitale de l\'Australie ?',
    choices: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
    correctIndex: 2,
    explanation: 'Canberra est la capitale fédérale de l\'Australie, construite spécialement à cet effet.'
  },
  {
    id: 'geo-2',
    theme: 'Géographie',
    question: 'Quel est le plus long fleuve du monde ?',
    choices: ['Le Mississippi', 'L\'Amazone', 'Le Nil', 'Le Yangtsé'],
    correctIndex: 2,
    explanation: 'Le Nil mesure environ 6 650 km, ce qui en fait le plus long fleuve du monde selon la majorité des sources.'
  },
  {
    id: 'geo-3',
    theme: 'Géographie',
    question: 'Dans quel pays se trouve le mont Kilimandjaro ?',
    choices: ['Kenya', 'Ouganda', 'Éthiopie', 'Tanzanie'],
    correctIndex: 3,
    explanation: 'Le Kilimandjaro se trouve en Tanzanie, à la frontière avec le Kenya, c\'est le plus haut sommet d\'Afrique.'
  },
  // CINÉMA
  {
    id: 'cinema-1',
    theme: 'Cinéma',
    question: 'Qui a réalisé le film "Pulp Fiction" (1994) ?',
    choices: ['Martin Scorsese', 'Steven Spielberg', 'Quentin Tarantino', 'Christopher Nolan'],
    correctIndex: 2,
    explanation: 'Quentin Tarantino a réalisé Pulp Fiction, Palme d\'Or à Cannes en 1994.'
  },
  {
    id: 'cinema-2',
    theme: 'Cinéma',
    question: 'Dans quel film entend-on la célèbre réplique "I\'ll be back" ?',
    choices: ['Rambo', 'Predator', 'Terminator', 'RoboCop'],
    correctIndex: 2,
    explanation: 'Arnold Schwarzenegger prononce cette réplique dans Terminator (1984) de James Cameron.'
  },
  {
    id: 'cinema-3',
    theme: 'Cinéma',
    question: 'Quel acteur joue Tony Stark / Iron Man dans les films Marvel ?',
    choices: ['Chris Evans', 'Robert Downey Jr.', 'Chris Hemsworth', 'Mark Ruffalo'],
    correctIndex: 1,
    explanation: 'Robert Downey Jr. incarne Tony Stark / Iron Man depuis le premier film en 2008.'
  },
  // HISTOIRE
  {
    id: 'histoire-1',
    theme: 'Histoire',
    question: 'En quelle année a eu lieu la Révolution française ?',
    choices: ['1776', '1789', '1799', '1804'],
    correctIndex: 1,
    explanation: 'La Révolution française commence en 1789 avec la prise de la Bastille le 14 juillet.'
  },
  {
    id: 'histoire-2',
    theme: 'Histoire',
    question: 'Qui était le premier président des États-Unis ?',
    choices: ['Abraham Lincoln', 'Thomas Jefferson', 'Benjamin Franklin', 'George Washington'],
    correctIndex: 3,
    explanation: 'George Washington fut le premier président des États-Unis, de 1789 à 1797.'
  },
  {
    id: 'histoire-3',
    theme: 'Histoire',
    question: 'En quelle année est tombé le mur de Berlin ?',
    choices: ['1987', '1989', '1991', '1993'],
    correctIndex: 1,
    explanation: 'Le mur de Berlin est tombé dans la nuit du 9 au 10 novembre 1989.'
  },
  // MUSIQUE
  {
    id: 'musique-1',
    theme: 'Musique',
    question: 'De quel pays vient le groupe ABBA ?',
    choices: ['Danemark', 'Norvège', 'Finlande', 'Suède'],
    correctIndex: 3,
    explanation: 'ABBA est un groupe suédois formé à Stockholm en 1972.'
  },
  {
    id: 'musique-2',
    theme: 'Musique',
    question: 'Comment s\'appelle la technique de chant utilisée par Freddie Mercury ?',
    choices: ['Le falsetto', 'Le vibrato', 'L\'yodel', 'Le belting'],
    correctIndex: 3,
    explanation: 'Freddie Mercury utilisait principalement le belting, une technique de projection vocale puissante.'
  },
  {
    id: 'musique-3',
    theme: 'Musique',
    question: 'Quel compositeur a créé "Les Quatre Saisons" ?',
    choices: ['Mozart', 'Bach', 'Vivaldi', 'Beethoven'],
    correctIndex: 2,
    explanation: 'Antonio Vivaldi a composé "Les Quatre Saisons" vers 1723.'
  },
  // SPORT
  {
    id: 'sport-1',
    theme: 'Sport',
    question: 'Dans quel sport utilise-t-on un "shuttlecock" (volant) ?',
    choices: ['Tennis de table', 'Badminton', 'Squash', 'Padel'],
    correctIndex: 1,
    explanation: 'Le shuttlecock ou volant est l\'équipement central du badminton.'
  },
  {
    id: 'sport-2',
    theme: 'Sport',
    question: 'Combien de joueurs y a-t-il dans une équipe de basket-ball sur le terrain ?',
    choices: ['4', '5', '6', '7'],
    correctIndex: 1,
    explanation: 'Une équipe de basket-ball compte 5 joueurs sur le terrain simultanément.'
  },
  {
    id: 'sport-3',
    theme: 'Sport',
    question: 'Quel pays a remporté la Coupe du Monde de football en 2018 ?',
    choices: ['Brésil', 'Allemagne', 'Croatie', 'France'],
    correctIndex: 3,
    explanation: 'La France a remporté la Coupe du Monde 2018 en Russie, battant la Croatie 4-2 en finale.'
  },
  // LITTÉRATURE
  {
    id: 'lit-1',
    theme: 'Littérature',
    question: 'Qui a écrit "Les Misérables" ?',
    choices: ['Honoré de Balzac', 'Gustave Flaubert', 'Victor Hugo', 'Émile Zola'],
    correctIndex: 2,
    explanation: 'Victor Hugo a publié "Les Misérables" en 1862.'
  },
  {
    id: 'lit-2',
    theme: 'Littérature',
    question: 'Dans quel roman Hermione Granger apparaît-elle ?',
    choices: ['Le Seigneur des Anneaux', 'Narnia', 'Harry Potter', 'Twilight'],
    correctIndex: 2,
    explanation: 'Hermione Granger est l\'un des personnages principaux de la saga Harry Potter de J.K. Rowling.'
  },
  // SCIENCE
  {
    id: 'science-1',
    theme: 'Physique',
    question: 'Quelle est la vitesse de la lumière dans le vide ?',
    choices: ['150 000 km/s', '200 000 km/s', '300 000 km/s', '400 000 km/s'],
    correctIndex: 2,
    explanation: 'La vitesse de la lumière dans le vide est d\'environ 299 792 km/s, soit ~300 000 km/s.'
  },
  {
    id: 'chimie-1',
    theme: 'Chimie',
    question: 'Quel est le symbole chimique de l\'or ?',
    choices: ['Or', 'Go', 'Au', 'Ag'],
    correctIndex: 2,
    explanation: 'Au est le symbole chimique de l\'or, du latin "aurum".'
  },
  // SÉRIES TV
  {
    id: 'series-1',
    theme: 'Séries TV',
    question: 'Dans "Game of Thrones", quel est le motto de la maison Stark ?',
    choices: ['Fire and Blood', 'We Do Not Sow', 'Winter Is Coming', 'Ours Is the Fury'],
    correctIndex: 2,
    explanation: '"Winter Is Coming" est le motto emblématique de la maison Stark de Winterfell.'
  },
  {
    id: 'series-2',
    theme: 'Séries TV',
    question: 'Qui joue Walter White dans "Breaking Bad" ?',
    choices: ['Bryan Cranston', 'Aaron Paul', 'Bob Odenkirk', 'Dean Norris'],
    correctIndex: 0,
    explanation: 'Bryan Cranston incarne le professeur de chimie Walter White dans Breaking Bad.'
  },
  // LANGUE FRANÇAISE
  {
    id: 'langue-1',
    theme: 'Langue française',
    question: 'Quel est le féminin de "héros" ?',
    choices: ['Hérosse', 'Héroïne', 'Héroïsse', 'Hérosine'],
    correctIndex: 1,
    explanation: 'Le féminin de "héros" est "héroïne".'
  },
  // GASTRONOMIE
  {
    id: 'gastro-1',
    theme: 'Gastronomie',
    question: 'Quelle région française est réputée pour sa moutarde ?',
    choices: ['Normandie', 'Alsace', 'Bretagne', 'Bourgogne'],
    correctIndex: 3,
    explanation: 'La moutarde de Dijon, en Bourgogne, est l\'une des plus célèbres au monde.'
  },
  // JEUX VIDÉOS
  {
    id: 'jeux-1',
    theme: 'Jeux vidéos',
    question: 'Dans quel jeu incarne-t-on le plombier Mario pour la première fois ?',
    choices: ['Mario Bros', 'Donkey Kong', 'Super Mario Bros', 'Mario Kart'],
    correctIndex: 1,
    explanation: 'Mario apparaît pour la première fois dans Donkey Kong (1981) sous le nom de "Jumpman".'
  },
  // DESSINS ANIMÉS
  {
    id: 'dessin-1',
    theme: 'Dessins animés',
    question: 'Qui a créé Mickey Mouse ?',
    choices: ['Walt Disney', 'Max Fleischer', 'Tex Avery', 'Chuck Jones'],
    correctIndex: 0,
    explanation: 'Walt Disney (et Ub Iwerks) a créé Mickey Mouse en 1928.'
  },
  // MYTHOLOGIE
  {
    id: 'mytho-1',
    theme: 'Mythologie',
    question: 'Qui est le dieu de la mer dans la mythologie grecque ?',
    choices: ['Zeus', 'Hadès', 'Poséidon', 'Héphaïstos'],
    correctIndex: 2,
    explanation: 'Poséidon est le dieu de la mer, des tremblements de terre et des chevaux dans la mythologie grecque.'
  },
  // ARTS
  {
    id: 'arts-1',
    theme: 'Arts',
    question: 'Qui a peint "La Joconde" ?',
    choices: ['Raphaël', 'Michel-Ange', 'Léonard de Vinci', 'Botticelli'],
    correctIndex: 2,
    explanation: 'Léonard de Vinci a peint La Joconde entre 1503 et 1519, elle est exposée au Louvre.'
  },
  // POLITIQUE
  {
    id: 'politique-1',
    theme: 'Politique',
    question: 'En quelle année la Déclaration des droits de l\'Homme et du Citoyen a-t-elle été adoptée en France ?',
    choices: ['1776', '1789', '1791', '1793'],
    correctIndex: 1,
    explanation: 'La Déclaration des droits de l\'Homme et du Citoyen a été adoptée le 26 août 1789.'
  },
  // TÉLÉVISION
  {
    id: 'tv-1',
    theme: 'Télévision',
    question: 'Quel est le présentateur historique du jeu "Questions pour un champion" ?',
    choices: ['Julien Lepers', 'Nagui', 'Jean-Pierre Foucault', 'Stéphane Bern'],
    correctIndex: 0,
    explanation: 'Julien Lepers a présenté Questions pour un champion de 1988 à 2014.'
  },
  // INTERNET
  {
    id: 'internet-1',
    theme: 'Internet',
    question: 'En quelle année a été fondée la société Google ?',
    choices: ['1994', '1996', '1998', '2000'],
    correctIndex: 2,
    explanation: 'Google a été fondé par Larry Page et Sergey Brin le 4 septembre 1998.'
  },
  // BD
  {
    id: 'bd-1',
    theme: 'Bandes dessinées',
    question: 'Dans quel pays est né Tintin ?',
    choices: ['France', 'Suisse', 'Belgique', 'Luxembourg'],
    correctIndex: 2,
    explanation: 'Tintin a été créé par le Belge Hergé (Georges Remi) en 1929.'
  },
  // LANGUES ÉTRANGÈRES
  {
    id: 'langues-1',
    theme: 'Langues étrangères',
    question: 'Comment dit-on "merci" en japonais ?',
    choices: ['Sayonara', 'Konnichiwa', 'Arigatou', 'Sumimasen'],
    correctIndex: 2,
    explanation: '"Arigatou" (ありがとう) signifie "merci" en japonais. "Sayonara" = au revoir, "Konnichiwa" = bonjour.'
  },
  // CÉLÉBRITÉS
  {
    id: 'celebrites-1',
    theme: 'Célébrités',
    question: 'Quel surnom porte Elon Musk dans les médias pour son style de management ?',
    choices: ['The Techno King', 'The Iron Man', 'The Wizard', 'The Rocket Man'],
    correctIndex: 0,
    explanation: 'Elon Musk a officiellement pris le titre de "Techno King" chez Tesla en 2021.'
  },
  // PHILOSOPHIE
  {
    id: 'philo-1',
    theme: 'Philosophie',
    question: 'Qui a dit "Je pense donc je suis" (Cogito ergo sum) ?',
    choices: ['Platon', 'Aristote', 'René Descartes', 'Immanuel Kant'],
    correctIndex: 2,
    explanation: 'René Descartes a formulé ce principe dans le "Discours de la méthode" (1637).'
  },
];

// Grouper les questions par thème pour la finale
export const questionsByTheme: Partial<Record<FinalTheme, FinalQuestion[]>> = finalQuestions.reduce(
  (acc, q) => {
    if (!acc[q.theme]) acc[q.theme] = [];
    acc[q.theme]!.push(q);
    return acc;
  },
  {} as Partial<Record<FinalTheme, FinalQuestion[]>>
);
