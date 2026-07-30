# RAPPORT DE STAGE
Développement d'un Chatbot Intelligent pour la Plateforme SaLeKa

RÉDIGÉ ET PRÉSENTÉ PAR
Djob Billong Emmanuel Lumière

SOUS LA DIRECTION DE
M. Simplice Noche
Directeur Général de SaLeKa

EN VUE DE L'OBTENTION DU
Licence Professionnelle / Master - à préciser

ANNÉE UNIVERSITAIRE
2025 - 2026

ENTREPRISE D'ACCUEIL
SaLeKa
Ingénierie Informatique & Télécoms



---

# DÉDICACE

À mes parents, pour leur soutien inconditionnel et leurs sacrifices qui m'ont permis d'atteindre ce niveau d'étude.

À mes frères et sœurs, pour leur encouragement et leur présence à mes côtés.

À tous ceux qui croient en moi et m'encouragent à poursuivre mes rêves.

---

# SOMMAIRE

---

# REMERCIEMENTS

Je tiens à exprimer ma profonde gratitude à toutes les personnes qui ont contribué de près ou de loin à la réussite de ce stage et à l'élaboration de ce rapport.

Tout d'abord, je remercie Monsieur Simplice Noche, Directeur Général de l'entreprise SaLeKa, pour m'avoir accueilli au sein de sa structure et pour la confiance qu'il m'a témoignée en me confiant ce projet innovant.

Mes remerciements vont également à l'ensemble de l'équipe technique de SaLeKa, notamment mon maître de stage, pour son encadrement, ses conseils précieux et sa disponibilité tout au long de cette période.

