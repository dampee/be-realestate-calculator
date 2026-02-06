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
      assumptions: 'Aannames',
      loanDecisionGuide: 'Beslissingsmodel voor banken'
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
      loanAmount: 'Leenbedrag (optioneel)',
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
      loanToValueExceeded: 'Het leenbedrag ligt boven het maximum en wordt begrensd in de berekeningen.'
    },
    loanDecisionGuide: {
      title: 'Het probleem dat de bank oplost',
      question: '“Mogen we deze lening toekennen zonder dat dit dossier ons om de oren vliegt?”',
      checksIntro: 'Dat wordt herleid tot drie onafhankelijke checks.',
      checksOutro: 'Fail je één check → ❌ geen lening (of parameters aanpassen).',
      sections: [
        {
          title: '1. Data model (vereenvoudigd)',
          code: [
            'Purchase {',
            '  purchasePrice: number',
            '  extraCosts: number // notaris, registratierechten, etc.',
            '}',
            '',
            'Applicant {',
            '  ownCash: number',
            '  monthlyNetIncome: number',
            '  existingMonthlyDebt: number',
            '}',
            '',
            'Property {',
            '  appraisedValue: number // min(purchasePrice, bankEstimate)',
            '}',
            '',
            'LoanPolicy {',
            '  maxLTV: number // e.g. 0.8',
            '  maxDTI: number // e.g. 0.35',
            '}'
          ]
        },
        {
          title: '2. Constraint 1: Loan To Value (LTV)',
          subtitle: 'Interpretatie',
          code: [
            'maxLoan = property.appraisedValue * policy.maxLTV',
            '',
            'if (requestedLoan > maxLoan) reject()'
          ],
          bullets: [
            'De bank leent nooit op basis van totale investering.',
            'Alleen op waarde van het onderpand.',
            'Kosten zijn out-of-band.'
          ]
        },
        {
          title: '3. Constraint 2: Eigen inbreng moet alles dekken wat niet geleend wordt',
          code: [
            'totalInvestment =',
            '  purchase.purchasePrice + purchase.extraCosts',
            '',
            'ownContributionRequired =',
            '  totalInvestment - maxLoan',
            '',
            'if (applicant.ownCash < ownContributionRequired) reject()'
          ],
          note: 'Belangrijk inzicht: je eigen inbreng is niet aankoopprijs − lening, maar (aankoop + kosten) − lening.'
        },
        {
          title: '4. Constraint 3: Terugbetalingscapaciteit (DTI)',
          code: [
            'monthlyLoanPayment = calculateAnnuity(',
            '  loanAmount,',
            '  interestRate,',
            '  duration',
            ')',
            '',
            'totalMonthlyDebt =',
            '  applicant.existingMonthlyDebt + monthlyLoanPayment',
            '',
            'dti =',
            '  totalMonthlyDebt / applicant.monthlyNetIncome',
            '',
            'if (dti > policy.maxDTI) reject()'
          ],
          bullets: [
            'maxDTI ≈ 0.30 – 0.40',
            'Bij investeringsvastgoed tellen huurinkomsten maar gedeeltelijk mee.'
          ]
        },
        {
          title: '5. Hypotheek ≠ lening (klassieke verwarring)',
          paragraphs: [
            'LoanAmount = geld dat je ontvangt.',
            'MortgageAmount = juridische waarborg voor de bank.',
            'Bank doet vaak:'
          ],
          code: [
            'mortgageAmount = loanAmount * 1.2'
          ],
          bullets: [
            'Verhoogt notariskosten.',
            'Verandert niets aan leencapaciteit.',
            'Is puur risico-afdekking.'
          ]
        },
        {
          title: '6. Waarom kosten niet “gewoon mee geleend” worden',
          paragraphs: [
            'Vanuit risicologica: kosten zijn geld dat geen onderpand creëert.'
          ],
          bullets: [
            '→ geen collateral',
            '→ hoger verlies bij default',
            '→ regulator kijkt mee',
            '→ bank wil dit niet'
          ],
          note: 'Dus: kosten = altijd eigen middelen, of via aparte (duurdere) lening.'
        },
        {
          title: '7. Volledige beslissingsflow (mentaal model)',
          code: [
            'function canGrantLoan(input): Decision {',
            '  if (!passesLTV(input)) return Reject(\"LTV too high\")',
            '  if (!hasEnoughCash(input)) return Reject(\"Insufficient own funds\")',
            '  if (!passesDTI(input)) return Reject(\"Monthly burden too high\")',
            '',
            '  return Approve()',
            '}'
          ],
          note: 'Alle drie moeten groen zijn.'
        }
      ]
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
      assumptions: 'Hypothèses',
      loanDecisionGuide: 'Modèle de décision bancaire'
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
      loanAmount: "Montant emprunté (optionnel)",
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
      loanToValueExceeded: "Le montant emprunté dépasse le maximum et est plafonné dans les calculs."
    },
    loanDecisionGuide: {
      title: 'Le problème que la banque résout',
      question: '« Peut-on accorder ce prêt sans que ce dossier nous explose au visage ? »',
      checksIntro: 'Cela se ramène à trois contrôles indépendants.',
      checksOutro: 'Si un seul contrôle échoue → ❌ pas de prêt (ou paramètres à ajuster).',
      sections: [
        {
          title: '1. Modèle de données (simplifié)',
          code: [
            'Purchase {',
            '  purchasePrice: number',
            "  extraCosts: number // notaire, droits d'enregistrement, etc.",
            '}',
            '',
            'Applicant {',
            '  ownCash: number',
            '  monthlyNetIncome: number',
            '  existingMonthlyDebt: number',
            '}',
            '',
            'Property {',
            '  appraisedValue: number // min(purchasePrice, bankEstimate)',
            '}',
            '',
            'LoanPolicy {',
            '  maxLTV: number // ex. 0.8',
            '  maxDTI: number // ex. 0.35',
            '}'
          ]
        },
        {
          title: '2. Contrainte 1 : Loan To Value (LTV)',
          subtitle: 'Interprétation',
          code: [
            'maxLoan = property.appraisedValue * policy.maxLTV',
            '',
            'if (requestedLoan > maxLoan) reject()'
          ],
          bullets: [
            "La banque ne prête jamais sur la base de l'investissement total.",
            'Uniquement sur la valeur du bien en garantie.',
            'Les frais sont hors périmètre.'
          ]
        },
        {
          title: "3. Contrainte 2 : l'apport personnel doit couvrir ce qui n'est pas emprunté",
          code: [
            'totalInvestment =',
            '  purchase.purchasePrice + purchase.extraCosts',
            '',
            'ownContributionRequired =',
            '  totalInvestment - maxLoan',
            '',
            'if (applicant.ownCash < ownContributionRequired) reject()'
          ],
          note: "Point clé : votre apport n'est pas prix d'achat − prêt, mais (achat + frais) − prêt."
        },
        {
          title: '4. Contrainte 3 : capacité de remboursement (DTI)',
          code: [
            'monthlyLoanPayment = calculateAnnuity(',
            '  loanAmount,',
            '  interestRate,',
            '  duration',
            ')',
            '',
            'totalMonthlyDebt =',
            '  applicant.existingMonthlyDebt + monthlyLoanPayment',
            '',
            'dti =',
            '  totalMonthlyDebt / applicant.monthlyNetIncome',
            '',
            'if (dti > policy.maxDTI) reject()'
          ],
          bullets: [
            'maxDTI ≈ 0.30 – 0.40',
            "Pour l'investissement immobilier, les loyers comptent seulement en partie."
          ]
        },
        {
          title: '5. Hypothèque ≠ prêt (confusion classique)',
          paragraphs: [
            "LoanAmount = l'argent que vous recevez.",
            'MortgageAmount = garantie juridique pour la banque.',
            'La banque fait souvent :'
          ],
          code: [
            'mortgageAmount = loanAmount * 1.2'
          ],
          bullets: [
            'Augmente les frais de notaire.',
            "Ne change rien à la capacité d'emprunt.",
            "C'est une couverture de risque."
          ]
        },
        {
          title: '6. Pourquoi les frais ne sont pas « simplement empruntés »',
          paragraphs: [
            "Du point de vue du risque : les frais sont de l'argent qui ne crée pas de garantie."
          ],
          bullets: [
            '→ pas de collatéral',
            '→ perte plus élevée en cas de défaut',
            '→ le régulateur surveille',
            '→ la banque ne le souhaite pas'
          ],
          note: 'Donc : frais = toujours fonds propres, ou via un prêt séparé (plus cher).'
        },
        {
          title: '7. Flux de décision complet (modèle mental)',
          code: [
            'function canGrantLoan(input): Decision {',
            '  if (!passesLTV(input)) return Reject(\"LTV too high\")',
            '  if (!hasEnoughCash(input)) return Reject(\"Insufficient own funds\")',
            '  if (!passesDTI(input)) return Reject(\"Monthly burden too high\")',
            '',
            '  return Approve()',
            '}'
          ],
          note: 'Les trois doivent être au vert.'
        }
      ]
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
