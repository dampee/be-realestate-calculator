const LOCALE_COOKIE = 'recalc_locale';
const SUPPORTED_LOCALES = ['nl', 'fr'];
const DEFAULT_LOCALE = 'nl';

const getLocaleFromNavigator = () => {
  if (typeof navigator === 'undefined') return DEFAULT_LOCALE;
  const languages = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language];
  const candidate = languages.find(Boolean) || '';
  const normalized = candidate.toLowerCase();
  if (normalized.startsWith('fr')) return 'fr';
  if (normalized.startsWith('nl')) return 'nl';
  return DEFAULT_LOCALE;
};

const getLocaleCookie = () => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_COOKIE}=([^;]+)`));
  return match ? decodeURIComponent(match[1]) : null;
};

export const getInitialLocale = () => {
  const cookieLocale = getLocaleCookie();
  if (cookieLocale && SUPPORTED_LOCALES.includes(cookieLocale)) {
    return cookieLocale;
  }
  return getLocaleFromNavigator();
};

export const setLocaleCookie = (locale) => {
  if (typeof document === 'undefined') return;
  const normalized = SUPPORTED_LOCALES.includes(locale) ? locale : DEFAULT_LOCALE;
  document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=31536000`;
};

export const getLocaleCode = (locale) => (locale === 'fr' ? 'fr-BE' : 'nl-BE');