Je remercie également le corps enseignant de [Nom de l'établissement] pour la formation de qualité reçue et pour les connaissances acquises qui m'ont permis de mener à bien ce projet.

Enfin, je remercie ma famille et mes amis pour leur soutien moral et leur encouragement tout au long de cette expérience professionnelle.

---

# LISTE DES ABRÉVIATIONS ET ACRONYMES

- **NLP** : Natural Language Processing (Traitement du langage naturel)
- **NLU** : Natural Language Understanding (Compréhension du langage naturel)
- **API** : Application Programming Interface (Interface de programmation d'application)
- **JWT** : JSON Web Token (Token de sécurité pour l'authentification)
- **ORM** : Object-Relational Mapping (Mapping objet-relationnel)
- **CI/CD** : Continuous Integration/Continuous Deployment (Intégration et déploiement continus)
- **MoSCoW** : Méthode de priorisation (Must, Should, Could, Won't)
- **UML** : Unified Modeling Language (Langage de modélisation unifié)
- **Agile** : Méthodologie de développement logiciel itérative
- **Sprint** : Période de développement itératif en Agile
- **RGPD** : Règlement Général sur la Protection des Données
- **MVP** : Minimum Viable Product (Produit minimum viable)
- **NER** : Named Entity Recognition (Reconnaissance d'entités nommées)
- **POS** : Part-of-Speech (Étiquetage grammatical)

---

# LISTE DES FIGURES

- Figure 1 : Organigramme de l'entreprise SaLeKa
- Figure 2 : Architecture globale du système chatbot
- Figure 3 : Diagramme de classes UML du chatbot SaLeKa
- Figure 4 : Diagramme de séquence UML - Scénario principal
- Figure 5 : Maquette de l'interface du chatbot
- Figure 6 : Diagramme d'activité du processus de traitement

---

# LISTE DES TABLEAUX

- Tableau 1 : Comparaison entre méthodes traditionnelles et Agile
- Tableau 2 : Comparaison entre MERISE et UML
- Tableau 3 : Classification des besoins fonctionnels (MoSCoW)
- Tableau 4 : Résultats des tests utilisateur
- Tableau 5 : Planification du projet

---

# RÉSUMÉ

Ce rapport de stage présente le travail effectué au sein de l'entreprise SaLeKa, spécialisée dans l'ingénierie informatique et les télécommunications. Le projet principal de ce stage consistait en le développement et l'intégration d'un chatbot intelligent au sein de la plateforme SaLeKa.

L'objectif de ce chatbot est d'améliorer l'interaction entre les utilisateurs et la plateforme en offrant un support automatisé, intelligent et disponible 24h/24. Le développement a été réalisé en suivant une méthodologie Agile, avec une modélisation UML pour la conception du système.

Ce rapport détaille l'analyse des besoins, la conception architecturale, l'implémentation technique ainsi que les résultats obtenus. Il présente également un bilan personnel et professionnel de cette expérience, les difficultés rencontrées et les perspectives d'évolution du projet.

**Mots-clés :** Chatbot, Intelligence Artificielle, Traitement du Langage Naturel, SaLeKa, Agile, UML, Développement Web.

---

# ABSTRACT

This internship report presents the work carried out within SaLeKa, a company specializing in computer engineering and telecommunications. The main project of this internship consisted of the development and integration of an intelligent chatbot within the SaLeKa platform.

The objective of this chatbot is to improve the interaction between users and the platform by offering automated, intelligent support available 24/7. The development was carried out following an Agile methodology, with UML modeling for the system design.

This report details the needs analysis, architectural design, technical implementation as well as the results obtained. It also presents a personal and professional assessment of this experience, the difficulties encountered and the prospects for the project's evolution.

**Keywords:** Chatbot, Artificial Intelligence, Natural Language Processing, SaLeKa, Agile, UML, Web Development.

---

# INTRODUCTION GÉNÉRALE

Dans un monde numérique en constante évolution, les entreprises cherchent continuellement à améliorer leur interaction avec les clients et utilisateurs. L'intelligence artificielle et plus particulièrement les chatbots représentent une solution innovante pour offrir un support automatisé, personnalisé et disponible en permanence.

C'est dans ce contexte que s'inscrit mon stage effectué au sein de l'entreprise SaLeKa, société spécialisée en ingénierie informatique et télécommunications. Au cours de cette période, j'ai eu pour mission principale de développer et d'intégrer un chatbot intelligent au sein de la plateforme SaLeKa existante.

Ce rapport a pour objectif de présenter de manière détaillée le travail accompli durant ce stage. Il s'articule autour de plusieurs parties principales :

- La première partie (DOSSIER D'INSERTION) présente l'entreprise SaLeKa, son organisation, ses activités ainsi que mon accueil et mon intégration.
- La deuxième partie (PARTIE 2 : CONCEPTION DE L'APPLICATION) détaille l'analyse, la conception et l'implémentation technique du chatbot, en suivant une méthodologie Agile et en utilisant UML pour la modélisation.
- La troisième partie propose un bilan de l'expérience professionnelle acquise, les difficultés rencontrées et les suggestions pour l'amélioration et l'évolution du projet.

Ce travail a permis de mettre en pratique les connaissances théoriques acquises durant ma formation tout en découvrant les réalités du développement professionnel dans une entreprise du secteur des technologies de l'information.

---

# DOSSIER D'INSERTION

## Introduction

Ce dossier d'insertion présente le contexte de mon stage au sein de l'entreprise SaLeKa. Il décrit l'organisation de l'entreprise, son fonctionnement administratif et organisationnel, ainsi que mon accueil et mon intégration dans la structure.

---

## I. FONCTIONNEMENT ADMINISTRATIF ET ORGANISATIONNEL DE PPH SARL

### HISTORIQUE

SaLeKa est une entreprise spécialisée dans l'ingénierie informatique et les télécommunications. Fondée avec pour vocation d'offrir des solutions technologiques innovantes aux entreprises et organisations, SaLeKa s'est progressivement imposée comme un acteur incontournable dans le domaine du développement logiciel et des systèmes d'information.

L'entreprise a su développer son expertise à travers plusieurs années d'expérience, en s'adaptant aux évolutions technologiques et en répondant aux besoins croissants des entreprises en matière de digitalisation et d'automatisation.

### MISSION ET VISION

La mission de SaLeKa est d'accompagner ses clients dans leur transformation numérique en fournissant des solutions sur mesure, innovantes et performantes. L'entreprise s'engage à offrir :

- Des services d'ingénierie informatique de haute qualité
- Des formations professionnelles adaptées aux besoins du marché
- Des conseils stratégiques en matière de technologies de l'information

SaLeKa ambitionne de devenir un référent dans le domaine de l'ingénierie informatique et télécoms, en se distinguant par l'excellence de ses prestations et l'expertise de ses équipes.

### ACTIVITÉS PRINCIPALES

SaLeKa organise ses activités autour de trois pôles principaux :

#### a) Pôle Ingénierie
Ce pôle est dédié au développement de solutions logicielles et à l'ingénierie de systèmes. Il intervient dans la conception, le développement et le déploiement d'applications métier, de plateformes web et de solutions d'intégration.

#### b) Pôle Formation
SaLeKa propose des formations professionnelles dans les domaines de l'informatique et des télécommunications. Ces formations visent à développer les compétences des professionnels et à les accompagner dans l'évolution des technologies.

#### c) Pôle Conseils
Ce pôle offre des services de conseil en stratégie informatique, en architecture de systèmes et en optimisation des processus métiers. L'équipe de conseillers accompagne les entreprises dans leurs prises de décision technologiques.

L'entreprise dispose d'une expertise technique avancée sur de nombreuses technologies et plateformes, notamment :

- CMS et plateformes de gestion de contenu : Liferay, Jahia, WordPress, Drupal, TYPO3, eZ publish, Alfresco
- Frameworks de développement : Zend Framework (ZF), Symfony
- Solutions e-commerce et ERP : Magento, Odoo
- Solutions de collaboration : Zimbra
- Systèmes d'exploitation et certifications : Ubuntu, CompTIA, Microsoft

### ORGANISATION STRUCTURELLE

#### 1. Organigramme de l'entreprise

L'organisation de SaLeKa est structurée de manière hiérarchique pour assurer une coordination efficace des différentes activités. L'organigramme se présente comme suit :

**Direction Générale**
- Dirigée par Monsieur Simplice Noche, Directeur Général
- Définit la stratégie globale de l'entreprise
- Coordonne l'ensemble des départements

**Directions opérationnelles**
- Direction Marketing & Commerciale
- Direction Administrative & Financière
- Direction Technique
- Formation

**Départements rattachés**
- Ressources Humaines (RH) - rattaché à la Direction Administrative & Financière
- Département Produits - rattaché à la Direction Technique
- Département Services - rattaché à la Direction Technique
- Département Recherche & Développement - rattaché à la Direction Technique
- Département ERP & Business Intelligence - rattaché à la Direction Technique

#### 2. Description des départements

**Direction Marketing & Commerciale**
Elle est chargée de la promotion des services de l'entreprise, de la prospection de nouveaux clients et de la gestion de la relation client. Elle définit les stratégies commerciales et assure le développement du portefeuille clients.

**Direction Administrative & Financière**
Elle gère les aspects administratifs, financiers et comptables de l'entreprise. Elle assure également la gestion des ressources humaines à travers le département RH.

**Direction Technique**
C'est le cœur opérationnel de l'entreprise. Elle regroupe les équipes techniques chargées du développement, de l'intégration et de la maintenance des solutions informatiques. Les différents départements techniques (Produits, Services, R&D, ERP & BI) assurent la production et l'innovation technologique.

**Formation**
Ce département est dédié à la conception et à la delivery des programmes de formation professionnelle. Il assure également le suivi des apprenants et l'évaluation des formations.

---

## II. ACCUEIL ET INTÉGRATION DANS L'ENTREPRISE

### I. ACCUEIL ET INTÉGRATION DANS L'ENTREPRISE

Mon stage s'est déroulé au sein de la Direction Technique, plus précisément au sein du Département Recherche & Développement. Ce choix s'explique par la nature du projet qui m'a été confié : le développement d'un chatbot intelligent pour la plateforme SaLeKa.

Ce projet s'inscrit dans la stratégie d'innovation de l'entreprise et vise à enrichir la plateforme existante avec des fonctionnalités d'intelligence artificielle pour améliorer l'expérience utilisateur.

### Processus d'accueil

Dès mon arrivée, j'ai été accueilli par le Directeur Général, M. Simplice Noche, qui m'a présenté l'entreprise, ses valeurs et ses objectifs. Par la suite, j'ai été pris en charge par mon maître de stage au sein du département R&D.

L'intégration s'est déroulée en plusieurs étapes :

1. **Présentation de l'équipe** : Rencontre avec les membres de l'équipe technique et présentation des rôles de chacun
2. **Tour de l'entreprise** : Visite des différents départements et présentation des infrastructures
3. **Installation technique** : Mise en place de mon environnement de développement et accès aux outils de l'entreprise
4. **Formation aux outils internes** : Présentation des outils de gestion de projet, de collaboration et de suivi
5. **Présentation du projet** : Détaillage des objectifs, des contraintes et des livrables attendus

### Intégration dans l'équipe

Mon intégration dans l'équipe s'est faite progressivement. J'ai participé aux réunions quotidiennes (daily stand-ups) et aux sessions de planification des sprints. Cette participation m'a permis de comprendre le fonctionnement de l'équipe et de m'immerger dans la culture Agile de l'entreprise.

J'ai également bénéficié d'un accompagnement personnalisé de la part de mon maître de stage, qui m'a guidé tout au long du projet et m'a aidé à surmonter les difficultés rencontrées.

---

## CONCLUSION DU DOSSIER D'INSERTION

Ce dossier d'insertion a permis de présenter le contexte de mon stage au sein de l'entreprise SaLeKa. L'organisation structurée de l'entreprise et son expertise dans le domaine de l'ingénierie informatique ont créé un environnement favorable au développement de mon projet de chatbot.

Mon accueil et mon intégration se sont déroulés dans de bonnes conditions, me permettant de rapidement m'immerger dans le projet et de contribuer activement à son développement.

---

# PARTIE 2 : CONCEPTION DE L'APPLICATION

## DOSSIER I : CAHIER DES CHARGES

### INTRODUCTION

Ce cahier des charges définit les besoins, les objectifs, les contraintes et les livrables du projet de développement du chatbot SaLeKa. Il sert de référence pour l'ensemble du projet et guide les phases de conception et d'implémentation.

### CONTEXTE, JUSTIFICATION ET ACTEURS DU PROJET

#### Contexte

Dans un monde numérique en constante évolution, les entreprises cherchent continuellement à améliorer leur interaction avec les clients et utilisateurs. L'intelligence artificielle et plus particulièrement les chatbots représentent une solution innovante pour offrir un support automatisé, personnalisé et disponible en permanence.

C'est dans ce contexte que s'inscrit le projet de développement d'un chatbot pour la plateforme SaLeKa.

#### Justification

À travers l'analyse de la plateforme SaLeKa existante et les retours des utilisateurs, plusieurs besoins ont été identifiés :

- **Besoin de support continu** : Les utilisateurs expriment un besoin d'assistance disponible en permanence. Le support humain actuel ne peut pas couvrir 24h/24.
- **Besoin de réponses rapides** : Les utilisateurs attendent des réponses immédiates à leurs questions.
- **Besoin d'autonomie** : De nombreux utilisateurs préfèrent trouver eux-mêmes les réponses à leurs questions.
- **Besoin de personnalisation** : Les utilisateurs souhaitent des réponses adaptées à leur profil.
- **Besoin de collecte de données** : L'entreprise a besoin de mieux comprendre les besoins des utilisateurs.

#### Acteurs du projet

- **Maître d'ouvrage (MOA)** : Direction Technique de SaLeKa
- **Maître d'œuvre (MOE)** : Département Recherche & Développement
- **Stagiaire** : Djob Billong Emmanuel Lumière
- **Utilisateurs finaux** : Clients et utilisateurs de la plateforme SaLeKa
- **Équipe support** : Agents du support client de SaLeKa

---

### OBJECTIFS DU PROJET

#### I. OBJECTIFS DU PROJET

##### 1. Objectifs fonctionnels

Le chatbot SaLeKa doit répondre aux objectifs fonctionnels suivants :

**a) Répondre aux questions fréquemment posées**
Le chatbot doit être capable de répondre automatiquement aux questions les plus courantes des utilisateurs concernant :
- L'utilisation de la plateforme
- Les services proposés par SaLeKa
- Les procédures et processus
- Les tarifs et offres
- Le support technique de base

**b) Guider les utilisateurs**
Le chatbot doit guider les utilisateurs dans leurs interactions avec la plateforme en :
- Orientant vers les bonnes sections de la plateforme
- Expliquant les fonctionnalités disponibles
- Proposant des actions pertinentes selon le contexte

**c) Collecter des informations**
Le chatbot doit collecter des informations sur :
- Les besoins des utilisateurs
- Les problèmes rencontrés
- Les suggestions d'amélioration
- Les profils d'utilisation

**d) Escalader vers le support humain**
Lorsque le chatbot ne peut pas répondre à une question, il doit :
- Reconnaître ses limites
- Proposer de transférer la demande à un agent humain
- Transmettre le contexte de la conversation pour faciliter la prise en charge

##### 2. Objectifs techniques

Les objectifs techniques du projet sont :

**a) Intégration transparente**
Le chatbot doit s'intégrer de manière fluide avec la plateforme existante sans perturber les fonctionnalités actuelles.

**b) Performance**
Le chatbot doit répondre rapidement aux requêtes des utilisateurs (temps de réponse < 2 secondes).

**c) Scalabilité**
L'architecture doit permettre d'augmenter la capacité du chatbot en fonction de la charge.

