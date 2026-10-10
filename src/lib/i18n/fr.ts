export const fr = {
  auth: {
    login: {
      title: "Bienvenue Directeur",
      subtitle: "Accès",
      description: "Connectez-vous pour gérer vos actifs d'intelligence.",
      email: "Email professionnel",
      password: "Mot de passe sécurisé",
      rememberMe: "Se souvenir de moi",
      forgotPassword: "Mot de passe oublié ?",
      signIn: "Se connecter",
      or: "OU",
      useBiometrics: "Utiliser la biométrie",
      noAccount: "Vous n'avez pas de compte ?",
      signUpLink: "S'inscrire",
      continueWithGoogle: "Se connecter avec Google",
      openGmail: "Ouvrir Gmail",
      notSeeingEmail: "Vous ne recevez pas l'email ?",
      wrongEmail: "Mauvais email ?",
      rightPanel: {
       title: "L'intelligence simplifiée.",
       description: "Accédez à des signaux haute fidélité et à des analyses de marché avec le nouveau tableau de bord Directeur."
      }
    },
    biometric: {
      signInButton: "Se connecter avec la biométrie",
      enterEmailFirst: "Veuillez d'abord saisir votre email",
      deviceNotSupported: "Votre appareil ne prend pas en charge l'authentification biométrique. Veuillez activer Windows Hello, Touch ID ou l'empreinte digitale dans les paramètres de votre système.",
      userNotFound: "Utilisateur introuvable. Veuillez vous connecter par email ou Google pour créer un compte.",
      notActivated: "La biométrie n'est pas activée pour ce compte. Veuillez d'abord vous connecter par email, puis l'activer dans les Paramètres.",
      authenticating: "Authentification..."
    },
    signup: {
      title: "Créez votre",
      subtitle: "Compte Directeur",
      description: "Inscrivez-vous pour gérer vos actifs d'intelligence.",
      fullName: "Nom complet",
      email: "Email professionnel",
      password: "Mot de passe sécurisé",
      signUp: "S'inscrire",
      or: "OU",
      useBiometrics: "Utiliser la biométrie",
      haveAccount: "Vous avez déjà un compte ?",
      signInLink: "Se connecter"
    },
    twoFactor: {
      title: "Authentification à deux facteurs",
      description: "Veuillez saisir le code de vérification pour continuer.",
      code: "Code d'authentification",
      verify: "Vérifier"
    }
  },
  nav: {
    overview: "Vue d'ensemble",
    history: "Historique",
    predictions: "Prédictions",
    comparison: "Comparaison",
    profile: "Profil",
    settings: "Paramètres",
    logout: "Se déconnecter"
  },
  overview: {
    title: "Vue d'ensemble",
    lastUpdate: "Dernière mise à jour : {time}",
    totalWaitTime: "Temps d'attente total",
    avgWaitTime: "Temps d'attente moyen",
    totalVisitors: "Visiteurs totaux",
    avgServiceTime: "Temps de service moyen",
    serviceRate: "Taux de service",
    satisfaction: "Satisfaction",
    productivity: "Productivité",
    volumeTarget: "Cible de volume",
    mins: "min",
    callsH: "appels/h",
   
    charts: {
      waitTimeDistribution: "Distribution du temps d'attente",
      servicePerformance: "Performance du service",
      dailyTrends: "Tendances quotidiennes"
    },
    syncHistory: "Synchroniser l'historique",
    aiChat: "Chat IA",
    aiAdvisorSubtitle: "Conseiller analytique connecté aux journaux système",
    globalAvg: "Moyenne Globale",
    recentAlerts: "Alertes Récentes",
    dbSyncReminder: "Rappel de synchronisation de la base de données :",
    total: "total",
    avg: "moy",
    last7d: "7 derniers jours",
    target: "Cible < 3.0m",
    optimal: "Optimal",
    abandonRate: "Taux d'abandon",
    high: "Élevé",
    healthy: "Sain",
    slaBreaches: "Violations SLA",
    critical: "Critique",
    stable: "Stable",
    peakHourVolume: "Volume en heure de pointe",
    highestDay: "Jour le plus élevé",
    tickets: "tickets",
    occupancyRate: "Taux d'occupation",
    overloaded: "Surchargé",
    busy: "Occupé",
    slack: "Faible",
    alerts: {
      longWaitTime: "⏳ Temps d'attente long : {time}m à {site}",
      highAbandonRate: "⚠️ Taux d'abandon élevé : {rate}% à {site}",
      slaBreaches: "🚩 {count} Violations SLA à {site}",
      lowCompliance: "📉 Conformité faible : {rate}% à {site}",
      allHealthy: "Niveaux de personnel sains. Aucun avertissement SLA à venir.",
      allPerforming: "Toutes les files d'attente fonctionnent parfaitement.",
      justNow: "À l'instant",
      minutesAgo: "il y a {count}m"
    },
    insights: {
      weeklyCongestion: "Alerte de congestion hebdomadaire : {count} violations SLA se sont produites au cours des 7 derniers jours. Ajustez immédiatement le modèle de personnel.",
      operationalStable: "Modèle opérationnel très stable. Temps d'attente moyens combinés de {wait} min, conformité SLA à {service}%.",
      waitTimesStable: "Les temps d'attente calculés semblent extrêmement stables pour ce cycle. Maintenez l'équilibre des ressources."
    }
  },
  history: {
    title: "Historique",
    dateRange: "Plage de dates",
    site: "Site",
    service: "Service",
    period: "Période",
    week: "Dernière semaine",
    month: "Dernier mois",
    quarter: "Dernier trimestre",
    allSites: "Tous les sites mondiaux",
    allServices: "Tous les services",
    table: {
      date: "Date",
      site: "Site",
      service: "Service",
      volume: "Volume",
      waitTime: "Temps d'attente",
      serviceTime: "Temps de service",
      serviceRate: "Taux de service",
      satisfaction: "Satisfaction",
      productivity: "Productivité"
    }
  },
  predictions: {
    title: "Prédictions",
    horizon: "Horizon",
    week: "Prochaine semaine",
    month: "Prochain mois",
    quarter: "Prochain trimestre",
    generate: "Générer des prédictions",
    syncPredictions: "Synchroniser les Prédictions",
    modelUpdateReminder: "Mise à jour du modèle de prédiction :",
    table: {
      date: "Date",
      predictedVolume: "Volume prédit",
      predictedWaitTime: "Temps d'attente prédit",
      confidence: "Confiance"
    }
  },
  comparison: {
    title: "Comparaison d'horizon",
    horizon: "Horizon de comparaison",
    kpi: "KPI",
    volume: "Volume",
    waitTime: "Temps d'attente",
    productivity: "Productivité",
    serviceRate: "Taux de service",
    personalization: "Facteur de personnalisation",
    agentStaffing: "Ajustement du personnel"
  },
  profile: {
    title: "Profil utilisateur",
    avatar: "Avatar",
    name: "Nom",
    email: "Email",
    role: "Rôle",
    joinDate: "Date d'inscription",
    enableBiometrics: "Activer l'authentification biométrique",
    setupBiometrics: "Configurer la biométrie"
  },
  settings: {
    title: "Paramètres",
    language: "Langue",
    notifications: "Notifications",
    theme: "Thème",
    light: "Clair",
    dark: "Sombre",
    save: "Enregistrer",
    accountProtection: "Protection du compte",
    available: "Disponible",
    notAvailable: "Non disponible",
    n8nWebhook: "Endpoint Webhook N8N",
    testWebhook: "⚡ Tester l'intégration Webhook",
    success: "✔ Succès",
    failed: "✖ Échec",
    avatarHint1: "Cliquez sur votre avatar pour télécharger une nouvelle photo",
    avatarHint2: "Recommandé : Images carrées • Redimensionnées à 400x400 • Toute taille acceptée",
    languages: {
      fr: 'Français',
      en: 'Anglais',
      ar: 'Arabe',
    }
  },
  common: {
    syncing: "Synchronisation...",
    loading: "Chargement...",
    noData: "Aucune donnée disponible",
    save: "Enregistrer",
    cancel: "Annuler",
    submit: "Soumettre",
    waitP90: "Attente P90",
    slaBreaches: "Violations SLA",
    itemsPerPage: "éléments par page",
    ofPages: "sur {pages} pages"
  }
};