export const translations = {
  nl: {
    appTitle: 'Belgische gemengde vastgoedcalculator',
    appSubtitle: 'Offline calculator voor appartementen + handelsruimtes.',
    languageLabel: 'Taal',
    languageOptions: {
      nl: 'Nederlands',
      fr: 'Frans'
    },
    actions: {
      new: 'Nieuw',
      save: 'Opslaan',
      duplicate: 'Dupliceren',
      delete: 'Verwijderen',
      share: 'Huidige delen',
      reset: 'Alles resetten',
      addUnit: 'Unit toevoegen',
      addCustomCost: 'Aangepaste kost toevoegen',
      resetDefaults: 'Reset naar standaard',
      remove: 'Verwijderen'
    },
    sections: {
      calculationPicker: 'Berekeningen',
      purchaseInputs: 'Aankoopgegevens',
      units: 'Units',
      costsCatalog: 'Kostenlijst',
      results: 'Resultaten',
      assumptions: 'Aannames'
    },
    labels: {
      savedCalculations: 'Opgeslagen berekeningen',
      selectCalculation: 'Selecteer een berekening',
      addressUnique: 'Adres (uniek)',
      notes: 'Notities',
      metadata: 'Metadata',
      created: 'Aangemaakt',
      updated: 'Bijgewerkt',
      region: 'Regio',
      purchasePrice: 'Aankoopprijs (€)',
      renovationBudget: 'Renovatiebudget (eenmalig)',
      loanToValue: 'Leningspercentage (max.)',
      ownInvestment: 'Eigen investering',
      vacancyApartment: 'Leegstand (appartement)',
      vacancyCommercial: 'Leegstand (handelsruimte)',
      targetNetYield: 'Doel netto rendement',
      mortgageBasisFactor: 'Hypotheekbasis factor',
      notaryPurchaseFactor: 'Notariskosten aankoop factor',
      purchaseFixedActCost: 'Vaste aktekost aankoop',
      mortgageRegistrationRate: 'Hypotheekinschrijvingsrecht',
      notaryLoanFactor: 'Notariskosten lening factor',
      loanCostBufferPct: 'Leningkosten buffer (%)',
      type: 'Type',
      label: 'Label',
      monthlyRent: 'Maandelijkse huur',
      enabled: 'Actief',
      name: 'Naam',
      category: 'Categorie',
      annualAmount: 'Jaarbedrag',
      description: 'Omschrijving'
    },
    regions: {
      vlaanderen: 'Vlaanderen',
      brussel: 'Brussel',
      wallonie: 'Wallonië'
    },
    helpers: {
      regionRate: 'Registratierechten zijn indicatief; controleer het exacte tarief.',
      loanToValueHint: 'Banken lenen vaak max. 90% (80% voor opbrengsteigendommen).',
      loanToValueMax: 'Max. leenbedrag: {amount}',
      loanAmountCalculated: 'Berekend leenbedrag: {amount}',
      loanToValueExceeded: 'Het berekende leenbedrag ligt boven het maximum en wordt begrensd in de berekeningen.'
    },
    results: {
      incomeNoi: 'Inkomsten & NOI',
      netRent: 'Netto huur (na leegstand)',
      opEx: 'Operationele kosten (excl. capex)',
      capexReserves: 'Capex-reserves',
      noi: 'NOI',
      purchaseCosts: 'Aankoopkosten',
      registration: 'Registratie',
      notaryPurchase: 'Notaris aankoop',
      fixedAct: 'Vaste akte',
      totalPurchaseCosts: 'Totale aankoopkosten',
      investmentYield: 'Investering & rendement',
      totalInvestmentExclLoan: 'Totale investering (excl. leningkosten)',
      netYield: 'Netto rendement',
      maxBid: 'Max. bod',
      maxPurchasePrice: 'Max. aankoopprijs (doelrendement)',
      maxWithLoanBuffer: 'Max. met leningbuffer',
      mortgageCosts: 'Hypotheekkosten',
      mortgageBasis: 'Hypotheekbasis',
      mortgageRegistration: 'Hypotheekinschrijving',
      notaryLoan: 'Notaris lening',
      totalLoanCosts: 'Totale leningkosten',
      notAvailable: 'N.v.t.'
    },
    unitTypes: {
      apartment: 'Appartement',
      commercial: 'Handelsruimte'
    },
    costCategories: {
      tax: 'Belastingen',
      insurance: 'Verzekering',
      maintenance: 'Onderhoud',
      inspection: 'Inspectie',
      utilities: 'Nutsvoorzieningen',
      management: 'Beheer',
      capex_reserve: 'Capex-reserve',
      other: 'Overig'
    },
    placeholders: {
      address: 'bv. Wetstraat 10',
      unitLabel: 'Unit label'
    },
    confirmations: {
      deleteCalculation: 'Deze berekening verwijderen?',
      resetAll: 'Dit wist alle opgeslagen berekeningen en concepten. Doorgaan?',
      restoreDraft: 'Concept herstellen?'
    },
    alerts: {
      shareCopied: 'Deellink gekopieerd naar klembord.',
      shareCopyPrompt: 'Kopieer de deellink:'
    },
    errors: {
      addressRequired: 'Adres is verplicht.',
      addressUnique: 'Adres moet uniek zijn (niet hoofdlettergevoelig).'
    },
    misc: {
      customCost: 'Aangepaste kost',
      newCalculation: 'Nieuwe berekening',
      imported: 'Geïmporteerd'
    },
    defaultUnitLabel: 'Appartement 1'
  },
  fr: {
    appTitle: 'Calculateur immobilier mixte belge',
    appSubtitle: 'Calculateur hors ligne pour appartements + commerces.',
    languageLabel: 'Langue',
    languageOptions: {
      nl: 'Néerlandais',
      fr: 'Français'
    },
    actions: {
      new: 'Nouveau',
      save: 'Enregistrer',
      duplicate: 'Dupliquer',
      delete: 'Supprimer',
      share: 'Partager',
      reset: 'Tout réinitialiser',
      addUnit: 'Ajouter une unité',
      addCustomCost: 'Ajouter un coût personnalisé',
      resetDefaults: 'Réinitialiser par défaut',
      remove: 'Supprimer'
    },
    sections: {
      calculationPicker: 'Sélecteur de calculs',
      purchaseInputs: "Données d'achat",
      units: 'Unités',
      costsCatalog: 'Catalogue des coûts',
      results: 'Résultats',
      assumptions: 'Hypothèses'
    },
    labels: {
      savedCalculations: 'Calculs enregistrés',
      selectCalculation: 'Sélectionner un calcul',
      addressUnique: 'Adresse (unique)',
      notes: 'Notes',
      metadata: 'Métadonnées',
      created: 'Créé',
      updated: 'Mis à jour',
      region: 'Région',
      purchasePrice: "Prix d'achat (€)",
      renovationBudget: 'Budget rénovation (ponctuel)',
      loanToValue: "Pourcentage d'emprunt (max.)",
      ownInvestment: 'Apport personnel',
      vacancyApartment: 'Vacance (appartement)',
      vacancyCommercial: 'Vacance (commerce)',
      targetNetYield: 'Rendement net cible',
      mortgageBasisFactor: 'Base hypothécaire',
      notaryPurchaseFactor: "Frais de notaire à l'achat",
      purchaseFixedActCost: "Acte fixe d'achat",
      mortgageRegistrationRate: "Droit d'inscription hypothécaire",
      notaryLoanFactor: "Frais de notaire sur l'emprunt",
      loanCostBufferPct: "Marge frais d'emprunt (%)",
      type: 'Type',
      label: 'Libellé',
      monthlyRent: 'Loyer mensuel',
      enabled: 'Actif',
      name: 'Nom',
      category: 'Catégorie',
      annualAmount: 'Montant annuel',
      description: 'Description'
    },
    regions: {
      vlaanderen: 'Flandre',
      brussel: 'Bruxelles',
      wallonie: 'Wallonie'
    },
    helpers: {
      regionRate: "Le taux d'enregistrement est indicatif ; vérifiez le taux exact.",
      loanToValueHint: 'Les banques prêtent souvent max. 90 % (80 % pour les biens de rendement).',
      loanToValueMax: 'Montant max. emprunté : {amount}',
      loanAmountCalculated: "Montant emprunté calculé : {amount}",
      loanToValueExceeded: "Le montant emprunté calculé dépasse le maximum et est plafonné dans les calculs."
    },
    results: {
      incomeNoi: 'Revenus & NOI',
      netRent: 'Loyer net (après vacance)',
      opEx: "Charges d'exploitation (hors capex)",
      capexReserves: 'Réserves capex',
      noi: 'NOI',
      purchaseCosts: "Frais d'achat",
      registration: 'Enregistrement',
      notaryPurchase: 'Notaire achat',
      fixedAct: 'Acte fixe',
      totalPurchaseCosts: "Total des frais d'achat",
      investmentYield: 'Investissement & rendement',
      totalInvestmentExclLoan: "Investissement total (hors frais d'emprunt)",
      netYield: 'Rendement net',
      maxBid: 'Offre max.',
      maxPurchasePrice: "Prix d'achat max. (rendement cible)",
      maxWithLoanBuffer: 'Max. avec marge emprunt',
      mortgageCosts: 'Frais hypothécaires',
      mortgageBasis: 'Base hypothécaire',
      mortgageRegistration: "Inscription hypothécaire",
      notaryLoan: 'Notaire emprunt',
      totalLoanCosts: 'Total frais emprunt',
      notAvailable: 'N/D'
    },
    unitTypes: {
      apartment: 'Appartement',
      commercial: 'Commerce'
    },
    costCategories: {
      tax: 'Taxes',
      insurance: 'Assurance',
      maintenance: 'Entretien',
      inspection: 'Inspection',
      utilities: 'Services publics',
      management: 'Gestion',
      capex_reserve: 'Réserve capex',
      other: 'Autre'
    },
    placeholders: {
      address: "ex. Rue de la Loi 10",
      unitLabel: "Libellé de l'unité"
    },
    confirmations: {
      deleteCalculation: 'Supprimer ce calcul ?',
      resetAll: 'Cela effacera tous les calculs et brouillons enregistrés. Continuer ?',
      restoreDraft: 'Restaurer le brouillon ?'
    },
    alerts: {
      shareCopied: 'Lien de partage copié dans le presse-papiers.',
      shareCopyPrompt: 'Copiez le lien de partage :'
    },
    errors: {
      addressRequired: "L'adresse est obligatoire.",
      addressUnique: "L'adresse doit être unique (insensible à la casse)."
    },
    misc: {
      customCost: 'Coût personnalisé',
      newCalculation: 'Nouveau calcul',
      imported: 'Importé'
    },
    defaultUnitLabel: 'Appartement 1'
  }
};