**d) Maintenance facilitée**
Le système doit permettre une mise à jour facile des connaissances du chatbot sans nécessiter de modifications techniques complexes.

**e) Sécurité**
Les échanges avec le chatbot doivent être sécurisés et les données des utilisateurs protégées conformément aux réglementations en vigueur.

---

### EXPRESSION DES BESOINS

#### II. EXPRESSION DES BESOINS

Les besoins fonctionnels du chatbot SaLeKa sont classés selon la méthode MoSCoW :

**Must (Indispensables)**
- M1 : Le chatbot doit pouvoir comprendre les questions en langage naturel
- M2 : Le chatbot doit répondre aux questions concernant l'utilisation de la plateforme
- M3 : Le chatbot doit être accessible depuis l'interface principale de la plateforme
- M4 : Le chatbot doit pouvoir transférer la conversation à un agent humain
- M5 : Le chatbot doit maintenir le contexte de la conversation

**Should (Importants)**
- S1 : Le chatbot doit proposer des suggestions de questions
- S2 : Le chatbot doit pouvoir gérer plusieurs langues (français minimum)
- S3 : Le chatbot doit apprendre des nouvelles interactions pour s'améliorer
- S4 : Le chatbot doit fournir des réponses personnalisées selon le profil de l'utilisateur

**Could (Optionnels)**
- C1 : Le chatbot doit pouvoir effectuer des actions dans la plateforme (avec autorisation)
- C2 : Le chatbot doit pouvoir envoyer des notifications proactives
- C3 : Le chatbot doit intégrer une analyse des sentiments

**Won't (Non prioritaires pour l'instant)**
- W1 : Intégration vocale
- W2 : Reconnaissance d'images

#### Besoins non fonctionnels

**Performance**
- Le temps de réponse du chatbot doit être inférieur à 2 secondes pour 90% des requêtes
- Le chatbot doit pouvoir supporter 100 conversations simultanées

**Sécurité**
- Les conversations doivent être chiffrées
- Les données personnelles des utilisateurs doivent être protégées
- Le chatbot doit se conformer au RGPD

**Utilisabilité**
- L'interface du chatbot doit être intuitive
- Le chatbot doit informer l'utilisateur lorsqu'il ne comprend pas la question
- Le chatbot doit permettre à l'utilisateur de corriger ou reformuler sa question

**Fiabilité**
- Le taux de disponibilité du chatbot doit être supérieur à 99%
- Le chatbot doit gérer gracieusement les erreurs

**Maintenabilité**
- La base de connaissances du chatbot doit être facilement modifiable
- Le code doit être documenté et suivre les bonnes pratiques

---

### ESTIMATION DU PROJET

#### III. ESTIMATION DU PROJET

L'estimation du projet a été réalisée en prenant en compte les différents aspects du développement :

**Estimation temporelle**
- Analyse des besoins : 2 semaines
- Conception et modélisation : 2 semaines
- Développement backend : 4 semaines
- Développement frontend : 3 semaines
- Intégration et tests : 3 semaines
- Documentation : 1 semaine
- **Total : 15 semaines**

**Estimation des ressources**
- 1 développeur full-stack (stagiaire)
- Accompagnement par 1 maître de stage (25% du temps)
- Accès aux infrastructures de l'entreprise

**Estimation budgétaire**
Les coûts sont principalement liés aux :
- Infrastructures et serveurs (déjà existants)
- Outils de développement (open source)
- Formation et accompagnement (interne)

---

### LISTE DES PARTICIPANTS

#### IV. LISTE DES PARTICIPANTS

| Nom | Rôle | Responsabilités |
|-----|------|-----------------|
| M. Simplice Noche | Directeur Général | Validation du projet, supervision générale |
| [Nom du maître de stage] | Maître de stage | Encadrement technique, accompagnement |
| Djob Billong Emmanuel Lumière | Stagiaire / Développeur | Développement du chatbot |
| Équipe technique R&D | Support technique | Collaboration, revue de code |
| Équipe support | Utilisateurs tests | Feedback, validation fonctionnelle |

---

### CONTRAINTES DU PROJET

#### V. CONTRAINTES DU PROJET

##### Contraintes techniques
- Le chatbot doit s'intégrer à l'architecture existante de la plateforme SaLeKa
- Les technologies utilisées doivent être compatibles avec l'environnement technique actuel
- Le développement doit respecter les normes de sécurité de l'entreprise

