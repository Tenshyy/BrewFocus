/**
 * Demo mode — generates mock AI responses based on keyword matching.
 * Used when provider === "demo" to let users try the app without an API key.
 */

// ─── Keyword groups for braindump task generation ────────────────────────

interface KeywordGroup {
  keywords: string[];
  tasks: Array<{
    title: string;
    category: "admin" | "perso" | "travail" | "idee";
    priority: "haute" | "moyenne" | "basse";
    estimatedPomodoros?: number;
  }>;
  parking?: string[];
}

const KEYWORD_GROUPS_FR: KeywordGroup[] = [
  {
    keywords: ["email", "mail", "message", "repondre", "envoyer", "inbox"],
    tasks: [
      { title: "Trier la boite de reception", category: "admin", priority: "haute", estimatedPomodoros: 1 },
      { title: "Repondre aux emails urgents", category: "travail", priority: "haute", estimatedPomodoros: 1 },
      { title: "Desabonner des newsletters inutiles", category: "admin", priority: "basse", estimatedPomodoros: 1 },
    ],
    parking: ["Mettre en place des filtres email automatiques"],
  },
  {
    keywords: ["reunion", "meeting", "call", "appel", "visio", "teams", "zoom"],
    tasks: [
      { title: "Preparer l'ordre du jour", category: "travail", priority: "haute", estimatedPomodoros: 1 },
      { title: "Envoyer le compte-rendu", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Bloquer du temps focus apres la reunion", category: "admin", priority: "moyenne" },
    ],
    parking: ["Evaluer si certaines reunions peuvent devenir des emails"],
  },
  {
    keywords: ["code", "dev", "bug", "feature", "api", "deploy", "git", "test", "refactor", "pr", "pull request"],
    tasks: [
      { title: "Corriger le bug prioritaire", category: "travail", priority: "haute", estimatedPomodoros: 2 },
      { title: "Ecrire les tests unitaires", category: "travail", priority: "moyenne", estimatedPomodoros: 2 },
      { title: "Code review de la PR", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Mettre a jour la documentation technique", category: "travail", priority: "basse", estimatedPomodoros: 1 },
    ],
    parking: ["Planifier la migration de dette technique"],
  },
  {
    keywords: ["design", "maquette", "ui", "ux", "figma", "proto", "visuel", "logo"],
    tasks: [
      { title: "Finaliser les maquettes", category: "travail", priority: "haute", estimatedPomodoros: 3 },
      { title: "Preparer les assets graphiques", category: "travail", priority: "moyenne", estimatedPomodoros: 2 },
      { title: "Feedback design a integrer", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  },
  {
    keywords: ["courses", "acheter", "magasin", "supermarche", "commande", "livraison"],
    tasks: [
      { title: "Faire la liste de courses", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Commander les fournitures manquantes", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  },
  {
    keywords: ["sport", "sante", "medecin", "rdv", "dentiste", "gym", "courir", "yoga"],
    tasks: [
      { title: "Prendre rendez-vous medical", category: "perso", priority: "haute", estimatedPomodoros: 1 },
      { title: "Planifier les seances de sport de la semaine", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
    ],
    parking: ["Rechercher un nouveau programme d'entrainement"],
  },
  {
    keywords: ["budget", "facture", "payer", "banque", "impot", "comptabilite", "argent", "finance"],
    tasks: [
      { title: "Payer les factures en attente", category: "admin", priority: "haute", estimatedPomodoros: 1 },
      { title: "Verifier les releves bancaires", category: "admin", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Mettre a jour le budget mensuel", category: "admin", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  },
  {
    keywords: ["ecrire", "article", "blog", "rediger", "contenu", "texte", "rapport", "presentation"],
    tasks: [
      { title: "Rediger le premier brouillon", category: "travail", priority: "haute", estimatedPomodoros: 3 },
      { title: "Relire et corriger", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Chercher les sources / references", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
    ],
    parking: ["Creer un calendrier editorial"],
  },
  {
    keywords: ["menage", "ranger", "nettoyer", "organiser", "tri", "demenager"],
    tasks: [
      { title: "Ranger le bureau / espace de travail", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Faire le tri dans les dossiers", category: "admin", priority: "basse", estimatedPomodoros: 2 },
    ],
  },
  {
    keywords: ["apprendre", "formation", "cours", "tuto", "lire", "etudier", "mooc"],
    tasks: [
      { title: "Suivre le module de formation", category: "perso", priority: "moyenne", estimatedPomodoros: 2 },
      { title: "Prendre des notes sur le chapitre", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Pratiquer les exercices", category: "perso", priority: "basse", estimatedPomodoros: 2 },
    ],
    parking: ["Explorer d'autres ressources d'apprentissage"],
  },
];

const KEYWORD_GROUPS_EN: KeywordGroup[] = [
  {
    keywords: ["email", "mail", "message", "reply", "send", "inbox"],
    tasks: [
      { title: "Sort through inbox", category: "admin", priority: "haute", estimatedPomodoros: 1 },
      { title: "Reply to urgent emails", category: "travail", priority: "haute", estimatedPomodoros: 1 },
      { title: "Unsubscribe from useless newsletters", category: "admin", priority: "basse", estimatedPomodoros: 1 },
    ],
    parking: ["Set up automatic email filters"],
  },
  {
    keywords: ["meeting", "call", "teams", "zoom", "standup", "sync"],
    tasks: [
      { title: "Prepare the agenda", category: "travail", priority: "haute", estimatedPomodoros: 1 },
      { title: "Send meeting notes", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Block focus time after the meeting", category: "admin", priority: "moyenne" },
    ],
    parking: ["Evaluate if some meetings could be emails"],
  },
  {
    keywords: ["code", "dev", "bug", "feature", "api", "deploy", "git", "test", "refactor", "pr", "pull request"],
    tasks: [
      { title: "Fix the priority bug", category: "travail", priority: "haute", estimatedPomodoros: 2 },
      { title: "Write unit tests", category: "travail", priority: "moyenne", estimatedPomodoros: 2 },
      { title: "Code review the PR", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Update technical documentation", category: "travail", priority: "basse", estimatedPomodoros: 1 },
    ],
    parking: ["Plan the tech debt migration"],
  },
  {
    keywords: ["design", "mockup", "ui", "ux", "figma", "proto", "visual", "logo"],
    tasks: [
      { title: "Finalize the mockups", category: "travail", priority: "haute", estimatedPomodoros: 3 },
      { title: "Prepare graphic assets", category: "travail", priority: "moyenne", estimatedPomodoros: 2 },
      { title: "Integrate design feedback", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  },
  {
    keywords: ["groceries", "buy", "store", "shop", "order", "delivery"],
    tasks: [
      { title: "Make the grocery list", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Order missing supplies", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  },
  {
    keywords: ["sport", "health", "doctor", "appointment", "dentist", "gym", "run", "yoga"],
    tasks: [
      { title: "Book medical appointment", category: "perso", priority: "haute", estimatedPomodoros: 1 },
      { title: "Plan this week's workout sessions", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
    ],
    parking: ["Research a new training program"],
  },
  {
    keywords: ["budget", "bill", "pay", "bank", "tax", "accounting", "money", "finance"],
    tasks: [
      { title: "Pay pending bills", category: "admin", priority: "haute", estimatedPomodoros: 1 },
      { title: "Check bank statements", category: "admin", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Update the monthly budget", category: "admin", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  },
  {
    keywords: ["write", "article", "blog", "draft", "content", "text", "report", "presentation"],
    tasks: [
      { title: "Write the first draft", category: "travail", priority: "haute", estimatedPomodoros: 3 },
      { title: "Proofread and revise", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Find sources / references", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
    ],
    parking: ["Create an editorial calendar"],
  },
  {
    keywords: ["clean", "tidy", "organize", "sort", "declutter", "move"],
    tasks: [
      { title: "Tidy up desk / workspace", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Sort through files", category: "admin", priority: "basse", estimatedPomodoros: 2 },
    ],
  },
  {
    keywords: ["learn", "training", "course", "tutorial", "read", "study", "mooc"],
    tasks: [
      { title: "Complete the training module", category: "perso", priority: "moyenne", estimatedPomodoros: 2 },
      { title: "Take notes on the chapter", category: "perso", priority: "moyenne", estimatedPomodoros: 1 },
      { title: "Practice the exercises", category: "perso", priority: "basse", estimatedPomodoros: 2 },
    ],
    parking: ["Explore more learning resources"],
  },
];

const FALLBACK_TASKS_FR = [
  { title: "Definir les priorites de la journee", category: "admin" as const, priority: "haute" as const, estimatedPomodoros: 1 },
  { title: "Traiter les taches rapides (< 5 min)", category: "admin" as const, priority: "moyenne" as const, estimatedPomodoros: 1 },
  { title: "Avancer sur le projet principal", category: "travail" as const, priority: "haute" as const, estimatedPomodoros: 3 },
  { title: "Faire un point sur les taches en cours", category: "admin" as const, priority: "moyenne" as const, estimatedPomodoros: 1 },
];

const FALLBACK_TASKS_EN = [
  { title: "Set today's priorities", category: "admin" as const, priority: "haute" as const, estimatedPomodoros: 1 },
  { title: "Handle quick tasks (< 5 min)", category: "admin" as const, priority: "moyenne" as const, estimatedPomodoros: 1 },
  { title: "Work on the main project", category: "travail" as const, priority: "haute" as const, estimatedPomodoros: 3 },
  { title: "Review tasks in progress", category: "admin" as const, priority: "moyenne" as const, estimatedPomodoros: 1 },
];

const FALLBACK_PARKING_FR = ["Revoir l'organisation generale de la semaine"];
const FALLBACK_PARKING_EN = ["Review overall weekly organization"];

// ─── Braindump response generator ────────────────────────────────────────

export function generateDemoResponse(
  inputText: string,
  locale: string = "fr"
): {
  tasks: Array<{
    title: string;
    category: string;
    priority: string;
    estimatedPomodoros?: number;
  }>;
  parkingLot: string[];
} {
  const groups = locale === "en" ? KEYWORD_GROUPS_EN : KEYWORD_GROUPS_FR;
  const fallbackTasks = locale === "en" ? FALLBACK_TASKS_EN : FALLBACK_TASKS_FR;
  const fallbackParking = locale === "en" ? FALLBACK_PARKING_EN : FALLBACK_PARKING_FR;

  const lower = inputText.toLowerCase();
  const tasks: Array<{
    title: string;
    category: string;
    priority: string;
    estimatedPomodoros?: number;
  }> = [];
  const parking: string[] = [];

  // Match keyword groups
  for (const group of groups) {
    if (group.keywords.some((kw) => lower.includes(kw))) {
      const pick = group.tasks.slice(0, 2 + Math.floor(Math.random() * 2));
      tasks.push(...pick);
      if (group.parking?.length) {
        parking.push(...group.parking);
      }
    }
  }

  // If nothing matched, use fallback
  if (tasks.length === 0) {
    tasks.push(...fallbackTasks.slice(0, 3));
    parking.push(...fallbackParking);
  }

  return {
    tasks: tasks.slice(0, 5),
    parkingLot: parking.slice(0, 2),
  };
}

// ─── AI mode response generator ──────────────────────────────────────────

type DemoResponseFn = (content: string) => Record<string, unknown>;

const DEMO_RESPONSES_FR: Record<string, DemoResponseFn> = {
  braindump: (content) => generateDemoResponse(content, "fr"),

  decompose: () => ({
    tasks: [
      { title: "Etape 1 — Analyser le besoin", category: "travail", priority: "haute", estimatedPomodoros: 1 },
      { title: "Etape 2 — Prototyper la solution", category: "travail", priority: "haute", estimatedPomodoros: 2 },
      { title: "Etape 3 — Implementer", category: "travail", priority: "haute", estimatedPomodoros: 3 },
      { title: "Etape 4 — Tester et valider", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  }),

  planner: () => ({
    plan: [
      { title: "Taches urgentes et emails", suggestedPomodoros: 1, order: 1, reason: "Commencer par debloquer les autres" },
      { title: "Travail profond (projet principal)", suggestedPomodoros: 3, order: 2, reason: "Profiter de l'energie du matin" },
      { title: "Reunions et collaboration", suggestedPomodoros: 1, order: 3, reason: "Apres-midi = moment social" },
      { title: "Taches administratives", suggestedPomodoros: 1, order: 4, reason: "Finir la journee en douceur" },
    ],
  }),

  bilan: () => ({
    text: "**Bilan de la journee (demo)**\n\nVous avez montre une bonne regularite dans vos sessions focus. Points forts : utilisation constante du timer. Axes d'amelioration : essayez de lier chaque pomodoro a une tache specifique pour mieux mesurer votre progression.\n\n*Configurez une cle API pour obtenir des bilans personnalises bases sur vos vraies donnees.*",
  }),

  coach: () => ({
    text: "**Conseil du barista (demo)**\n\nPour maximiser votre productivite, essayez la technique du \"eat the frog\" — commencez par la tache la plus difficile ou la moins agreable. Votre cerveau est plus frais le matin et la satisfaction d'avoir termine vous motivera pour le reste.\n\n*Configurez une cle API pour des conseils adaptes a votre situation.*",
  }),

  draft: () => ({
    text: "**Brouillon (demo)**\n\nVoici un squelette de base :\n\n1. Introduction — contexte et objectif\n2. Probleme identifie\n3. Solution proposee\n4. Prochaines etapes\n\n*Configurez une cle API pour une redaction complete et personnalisee.*",
  }),

  focusBrief: () => ({
    brief: "Objectif de ce pomodoro : avancer sur la tache en cours avec concentration. Mettez votre telephone en silencieux, fermez les onglets inutiles, et commencez par l'etape la plus simple. C'est parti !",
  }),

  inbox: (content) => generateDemoResponse(content, "fr"),

  overload: () => ({
    text: "**Analyse de charge (demo)**\n\nVous avez plusieurs taches en cours. Suggestion : identifiez les 3 taches les plus impactantes et concentrez-vous dessus aujourd'hui. Le reste peut attendre demain.\n\n*Configurez une cle API pour une analyse detaillee de votre charge reelle.*",
  }),

  categorize: () => ({
    detectedCategory: "travail",
    detectedPriority: "moyenne",
  }),

  estimate: () => ({
    estimatedPomodoros: 2,
    reasoning: "Tache de complexite moyenne, environ 2 pomodoros (demo).",
  }),

  chat: () => ({
    text: "Salut ! Je suis le mode demo du barista. Je peux vous donner un apercu des fonctionnalites IA, mais pour des reponses vraiment personnalisees, configurez une cle API dans les parametres (Groq est gratuit !). Que puis-je faire pour vous ?",
  }),

  chooseForMe: () => ({
    chosenTaskId: "demo-task",
    chosenTaskTitle: "Tache prioritaire (demo)",
    reason: "Cette tache est la plus urgente et la plus rapide a completer. En la terminant d'abord, tu creeras un momentum positif pour le reste de la journee !",
    tip: "Commence par lire la tache pendant 30 secondes, puis ecris la premiere micro-action a faire.",
  }),

  weeklyReview: () => ({
    summary: "Semaine productive avec une bonne regularite dans les sessions focus. Vous avez maintenu votre streak et complete plusieurs taches importantes.",
    wins: ["Regularite des sessions pomodoro", "Plusieurs taches haute priorite completees", "Utilisation constante du brain dump"],
    challenges: ["Quelques taches reportees en fin de semaine", "Temps de pause parfois depasse"],
    insights: ["Vos sessions les plus productives sont le matin", "Les taches estimees a 1 pomodoro prennent souvent 2 — ajustez vos estimations"],
    nextWeekFocus: ["Terminer les taches reportees de cette semaine", "Planifier les sessions focus la veille"],
    actionItems: [
      { title: "Revoir les taches en retard", priority: "haute", category: "admin" },
      { title: "Planifier la semaine dimanche soir", priority: "moyenne", category: "admin" },
      { title: "Ajuster les estimations pomodoro", priority: "basse", category: "admin" },
    ],
  }),
};

const DEMO_RESPONSES_EN: Record<string, DemoResponseFn> = {
  braindump: (content) => generateDemoResponse(content, "en"),

  decompose: () => ({
    tasks: [
      { title: "Step 1 — Analyze the need", category: "travail", priority: "haute", estimatedPomodoros: 1 },
      { title: "Step 2 — Prototype the solution", category: "travail", priority: "haute", estimatedPomodoros: 2 },
      { title: "Step 3 — Implement", category: "travail", priority: "haute", estimatedPomodoros: 3 },
      { title: "Step 4 — Test and validate", category: "travail", priority: "moyenne", estimatedPomodoros: 1 },
    ],
  }),

  planner: () => ({
    plan: [
      { title: "Urgent tasks and emails", suggestedPomodoros: 1, order: 1, reason: "Start by unblocking others" },
      { title: "Deep work (main project)", suggestedPomodoros: 3, order: 2, reason: "Leverage morning energy" },
      { title: "Meetings and collaboration", suggestedPomodoros: 1, order: 3, reason: "Afternoon = social time" },
      { title: "Administrative tasks", suggestedPomodoros: 1, order: 4, reason: "Wind down the day gently" },
    ],
  }),

  bilan: () => ({
    text: "**Daily review (demo)**\n\nYou've shown good consistency in your focus sessions. Strengths: consistent use of the timer. Areas for improvement: try linking each pomodoro to a specific task to better track your progress.\n\n*Configure an API key to get personalized reviews based on your real data.*",
  }),

  coach: () => ({
    text: "**Barista's advice (demo)**\n\nTo maximize your productivity, try the \"eat the frog\" technique — start with the hardest or least pleasant task. Your brain is freshest in the morning and the satisfaction of finishing will motivate you for the rest of the day.\n\n*Configure an API key for personalized advice.*",
  }),

  draft: () => ({
    text: "**Draft (demo)**\n\nHere's a basic outline:\n\n1. Introduction — context and objective\n2. Problem identified\n3. Proposed solution\n4. Next steps\n\n*Configure an API key for complete, personalized drafting.*",
  }),

  focusBrief: () => ({
    brief: "Goal for this pomodoro: make progress on the current task with focus. Put your phone on silent, close unnecessary tabs, and start with the simplest step. Let's go!",
  }),

  inbox: (content) => generateDemoResponse(content, "en"),

  overload: () => ({
    text: "**Workload analysis (demo)**\n\nYou have several tasks in progress. Suggestion: identify the 3 most impactful tasks and focus on those today. The rest can wait until tomorrow.\n\n*Configure an API key for a detailed analysis of your actual workload.*",
  }),

  categorize: () => ({
    detectedCategory: "travail",
    detectedPriority: "moyenne",
  }),

  estimate: () => ({
    estimatedPomodoros: 2,
    reasoning: "Medium complexity task, about 2 pomodoros (demo).",
  }),

  chat: () => ({
    text: "Hi! I'm the barista's demo mode. I can give you a preview of the AI features, but for truly personalized responses, configure an API key in settings (Groq is free!). What can I do for you?",
  }),

  chooseForMe: () => ({
    chosenTaskId: "demo-task",
    chosenTaskTitle: "Priority task (demo)",
    reason: "This task is the most urgent and quickest to complete. By finishing it first, you'll create positive momentum for the rest of the day!",
    tip: "Start by reading the task for 30 seconds, then write down the first micro-action to take.",
  }),

  weeklyReview: () => ({
    summary: "Productive week with good consistency in focus sessions. You maintained your streak and completed several important tasks.",
    wins: ["Consistent pomodoro sessions", "Several high-priority tasks completed", "Constant use of brain dump"],
    challenges: ["Some tasks postponed at the end of the week", "Break time sometimes exceeded"],
    insights: ["Your most productive sessions are in the morning", "Tasks estimated at 1 pomodoro often take 2 — adjust your estimates"],
    nextWeekFocus: ["Finish tasks postponed from this week", "Plan focus sessions the night before"],
    actionItems: [
      { title: "Review overdue tasks", priority: "haute", category: "admin" },
      { title: "Plan the week on Sunday evening", priority: "moyenne", category: "admin" },
      { title: "Adjust pomodoro estimates", priority: "basse", category: "admin" },
    ],
  }),
};

export function generateDemoAiResponse(
  mode: string,
  content: string,
  locale: string = "fr"
): { mode: string } & Record<string, unknown> {
  const responses = locale === "en" ? DEMO_RESPONSES_EN : DEMO_RESPONSES_FR;
  const generator = responses[mode] || responses.chat;
  return {
    mode,
    ...generator(content),
  };
}