export const getCopy = (locale) => translations[locale] ?? translations[DEFAULT_LOCALE];

export const defaultCostContent = {
  'insurance-building': {
    nl: {
      name: 'Gebouwverzekering (brandverzekering)',
      description: 'Brand- en gebouwverzekering.'
    },
    fr: {
      name: 'Assurance bâtiment (incendie)',
      description: "Assurance incendie et structure."
    }
  },
  'insurance-liability': {
    nl: {
      name: 'Aansprakelijkheidsverzekering (BA)',
      description: 'Burgerlijke aansprakelijkheidsdekking.'
    },
    fr: {
      name: 'Assurance responsabilité civile',
      description: 'Couverture de responsabilité civile.'
    }
  },
  'maintenance-general': {
    nl: {
      name: 'Algemeen onderhoud',
      description: 'Kleine herstellingen en onderhoud.'
    },
    fr: {
      name: 'Entretien général',
      description: 'Petites réparations et entretien.'
    }
  },
  'capex-reserve': {
    nl: {
      name: 'CAPEX-reserve (grote herstellingen)',
      description: 'Jaarlijkse reserve voor grote herstellingen.'
    },
    fr: {
      name: 'Réserve CAPEX (grosses réparations)',
      description: 'Réserve annuelle pour les grosses réparations.'
    }
  },
  'inspection-fire-safety': {
    nl: {
      name: 'Brandveiligheid / blusmiddelen',
      description: 'Periodieke brandveiligheidscontroles.'
    },
    fr: {
      name: 'Sécurité incendie / extincteurs',
      description: 'Contrôles périodiques de sécurité incendie.'
    }
  },
  'inspection-electrical': {
    nl: {
      name: 'Elektrische keuring (geannualiseerd)',
      description: 'Gemiddelde jaarlijkse elektrische controles.'
    },
    fr: {
      name: 'Contrôle électrique (annualisé)',
      description: 'Moyenne annuelle des contrôles électriques.'
    }
  },
  'inspection-gas': {
    nl: {
      name: 'Gaskontrole (geannualiseerd)',
      description: 'Gemiddelde jaarlijkse gascontroles.'
    },
    fr: {
      name: 'Contrôle gaz (annualisé)',
      description: 'Moyenne annuelle des contrôles gaz.'
    }
  },
  'inspection-elevator': {
    nl: {
      name: 'Liftkeuring',
      description: 'Keuring van de lift.'
    },
    fr: {
      name: 'Contrôle ascenseur',
      description: "Certification de l'ascenseur."
    }
  },
  'tax-property': {
    nl: {
      name: 'Onroerende voorheffing',
      description: 'Jaarlijkse onroerende voorheffing.'
    },
    fr: {
      name: 'Précompte immobilier',
      description: 'Précompte immobilier annuel.'
    }
  },
  'tax-municipality': {
    nl: {
      name: 'Gemeentebelastingen',
      description: 'Lokale gemeentebelastingen.'
    },
    fr: {
      name: 'Taxes communales',
      description: 'Taxes communales locales.'
    }
  },
  management: {
    nl: {
      name: 'Beheer / syndic / boekhouding',
      description: 'Administratieve of beheerskosten.'
    },
    fr: {
      name: 'Gestion / syndic / comptabilité',
      description: 'Frais administratifs ou de gestion.'
    }
  },
  reletting: {
    nl: {
      name: 'Herverhuring / advertenties',
      description: 'Kosten voor nieuwe verhuring.'
    },
    fr: {
      name: 'Relocation / publicité',
      description: 'Coûts de changement de locataire.'
    }
  }
};