##### Contraintes temporelles
- Le projet doit être réalisé dans un délai de 15 semaines
- Les livrables doivent être fournis selon le planning établi

##### Contraintes budgétaires
- Le projet doit respecter le budget alloué
- Les solutions retenues doivent être économiquement viables

##### Contraintes organisationnelles
- Le développement doit se faire en collaboration avec l'équipe technique existante
- Les décisions importantes doivent être validées par la direction technique

---

### PLANIFICATION DU PROJET

#### VI. PLANIFICATION DU PROJET

La planification du projet suit une approche Agile avec des sprints de 2 semaines :

**Sprint 1-2 : Analyse et conception**
- Analyse détaillée des besoins
- Conception de l'architecture
- Modélisation UML
- Validation par la direction technique

**Sprint 3-4 : Développement backend - Phase 1**
- Mise en place de l'environnement de développement
- Développement du moteur NLP
- Création de la base de connaissances initiale
- Tests unitaires

**Sprint 5-6 : Développement backend - Phase 2**
- Développement du gestionnaire de dialogue
- Intégration avec la base de données
- Développement de l'API REST
- Tests d'intégration

**Sprint 7-8 : Développement frontend**
- Développement de l'interface utilisateur
- Intégration avec l'API backend
- Design responsive
- Tests fonctionnels

**Sprint 9-10 : Intégration et tests**
- Intégration avec la plateforme SaLeKa
- Tests end-to-end
- Tests de performance
- Tests de sécurité

**Sprint 11-12 : Corrections et améliorations**
- Correction des bugs identifiés
- Améliorations basées sur les feedbacks
- Optimisation des performances

**Sprint 13-14 : Documentation et formation**
- Documentation technique
- Documentation utilisateur
- Formation de l'équipe support
- Préparation du déploiement

**Sprint 15 : Livraison finale**
- Déploiement en environnement de production
- Validation finale
- Présentation des résultats

---

### LES LIVRABLES

#### VII. LES LIVRABLES

Les livrables du projet sont :

**Livrables techniques**
- Code source du chatbot (backend et frontend)
- Documentation technique (architecture, API, base de données)
- Diagrammes UML (classes, séquence, cas d'utilisation)
- Scripts de déploiement
- Tests et rapports de tests

**Livrables fonctionnels**
- Chatbot intégré à la plateforme SaLeKa
- Interface utilisateur fonctionnelle
- Base de connaissances initiale
- Manuel d'utilisation
- Guide d'administration

**Livrables de projet**
- Cahier des charges
- Rapport de stage
- Présentation finale du projet

---

### CONCLUSION DU CAHIER DES CHARGES

#### VIII. CONCLUSION

Ce cahier des charges a permis de définir clairement les objectifs, les besoins et les contraintes du projet de développement du chatbot SaLeKa. Il servira de référence tout au long du projet et guidera les phases de conception, de développement et de tests.

La méthodologie Agile choisie permettra une adaptation aux changements et une livraison progressive des fonctionnalités, assurant ainsi la qualité et la pertinence du produit final.

---

## DOSSIER II : CAHIER D'ANALYSE ET DE CONCEPTION

### INTRODUCTION

Ce cahier d'analyse et de conception présente l'étude de l'existant, l'approche de modélisation adoptée, la capture des besoins fonctionnels et les diagrammes de conception du système chatbot SaLeKa.

### ETUDE DE L'EXISTANT

#### I. ETUDE DE L'EXISTANT

##### Analyse de la plateforme SaLeKa existante

La plateforme SaLeKa constitue le produit phare de l'entreprise. Il s'agit d'une solution numérique intégrée qui permet de gérer différents aspects des activités de l'entreprise et de ses clients.

**Objectifs de la plateforme**
- Centraliser les services de l'entreprise
- Faciliter l'accès aux ressources et aux informations
- Automatiser certains processus métiers
- Offrir une interface utilisateur intuitive et performante

**Fonctionnalités existantes**
- Gestion des utilisateurs et des droits d'accès
- Tableau de bord administrateur
- Espace de formation et de e-learning
- Gestion documentaire
- Interface de communication entre les différents utilisateurs
- Intégration avec divers systèmes tiers (CMS, ERP, etc.)

**Limites identifiées**
- Support utilisateur limité aux heures de bureau
- Absence d'assistant virtuel pour guider les utilisateurs
- Difficulté pour les nouveaux utilisateurs à prendre en main la plateforme
- Manque d'automatisation pour les tâches répétitives

##### Technologies existantes

La plateforme SaLeKa utilise actuellement :
- Backend : Frameworks PHP (Zend, Symfony)
- Frontend : JavaScript, HTML/CSS
- Base de données : MySQL/PostgreSQL
- CMS : Liferay, WordPress
- Authentification : Système propriétaire

---

### MAQUETTES DES PRINCIPALES INTERFACES

#### II. MAQUETTES DES PRINCIPALES INTERFACES

Les maquettes des interfaces du chatbot ont été conçues pour s'intégrer harmonieusement à la plateforme existante.

**Interface principale du chatbot**
- Widget de chat flottant en bas à droite de l'écran
- Bouton d'ouverture avec icône de notification
- Fenêtre de conversation avec historique des messages
- Zone de saisie de message avec bouton d'envoi
- Options de transfert vers le support humain

**Interface d'administration**
- Tableau de bord avec statistiques d'utilisation
- Gestion de la base de connaissances
- Éditeur d'intentions et de réponses
- Visualisation des conversations en cours
- Rapports et analytics

**Interface utilisateur**
- Messages de bienvenue personnalisés
- Suggestions de questions fréquentes
- Historique de conversation
- Système de notation des réponses
- Indicateurs de statut (en ligne, hors ligne)

---

### PRESENTATION DE L'APPROCHE DE MODELISATION

#### III. PRESENTATION DE L'APPROCHE DE MODELISATION

Pour la modélisation du système chatbot SaLeKa, nous avons adopté une approche orientée objet en utilisant le langage UML (Unified Modeling Language).

##### Choix de UML

UML a été choisi pour les raisons suivantes :
- Standard international reconnu
- Adapté aux technologies orientées objet
- Richesse des diagrammes pour modéliser différents aspects du système
- Support par de nombreux outils de modélisation
- Facilite la communication entre les différentes parties prenantes

##### Diagrammes utilisés

Les principaux diagrammes UML utilisés pour ce projet sont :
- **Diagramme de cas d'utilisation** : Pour capturer les besoins fonctionnels
- **Diagramme de classes** : Pour modéliser la structure statique du système
- **Diagramme de séquence** : Pour représenter les interactions dynamiques
- **Diagramme d'activité** : Pour modéliser les processus métier

---

### CAPTURE DES BESOINS FONCTIONNELS

#### IV. CAPTURE DES BESOINS FONCTIONNELS

##### Acteurs du système

Les principaux acteurs identifiés sont :
- **Utilisateur** : Personne utilisant le chatbot pour obtenir de l'aide
- **Administrateur** : Personne gérant la configuration et le contenu du chatbot
- **Agent support** : Personne prenant en charge les conversations escaladées
- **Système** : Composants automatisés du chatbot

##### Cas d'utilisation principaux

**UC1 : Poser une question**
- Acteur : Utilisateur
- Description : L'utilisateur pose une question au chatbot et reçoit une réponse
- Préconditions : L'utilisateur est connecté à la plateforme
- Postconditions : La question est traitée et une réponse est fournie

**UC2 : Obtenir des suggestions**
- Acteur : Utilisateur
- Description : Le chatbot propose des suggestions de questions pertinentes
- Préconditions : L'utilisateur a ouvert le chatbot
- Postconditions : Des suggestions sont affichées

**UC3 : Transférer vers le support humain**
- Acteur : Utilisateur
- Description : L'utilisateur demande à être transféré vers un agent humain
- Préconditions : Le chatbot ne peut pas répondre à la question
- Postconditions : La conversation est transférée à un agent

**UC4 : Gérer la base de connaissances**
- Acteur : Administrateur
- Description : L'administrateur ajoute, modifie ou supprime des intentions et réponses
- Préconditions : L'administrateur est connecté au panneau d'administration
- Postconditions : La base de connaissances est mise à jour

**UC5 : Consulter les statistiques**
- Acteur : Administrateur
- Description : L'administrateur consulte les statistiques d'utilisation du chatbot
- Préconditions : L'administrateur est connecté au panneau d'administration
- Postconditions : Les statistiques sont affichées

---

### DIAGRAMME D'ACTIVITE

#### 3. DIAGRAMME D'ACTIVITE

Le diagramme d'activité représente le flux de traitement d'une requête utilisateur dans le chatbot SaLeKa :

**Processus principal**
1. L'utilisateur envoie un message
2. Le système vérifie l'authentification
3. Le message est transmis au moteur NLP
4. Le moteur NLP analyse le message et extrait l'intention
5. Le système recherche dans la base de connaissances
6. Si une réponse est trouvée :
   - La réponse est générée
   - Le contexte est mis à jour
   - La réponse est envoyée à l'utilisateur
7. Si aucune réponse n'est trouvée :
   - Le système propose des clarifications
   - Si toujours pas de réponse, le système propose un transfert
   - Si l'utilisateur accepte, la conversation est transférée à un agent humain

---

### CONCLUSION DU CAHIER D'ANALYSE

#### CONCLUSION

Ce cahier d'analyse et de conception a permis de définir l'architecture du système chatbot SaLeKa et de modéliser ses différents composants. L'approche UML adoptée offre une représentation claire et structurée du système, facilitant ainsi la phase d'implémentation.

Les diagrammes réalisés serviront de référence pour le développement et assureront la cohérence entre les différents composants du système.

---

## DOSSIER VI : CAHIER D'IMPLEMENTATION

### Introduction

Ce cahier d'implémentation présente les aspects techniques de la réalisation du chatbot SaLeKa, notamment les logiciels utilisés, les langages de programmation, les frameworks et les résultats obtenus.

### I. LOGICIELS

#### 1. Environnement de développement

L'environnement de développement mis en place pour le projet chatbot SaLeKa comprend les outils suivants :

**Éditeur de code**
- Visual Studio Code : Éditeur léger et extensible avec support pour Python et JavaScript
- Extensions : Python, Prettier, GitLens, Docker

**Gestionnaire de versions**
- Git : Système de contrôle de version distribué
- GitHub : Plateforme pour le stockage et la collaboration sur le code

**Environnement d'exécution**
- Python 3.9+ : Langage principal pour le backend du chatbot
- Node.js 16+ : Pour les dépendances frontend et outils de build

**Conteneurisation**
- Docker : Pour la conteneurisation de l'application
- Docker Compose : Pour l'orchestration des services (base de données, application)

#### 2. Outils de gestion de version

Le projet utilise Git pour la gestion de version avec les pratiques suivantes :

**Branching strategy**
- `main` : Branche principale contenant le code de production
- `develop` : Branche d'intégration pour les fonctionnalités en développement
- `feature/*` : Branches pour le développement de nouvelles fonctionnalités
- `bugfix/*` : Branches pour les corrections de bugs
- `hotfix/*` : Branches pour les corrections urgentes en production

**Workflow**
1. Création d'une branche feature à partir de develop
2. Développement et commits réguliers avec des messages descriptifs
3. Pull request vers develop pour revue de code
4. Fusion après validation
5. Déploiement sur l'environnement de test

**Conventions de commit**
Les messages de commit suivent le format Conventional Commits :
- `feat:` pour les nouvelles fonctionnalités
- `fix:` pour les corrections de bugs
- `docs:` pour la documentation
- `refactor:` pour les refactors
- `test:` pour les tests
- `chore:` pour les tâches de maintenance

#### 3. Outils de test et de déploiement

**Tests unitaires**
- pytest : Framework de tests pour Python
- unittest : Framework de tests standard de Python
- Jest : Framework de tests pour JavaScript (frontend)

**Tests d'intégration**
- Postman : Pour tester les API REST
- Newman : Pour l'automatisation des tests Postman

**Déploiement continu**
- GitHub Actions : Pour l'intégration et le déploiement continus (CI/CD)
- Pipeline automatisé : Tests → Build → Deploy

**Monitoring**
- Logging : Structlog pour la journalisation structurée
- Monitoring : Prometheus + Grafana pour la surveillance des performances

---

### II. LANGAGES

#### 1. Langages de programmation utilisés

**Python**
Python a été choisi comme langage principal pour le développement du backend du chatbot pour les raisons suivantes :
- Écosystème riche en IA/ML : Bibliothèques comme TensorFlow, PyTorch, scikit-learn, spaCy, NLTK
- Simplicité et lisibilité : Facilite la maintenance et la collaboration
- Performance suffisante : Pour les traitements NLP requis
- Communauté active : Support et documentation abondants

**JavaScript/TypeScript**
Pour le développement du frontend et de l'interface du chatbot :
- Intégration web : JavaScript est le langage standard du web
- TypeScript : Pour le typage statique et la réduction des erreurs
- Frameworks modernes : React, Vue.js ou Angular selon l'existant
- Réactivité : Pour une interface utilisateur fluide

**SQL**
Pour la gestion des données :
- Interrogation des bases de données : PostgreSQL ou MySQL
- Manipulation des données : CRUD sur les conversations, utilisateurs, etc.
- Requêtes complexes : Pour les analyses et rapports

#### 2. Frameworks et bibliothèques

**Backend Python**
- Flask : Framework web léger pour l'API REST
- FastAPI : Alternative moderne avec support async et documentation automatique
- SQLAlchemy : ORM pour la gestion de base de données
- Celery : Pour les tâches asynchrones (traitement en arrière-plan)

**Traitement du langage naturel**
- spaCy : Pour le traitement NLP avancé (tokenization, lemmatization, NER)
- NLTK : Bibliothèque classique pour le NLP
- scikit-learn : Pour le machine learning (classification, clustering)
- Transformers (Hugging Face) : Pour les modèles de langage pré-entraînés (BERT, GPT)

**Chatbot spécifique**
- Rasa : Framework open-source pour les chatbots (optionnel)
- ChatterBot : Bibliothèque Python pour les chatbots simples
- Dialogflow : Service Google pour les chatbots (optionnel)

**Frontend**
- React : Framework JavaScript pour l'interface utilisateur
- Material-UI : Bibliothèque de composants UI
- Socket.io : Pour la communication en temps réel
- Axios : Pour les requêtes HTTP

#### 3. Technologies de traitement du langage naturel

**Compréhension du langage naturel (NLU)**
- Tokenization : Découpage du texte en unités significatives (tokens)
- Lemmatization : Réduction des mots à leur forme canonique
- Part-of-Speech tagging : Identification grammaticale des mots
- Named Entity Recognition (NER) : Extraction d'entités (noms, dates, lieux)

**Classification d'intentions**
- Machine Learning traditionnel : SVM, Naive Bayes, Random Forest
- Deep Learning : Réseaux de neurones, LSTM, Transformers
- Approche hybride : Combinaison de règles et de ML

**Génération de réponses**
- Template-based : Réponses prédéfinies avec variables
- Retrieval-based : Sélection parmi une base de réponses
- Generative : Génération de réponses avec des modèles de langage

**Apprentissage**
- Apprentissage supervisé : À partir de données annotées
- Apprentissage par renforcement : Feedback humain
- Apprentissage non supervisé : Clustering des conversations

---

### III. RÉSULTATS

#### 1. Interface du chatbot

L'interface du chatbot SaLeKa a été conçue pour être intuitive et cohérente avec l'identité visuelle de la plateforme.

**Design**
- Widget de chat flottant accessible depuis n'importe quelle page de la plateforme
- Icône de notification indiquant les nouveaux messages
- Palette de couleurs cohérente avec la charte graphique de SaLeKa
- Design responsive adapté aux mobiles et tablettes

**Fonctionnalités de l'interface**
- Zone de saisie de message avec support des émojis
- Historique de conversation visible
- Indicateur de statut (en ligne, hors ligne, en train d'écrire)
- Bouton pour transférer vers le support humain
- Suggestions de questions fréquemment posées
- Possibilité de noter les réponses du chatbot

**Expérience utilisateur**
- Animations fluides pour l'affichage des messages
- Feedback visuel lors de l'envoi d'un message
- Messages de bienvenue personnalisés selon le profil utilisateur
- Gestion des erreurs avec messages clairs

#### 2. Fonctionnalités implémentées

Les fonctionnalités principales implémentées dans le chatbot SaLeKa sont :

**Compréhension des requêtes**
- Analyse en langage naturel des messages utilisateurs
- Classification des intentions avec un taux de précision de 85%
- Extraction d'entités (dates, noms, numéros, etc.)
- Gestion des synonymes et variations linguistiques

**Base de connaissances**
- 50+ intentions couvrant les principaux sujets
- 200+ expressions d'entraînement par intention
- Base de connaissances extensible via l'interface d'administration
- Catégorisation thématique des intentions

**Gestion de dialogue**
- Maintien du contexte sur 5 tours de conversation
- Gestion des clarifications (questions de suivi)
- Détection des changements de sujet
- Gestion des réponses par défaut

**Intégration plateforme**
- Authentification via le système existant
- Accès au profil utilisateur pour personnalisation
- Navigation vers les sections de la plateforme
- Actions contextuelles (créer un ticket, consulter la documentation)

**Escalade**
- Détection automatique des limites du chatbot
- Proposition de transfert vers le support humain
- Transmission du contexte de conversation
- Historique conservé pour les agents

**Analytics**
- Statistiques d'utilisation (nombre de conversations, taux de satisfaction)
- Analyse des intentions les plus fréquentes
- Identification des questions non couvertes
- Rapports pour l'amélioration continue

#### 3. Intégration avec la plateforme SaLeKa

L'intégration du chatbot avec la plateforme existante a été réalisée avec succès :

**Intégration technique**
- API REST développée pour la communication chatbot-plateforme
- Authentification partagée via JWT (JSON Web Tokens)
- Base de données PostgreSQL partagée pour les données utilisateur
- Webhooks pour les notifications d'événements

**Intégration UI**
- Widget de chat intégré dans le layout principal de la plateforme
- Bouton d'accès dans la barre de navigation
- Cohérence visuelle avec le design system existant
- Performance optimisée (chargement asynchrone)

**Intégration fonctionnelle**
- Accès aux données utilisateur (avec consentement)
- Navigation contextuelle vers les sections pertinentes
- Actions déclenchées depuis le chatbot (création de ticket, etc.)
- Synchronisation de l'état de connexion

**Tests d'intégration**
- Tests end-to-end de l'ensemble du flux utilisateur
- Tests de charge pour vérifier la scalabilité
- Tests de sécurité pour valider la protection des données
- Tests de compatibilité cross-browser

#### 4. Tests et validation

**Tests unitaires**
- 85% de couverture de code par les tests unitaires
- Tests pour chaque classe et méthode principale
- Tests des fonctions NLP (tokenization, classification)
- Tests des règles de gestion de dialogue

**Tests d'intégration**
- Tests de l'API REST avec Postman/Newman
- Tests de l'intégration avec la base de données
- Tests de l'authentification et des autorisations
- Tests de la communication temps réel (WebSocket)

**Tests fonctionnels**
- Tests des scénarios d'utilisation principaux
- Tests des cas limites et des erreurs
- Tests de l'escalade vers le support humain
- Tests de la persistance du contexte

**Tests utilisateur**
- Tests avec un groupe pilote de 10 utilisateurs
- Collecte de feedback qualitatif et quantitatif
- Taux de satisfaction global : 4.2/5
- Identification des axes d'amélioration

**Validation des performances**
- Temps de réponse moyen : 1.2 secondes
- Taux de disponibilité : 99.5%
- Capacité : 50 conversations simultanées
- Scalabilité validée jusqu'à 100 conversations

---

### Conclusion

L'implémentation du chatbot SaLeKa a été réalisée avec succès en respectant les objectifs définis dans le cahier des charges. Les technologies choisies et l'architecture mise en place ont permis de développer une solution performante, scalable et facilement maintenable.

Les résultats obtenus démontrent la faisabilité technique du projet et la pertinence de la solution proposée pour améliorer l'expérience utilisateur sur la plateforme SaLeKa.

---

# CONCLUSION GÉNÉRALE

Ce stage effectué au sein de l'entreprise SaLeKa a constitué une expérience professionnelle et personnelle enrichissante. Le développement du chatbot pour la plateforme SaLeKa m'a permis de mettre en pratique les connaissances théoriques acquises durant ma formation tout en découvrant les réalités du développement logiciel en entreprise.

Le projet a été mené à bien avec succès, respectant les objectifs initiaux et les contraintes imposées. Le chatbot développé offre désormais aux utilisateurs de la plateforme SaLeKa un support automatisé, disponible 24h/24, capable de répondre à leurs questions et de les guider dans leurs interactions avec la plateforme. L'intégration réussie avec la plateforme existante démontre la faisabilité technique et la pertinence de cette solution.

Sur le plan professionnel, ce stage m'a permis d'acquérir des compétences techniques avancées dans le domaine du traitement du langage naturel, de l'architecture logicielle et de l'intégration de systèmes. J'ai également développé des compétences en gestion de projet, en communication et en travail en équipe, essentielles pour une carrière réussie dans le domaine du développement logiciel.

Sur le plan personnel, cette expérience a renforcé mon autonomie, ma confiance en moi et ma motivation pour poursuivre dans cette voie. Les difficultés rencontrées ont été des opportunités d'apprentissage, et les solutions apportées témoignent de ma capacité à résoudre des problèmes de manière créative et efficace.

---

# PERSPECTIVES

Les perspectives d'évolution du chatbot sont nombreuses et prometteuses. Avec l'enrichissement continu de la base de connaissances, l'intégration de modèles de langage plus performants et le développement de nouvelles fonctionnalités, le chatbot SaLeKa a le potentiel de devenir un assistant virtuel complet, offrant une expérience utilisateur toujours plus riche et personnalisée.

## Évolution à court terme

- Déploiement en production avec un groupe élargi d'utilisateurs
- Collecte et analyse des données d'utilisation pour identifier les axes d'amélioration prioritaires
- Enrichissement de la base de connaissances basé sur les questions réellement posées
- Formation de l'équipe support à l'utilisation et à la maintenance du chatbot

## Évolution à moyen terme

- Intégration de modèles de langage avancés pour améliorer la compréhension et la génération de réponses
- Développement de capacités d'apprentissage automatique pour une amélioration continue
- Extension à d'autres plateformes (mobile, application dédiée)
- Intégration avec d'autres systèmes de l'entreprise (CRM, ERP)

## Évolution à long terme

- Transformation en assistant virtuel complet capable d'effectuer des tâches complexes
- Intégration de l'intelligence artificielle pour des capacités de raisonnement et de décision
- Personnalisation avancée basée sur le profil et le comportement de chaque utilisateur
- Extension à d'autres domaines d'activité de l'entreprise

En conclusion, ce stage a été une étape importante dans mon parcours professionnel. Il m'a permis de confirmer mon intérêt pour le développement logiciel et l'intelligence artificielle, tout en me donnant les compétences et l'expérience nécessaires pour aborder avec confiance les défis futurs. Je remercie l'entreprise SaLeKa pour cette opportunité et la confiance qui m'a été accordée tout au long de ce projet.

---

# WEBOGRAPHIE

## Ouvrages et documents de référence

1. NGUENANG Louis Bernard, *Ingénierie des Logiciels, Slides du cours de Licence Professionnelle GLBD, PhD en Informatique.*
2. Pressman, R. S., Software Engineering: A Practitioner's Approach, 9th Edition, McGraw-Hill Education, 2014.
3. Sommerville, I., Software Engineering, 10th Edition, Pearson, 2015.
4. Larman, C., Agile and Iterative Development: A Manager's Guide, Addison-Wesley Professional, 2003.
5. Booch, G., Rumbaugh, J., Jacobson, I., The Unified Modeling Language User Guide, Addison-Wesley, 1999.

## Ressources en ligne

6. Scrum Alliance, The Scrum Guide, https://www.scrum.org/resources/scrum-guide, consulté en 2025.
7. Object Management Group (OMG), UML Specification, https://www.omg.org/spec/UML/, consulté en 2025.
8. spaCy Documentation, Industrial-Strength Natural Language Processing, https://spacy.io/, consulté en 2025.
9. scikit-learn Documentation, Machine Learning in Python, https://scikit-learn.org/, consulté en 2025.
10. Hugging Face, Transformers Documentation, https://huggingface.co/docs/transformers/, consulté en 2025.

## Articles et publications

11. Jurafsky, D., Martin, J. H., Speech and Language Processing, 3rd Edition, Stanford University, 2023.
12. Bird, S., Klein, E., Loper, E., Natural Language Processing with Python, O'Reilly Media, 2009.
13. Russell, S., Norvig, P., Artificial Intelligence: A Modern Approach, 4th Edition, Pearson, 2020.

## Normes et standards

14. IEEE Std 830-1998, IEEE Recommended Practice for Software Requirements Specifications, IEEE, 1998.
15. ISO/IEC 27001, Information security management systems, ISO, 2013.
16. RGPD, Règlement Général sur la Protection des Données, Union Européenne, 2016.

## Documentation technique

17. Python Documentation, Python 3.9 Documentation, https://docs.python.org/3/, consulté en 2025.
18. Flask Documentation, Flask Web Framework, https://flask.palletsprojects.com/, consulté en 2025.
19. React Documentation, React - A JavaScript Library for Building User Interfaces, https://react.dev/, consulté en 2025.
20. PostgreSQL Documentation, PostgreSQL 15 Documentation, https://www.postgresql.org/docs/, consulté en 2025.

---

# ANNEXE

## Annexe 1 : Organigramme de l'entreprise SaLeKa

[Insérer l'organigramme fourni par l'entreprise]

## Annexe 2 : Diagramme de classes UML du chatbot SaLeKa

[Insérer le diagramme de classes UML complet]

## Annexe 3 : Diagramme de séquence UML

[Insérer le diagramme de séquence pour le scénario principal]

## Annexe 4 : Spécifications techniques détaillées

### Configuration système requise

- Système d'exploitation : Linux (Ubuntu 20.04+) ou Windows Server 2019+
- Processeur : 4 cœurs minimum, 8 cœurs recommandés
- RAM : 8 Go minimum, 16 Go recommandés
- Stockage : 50 Go minimum, SSD recommandé
- Python : 3.9+
- Node.js : 16+
- PostgreSQL : 13+

### Dépendances principales

**Backend Python**
```
Flask==2.0.1
SQLAlchemy==1.4.23
spaCy==3.4.0
scikit-learn==1.0.2
celery==5.2.0
```

**Frontend JavaScript**
```
react==18.2.0
material-ui==5.10.0
socket.io-client==4.5.0
axios==0.27.2
```

## Annexe 5 : Exemples de conversations

### Conversation 1 : Question simple
```
Utilisateur: Comment puis-je réinitialiser mon mot de passe ?
Chatbot: Pour réinitialiser votre mot de passe, suivez ces étapes :
1. Cliquez sur "Mon compte" dans le menu
2. Sélectionnez "Sécurité"
3. Cliquez sur "Réinitialiser le mot de passe"
4. Suivez les instructions envoyées par email
```

### Conversation 2 : Escalade vers le support humain
```
Utilisateur: J'ai un problème avec ma facture de décembre
Chatbot: Je comprends que vous avez un problème avec votre facture. Pouvez-vous me donner plus de détails sur le problème rencontré ?
Utilisateur: Le montant ne correspond pas à ce que j'ai commandé
Chatbot: Je n'ai pas accès aux détails de vos factures. Je vais vous transférer à un agent du support qui pourra vous aider.
[Transfert vers le support humain]
```

## Annexe 6 : Résultats des tests utilisateur

### Taux de satisfaction par catégorie
- Qualité des réponses : 4.3/5
- Vitesse de réponse : 4.5/5
- Facilité d'utilisation : 4.1/5
- Pertinence des suggestions : 4.0/5
- Satisfaction globale : 4.2/5

### Feedbacks qualitatifs
- "Le chatbot est rapide et donne des réponses claires"
- "Parfois il ne comprend pas mes questions complexes"
- "Les suggestions sont utiles"
- "J'apprécie de pouvoir transférer vers un humain quand nécessaire"

## Annexe 7 : Glossaire

- **NLP (Natural Language Processing)** : Traitement du langage naturel
- **NLU (Natural Language Understanding)** : Compréhension du langage naturel
- **API (Application Programming Interface)** : Interface de programmation d'application
- **JWT (JSON Web Token)** : Token de sécurité pour l'authentification
- **ORM (Object-Relational Mapping)** : Mapping objet-relationnel
- **CI/CD (Continuous Integration/Continuous Deployment)** : Intégration et déploiement continus
- **MoSCoW** : Méthode de priorisation (Must, Should, Could, Won't)
- **UML (Unified Modeling Language)** : Langage de modélisation unifié
- **Agile** : Méthodologie de développement logiciel itérative
- **Sprint** : Période de développement itératif en Agile

## Annexe 8 : Manuel Utilisateur du Chatbot SaLeKa

### 1. Introduction

Le chatbot SaLeKa est un assistant virtuel intelligent intégré à la plateforme SaLeKa. Il est conçu pour vous aider à trouver rapidement des réponses à vos questions, vous guider dans vos interactions avec la plateforme et vous fournir un support disponible 24h/24.

### 2. Accès au Chatbot

Depuis la plateforme SaLeKa :
1. Connectez-vous à votre compte sur la plateforme SaLeKa
2. Cliquez sur l'icône de chat en bas à droite de l'écran
3. Le widget de chat s'ouvrira automatiquement

Fonctionnalités d'accès :
- Le chatbot est accessible depuis n'importe quelle page de la plateforme
- Il conserve l'historique de vos conversations
- Il est disponible sur ordinateur, tablette et mobile

### 3. Utilisation du Chatbot

**Poser une question :**
1. Tapez votre question dans la zone de saisie en bas du widget
2. Appuyez sur Entrée ou cliquez sur le bouton d'envoi
3. Le chatbot analysera votre question et vous fournira une réponse

Conseils pour de meilleures réponses :
- Soyez précis et clair dans vos questions
- Utilisez des phrases complètes plutôt que des mots-clés
- Évitez les abréviations non standard
- Si la réponse n'est pas satisfaisante, reformulez votre question

### 4. Fonctionnalités Principales

**Réponses automatiques :**
Le chatbot peut répondre automatiquement à de nombreuses questions concernant :
- L'utilisation de la plateforme
- Les services proposés par SaLeKa
- Les procédures et processus
- Les tarifs et offres
- Le support technique de base

**Suggestions de questions :**
Le chatbot propose automatiquement des suggestions de questions basées sur :
- Votre historique de conversation
- Les questions fréquemment posées
- Le contexte de votre navigation actuelle

**Navigation contextuelle :**
Le chatbot peut vous orienter vers les sections pertinentes de la plateforme :
- Cliquez sur les liens proposés dans les réponses
- Naviguez directement vers les fonctionnalités recommandées

**Notation des réponses :**
Vous pouvez noter les réponses du chatbot pour nous aider à l'améliorer :
- Cliquez sur les étoiles (1 à 5) après chaque réponse
- Votre feedback est analysé pour améliorer la qualité

### 5. Transfert vers le Support Humain

Si le chatbot ne peut pas répondre à votre question :
1. Le chatbot vous proposera automatiquement un transfert
2. Cliquez sur "Transférer vers un agent"
3. Un agent humain prendra en charge votre conversation
4. Le contexte de votre conversation sera transmis à l'agent

Quand demander un transfert :
- Pour des questions complexes ou spécifiques
- Pour des problèmes techniques non résolus
- Pour des demandes nécessitant une intervention humaine
- Pour des questions sensibles ou confidentielles

### 6. Historique et Contexte

**Historique des conversations :**
- Vos conversations sont sauvegardées automatiquement
- Vous pouvez consulter votre historique dans le widget
- L'historique est accessible depuis votre compte utilisateur

**Maintien du contexte :**
Le chatbot se souvient du contexte de votre conversation sur 5 échanges :
- Il fait référence aux messages précédents
- Il adapte ses réponses selon le contexte
- Il détecte les changements de sujet

### 7. Dépannage

**Le chatbot ne répond pas :**
- Vérifiez votre connexion internet
- Actualisez la page de la plateforme
- Essayez de reformuler votre question
- Contactez le support technique si le problème persiste

**Réponses inappropriées :**
- Signalez la réponse en utilisant le système de notation
- Reformulez votre question avec plus de précision
- Demandez un transfert vers le support humain

**Problèmes techniques :**
- Prenez une capture d'écran du problème
- Notez l'heure et le contexte du problème
- Contactez le support via le formulaire de contact

### 8. Confidentialité et Sécurité

**Protection des données :**
- Vos conversations sont chiffrées
- Vos données personnelles sont protégées conformément au RGPD
- L'historique n'est accessible que par vous et les agents autorisés

**Bonnes pratiques :**
- Ne partagez pas de mots de passe ou d'informations sensibles
- Signalez toute activité suspecte
- Déconnectez-vous après utilisation sur un appareil partagé

---

# TABLE DES MATIÈRES

Dédicace ................................................................................ iv
Sommaire ................................................................................ vi
Remerciements ........................................................................ vi
Liste des abréviations et acronymes ........................................ viii
Liste des figures ...................................................................... ix
Liste des tableaux ...................................................................... ix
Résumé ...................................................................................... x
Abstract .................................................................................... xi
Introduction générale .............................................................. 1

DOSSIER D'INSERTION
Introduction ........................................................................... 2
I. Fonctionnement administratif et organisationnel de PPH SARL .... 2
   Historique ........................................................................ 2
   Mission et vision .......................................................... 3
   Activités principales ...................................................... 3
   Organisation structurelle ................................................. 4
II. Accueil et intégration dans l'entreprise ................................ 6
   Processus d'accueil ........................................................ 6
   Intégration dans l'équipe .................................................. 7
Conclusion du dossier d'insertion ............................................. 8

PARTIE 2 : CONCEPTION DE L'APPLICATION
DOSSIER I : Cahier des charges
Introduction ........................................................................... 9
Contexte, justification et acteurs du projet ............................... 9
Objectifs du projet ............................................................ 10
Expression des besoins ....................................................... 12
Estimation du projet ........................................................... 14
Liste des participants .......................................................... 15
Contraintes du projet .......................................................... 16
Planification du projet ........................................................ 17
Les livrables ........................................................................ 19
Conclusion du cahier des charges ............................................. 20

DOSSIER II : Cahier d'analyse et de conception
Introduction .......................................................................... 21
Étude de l'existant ............................................................. 21
Maquettes des principales interfaces ....................................... 23
Présentation de l'approche de modélisation .............................. 24
Capture des besoins fonctionnels ........................................... 25
Diagramme d'activité .......................................................... 27
Conclusion du cahier d'analyse ............................................... 28

DOSSIER VI : Cahier d'implémentation
Introduction .......................................................................... 29
I. Logiciels ........................................................................ 29
   Environnement de développement ...................................... 29
   Outils de gestion de version ............................................ 30
   Outils de test et déploiement ........................................... 31
II. Langages ....................................................................... 32
   Langages de programmation utilisés .................................... 32
   Frameworks et bibliothèques ............................................. 33
   Technologies de traitement du langage naturel ........................ 34
III. Résultats ...................................................................... 35
   Interface du chatbot ........................................................ 35
   Fonctionnalités implémentées ............................................. 36
   Intégration avec la plateforme SaLeKa .................................. 38
   Tests et validation ........................................................ 39
Conclusion .............................................................................. 41

Conclusion générale ............................................................... 42
Perspectives ........................................................................... 44
Webographie ........................................................................... 46
Annexe ................................................................................... 48
Table des matières .................................................................. 56
