export type SupportedLanguage = 'en' | 'fr';

export interface Translations {
  appName: string;
  tagline: string;
  // Header / Top Bar
  newProject: string;
  saveProject: string;
  duplicateProject: string;
  renameProject: string;
  deleteProject: string;
  exportJson: string;
  importJson: string;
  report: string;
  darkMode: string;
  lightMode: string;
  projectSaved: string;

  // Design Modes
  quickDesign: string;
  engineeringDesign: string;
  professionalValidation: string;

  // System Overview
  systemOverview: string;
  totalLoad: string;
  solarArray: string;
  batteryBank: string;
  inverter: string;
  mppt: string;
  autonomy: string;
  estimatedCost: string;
  day: string;
  days: string;
  panels: string;
  batteries: string;

  // Sizing Status & Recommendations
  systemStatus: string;
  statusWellSized: string;
  statusMarginal: string;
  statusLowSolar: string;
  statusBatterySmall: string;
  statusInverterUndersized: string;
  statusOversized: string;
  recommendations: string;

  // Appliance Load Estimator
  applianceEstimator: string;
  quickAddPresets: string;
  addCustomAppliance: string;
  applianceName: string;
  quantity: string;
  watts: string;
  hoursPerDay: string;
  daytimeHours: string;
  nighttimeHours: string;
  simultaneousFactor: string;
  surgeMultiplier: string;
  dailyWh: string;
  status: string;
  actions: string;
  enabled: string;
  disabled: string;
  delete: string;
  emptyAppliancesMsg: string;

  // Day vs Night
  dayVsNight: string;
  daytimeUsage: string;
  nighttimeUsage: string;
  dayNightHelp: string;

  // Solar Resource & Location
  solarResource: string;
  country: string;
  city: string;
  peakSunHours: string;
  panelOrientation: string;
  panelOrientationHelp: string;
  efficiency: string;
  cloudyDaysBuffer: string;
  cloudyBufferHelp: string;
  none: string;
  cloudyDay1: string;
  cloudyDays2: string;
  cloudyDays3: string;
  panelWattage: string;
  reserveMargin: string;
  dailySolarGen: string;
  solarMargin: string;

  // Battery Configuration
  batteryConfig: string;
  chemistry: string;
  systemVoltage: string;
  unitCapacity: string;
  unitNominalEnergy: string;
  depthOfDischarge: string;
  dodHelp: string;
  backupDays: string;
  backupDaysDesc: string;
  usableCapacity: string;
  nominalCapacity: string;
  safeReserveSoc: string;

  // Inverter & MPPT
  powerConversion: string;
  continuousPower: string;
  peakSurgePower: string;
  inverterHeadroom: string;
  inverterHeadroomHelp: string;
  recommendedInverter: string;
  selectedInverter: string;
  mpptSizing: string;
  mpptSafetyCurrent: string;
  mpptUnitRating: string;

  // 24H Battery Graph
  battery24hCycle: string;
  stateOfCharge: string;
  solarGeneration: string;
  loadDemand: string;
  safeDodThreshold: string;
  dangerThreshold: string;
  minSoc: string;
  maxSoc: string;
  timeHour: string;

  // Market Prices & Cost Breakdown
  marketPrices: string;
  currency: string;
  exchangeRate: string;
  costBreakdown: string;
  equipmentSubtotal: string;
  installationSubtotal: string;
  logisticsSubtotal: string;
  grandTotal: string;
  item: string;
  unitPrice: string;
  subtotal: string;

  // Advanced Engineering
  advancedSettings: string;
  systemLosses: string;
  cableLoss: string;
  tempDerating: string;
  pvDerating: string;
  batteryRoundtrip: string;
  annualDegradation: string;

  // String Design
  stringDesign: string;
  vocSTC: string;
  vmpSTC: string;
  iscSTC: string;
  panelsPerString: string;
  parallelStrings: string;
  coldVoc: string;
  hotVmp: string;
  totalArrayCurrent: string;
  stringSafetyCheck: string;

  // Report Modal
  engineeringReport: string;
  printReport: string;
  close: string;
  dateGenerated: string;
  billOfMaterials: string;
  engineeringAssumptions: string;
  certifiedNotice: string;
}

export const translations: Record<SupportedLanguage, Translations> = {
  en: {
    appName: 'VoltPlan',
    tagline: 'Engineering-grade off-grid solar sizing.',
    // Header
    newProject: 'New Project',
    saveProject: 'Save Project',
    duplicateProject: 'Duplicate',
    renameProject: 'Rename',
    deleteProject: 'Delete',
    exportJson: 'Export JSON',
    importJson: 'Import JSON',
    report: 'System Report',
    darkMode: 'Dark Mode',
    lightMode: 'Light Mode',
    projectSaved: 'Project saved to browser storage',

    // Design Modes
    quickDesign: 'Quick Design',
    engineeringDesign: 'Engineering Design',
    professionalValidation: 'Professional Validation',

    // Overview
    systemOverview: 'SYSTEM OVERVIEW',
    totalLoad: 'TOTAL LOAD',
    solarArray: 'SOLAR ARRAY',
    batteryBank: 'BATTERY BANK',
    inverter: 'INVERTER',
    mppt: 'MPPT CONTROLLERS',
    autonomy: 'AUTONOMY',
    estimatedCost: 'ESTIMATED COST',
    day: 'day',
    days: 'days',
    panels: 'panels',
    batteries: 'batteries',

    // Status
    systemStatus: 'ENGINEERING STATUS',
    statusWellSized: 'Well Sized System',
    statusMarginal: 'Marginal Capacity',
    statusLowSolar: 'Low Solar Generation',
    statusBatterySmall: 'Battery Undersized',
    statusInverterUndersized: 'Inverter Undersized',
    statusOversized: 'High Reserve / Oversized',
    recommendations: 'Engineering Actions',

    // Appliance
    applianceEstimator: 'Appliance Load Estimator',
    quickAddPresets: 'Quick-Add Appliance Presets',
    addCustomAppliance: '+ Add Custom Load',
    applianceName: 'Appliance',
    quantity: 'Qty',
    watts: 'Watts',
    hoursPerDay: 'Total Hrs',
    daytimeHours: 'Day Hrs',
    nighttimeHours: 'Night Hrs',
    simultaneousFactor: 'Simul. %',
    surgeMultiplier: 'Surge ×',
    dailyWh: 'Daily Wh',
    status: 'Status',
    actions: 'Actions',
    enabled: 'Enabled',
    disabled: 'Disabled',
    delete: 'Delete',
    emptyAppliancesMsg: 'No appliances added yet. Click any preset above or add a custom load.',

    // Day vs Night
    dayVsNight: 'Daytime vs Nighttime Load Distribution',
    daytimeUsage: 'Daytime Usage',
    nighttimeUsage: 'Nighttime Usage',
    dayNightHelp: 'Daytime loads run directly off solar PV without cycling the battery. Nighttime loads are supplied entirely from battery energy storage.',

    // Solar
    solarResource: 'Solar Resource & Array Sizing',
    country: 'Country',
    city: 'City / Region',
    peakSunHours: 'Peak Sun Hours (PSH)',
    panelOrientation: 'Panel Orientation Efficiency',
    panelOrientationHelp: 'Accounts for azimuth angle and roof tilt deviation from true solar noon optimal tilt.',
    efficiency: 'Efficiency',
    cloudyDaysBuffer: 'Weather / Cloudy-Day Buffer',
    cloudyBufferHelp: 'Adds reserve energy storage capacity for consecutive days with heavy overcast or rain.',
    none: 'None (0 days)',
    cloudyDay1: '1 cloudy day',
    cloudyDays2: '2 cloudy days',
    cloudyDays3: '3 cloudy days',
    panelWattage: 'Solar Panel Wattage',
    reserveMargin: 'Solar Design Reserve Margin',
    dailySolarGen: 'Est. Daily Solar Generation',
    solarMargin: 'Solar Production Margin',

    // Battery
    batteryConfig: 'Battery Bank Configuration',
    chemistry: 'Battery Chemistry',
    systemVoltage: 'System DC Voltage',
    unitCapacity: 'Battery Ah Capacity',
    unitNominalEnergy: 'Unit Nominal Energy',
    depthOfDischarge: 'Max Depth of Discharge (DoD)',
    dodHelp: 'The percentage of battery capacity that can be safely discharged without accelerating chemical degradation.',
    backupDays: 'Backup / Autonomy Days',
    backupDaysDesc: 'Days the system can operate with little or no solar production.',
    usableCapacity: 'Usable Storage',
    nominalCapacity: 'Nominal Storage',
    safeReserveSoc: 'Minimum Safe SOC',

    // Inverter & MPPT
    powerConversion: 'Inverter & MPPT Power Conversion',
    continuousPower: 'Peak Simultaneous Load',
    peakSurgePower: 'Estimated Motor Surge',
    inverterHeadroom: 'Design Headroom',
    inverterHeadroomHelp: 'Safety margin applied above peak continuous load to prevent inverter thermal stress and nuisance trips.',
    recommendedInverter: 'Recommended Inverter Size',
    selectedInverter: 'Installed / Selected Inverter',
    mpptSizing: 'MPPT Charge Controller Sizing',
    mpptSafetyCurrent: 'NEC 125% Safe Charge Current',
    mpptUnitRating: 'MPPT Current Rating per Unit',

    // 24H Graph
    battery24hCycle: 'BATTERY LEVEL — 24 HOUR CYCLE',
    stateOfCharge: 'State of Charge (SOC)',
    solarGeneration: 'Solar PV Production',
    loadDemand: 'Load Consumption',
    safeDodThreshold: 'Safe DoD Limit (Min SOC)',
    dangerThreshold: 'Critical Cutoff Threshold',
    minSoc: 'Lowest SOC Reached',
    maxSoc: 'Peak SOC Reached',
    timeHour: 'Hour of Day',

    // Market Prices & Cost
    marketPrices: 'Market Equipment & Installation Pricing',
    currency: 'Currency',
    exchangeRate: 'Exchange Rate vs USD',
    costBreakdown: 'VIEW COST BREAKDOWN',
    equipmentSubtotal: 'Equipment Subtotal',
    installationSubtotal: 'Installation & Labor',
    logisticsSubtotal: 'Logistics & Duties',
    grandTotal: 'Grand Total Project Cost',
    item: 'Item Description',
    unitPrice: 'Unit Price',
    subtotal: 'Subtotal',

    // Advanced Settings
    advancedSettings: 'Advanced Engineering Settings',
    systemLosses: 'System Losses',
    cableLoss: 'DC & AC Cable Losses',
    tempDerating: 'Temperature Derating',
    pvDerating: 'Soiling & Mismatch Derating',
    batteryRoundtrip: 'Battery Round-trip Efficiency',
    annualDegradation: 'Annual PV Degradation',

    // String Design
    stringDesign: 'Advanced Panel String Electrical Matching',
    vocSTC: 'Panel Voc (STC)',
    vmpSTC: 'Panel Vmp (STC)',
    iscSTC: 'Panel Isc (STC)',
    panelsPerString: 'Panels in Series per String',
    parallelStrings: 'Parallel Strings',
    coldVoc: 'Cold Max Voc (-10°C)',
    hotVmp: 'Hot Min Vmp (+50°C)',
    totalArrayCurrent: 'Total Array Current',
    stringSafetyCheck: 'Electrical Safety Verification',

    // Report
    engineeringReport: 'Off-Grid Solar System Engineering Report',
    printReport: 'Print / Save as PDF',
    close: 'Close',
    dateGenerated: 'Date of Calculation',
    billOfMaterials: 'Bill of Materials & Equipment Sizing',
    engineeringAssumptions: 'Engineering Formulas & Design Assumptions',
    certifiedNotice: 'Calculated in accordance with IEEE 1013, NEC Article 690, and IEC 62124 standards for standalone photovoltaic systems.',
  },

  fr: {
    appName: 'VoltPlan',
    tagline: 'Dimensionnement solaire autonome de niveau ingénierie.',
    // Header
    newProject: 'Nouveau projet',
    saveProject: 'Enregistrer',
    duplicateProject: 'Dupliquer',
    renameProject: 'Renommer',
    deleteProject: 'Supprimer',
    exportJson: 'Exporter JSON',
    importJson: 'Importer JSON',
    report: 'Rapport technique',
    darkMode: 'Mode Sombre',
    lightMode: 'Mode Clair',
    projectSaved: 'Projet enregistré localement',

    // Design Modes
    quickDesign: 'Dimensionnement Rapide',
    engineeringDesign: 'Ingénierie Système',
    professionalValidation: 'Validation Professionnelle',

    // Overview
    systemOverview: 'VUE D’ENSEMBLE DU SYSTÈME',
    totalLoad: 'CONSOMMATION TOTALE',
    solarArray: 'CHAMP SOLAIRE',
    batteryBank: 'PARC DE BATTERIES',
    inverter: 'ONDULEUR',
    mppt: 'RÉGULATEUR MPPT',
    autonomy: 'AUTONOMIE',
    estimatedCost: 'COÛT ESTIMATIF',
    day: 'jour',
    days: 'jours',
    panels: 'panneaux',
    batteries: 'batteries',

    // Status
    systemStatus: 'STATUT INGÉNIERIE',
    statusWellSized: 'Système bien dimensionné',
    statusMarginal: 'Capacité limite / marginale',
    statusLowSolar: 'Production solaire insuffisante',
    statusBatterySmall: 'Parc batterie sous-dimensionné',
    statusInverterUndersized: 'Onduleur sous-dimensionné',
    statusOversized: 'Forte marge / Surdimensionné',
    recommendations: 'Actions techniques recommandées',

    // Appliance
    applianceEstimator: 'Estimateur de Charges & Équipements',
    quickAddPresets: 'Ajout rapide d’appareils prédéfinis',
    addCustomAppliance: '+ Ajouter un équipement',
    applianceName: 'Appareil',
    quantity: 'Qté',
    watts: 'Puissance (W)',
    hoursPerDay: 'Heures/j',
    daytimeHours: 'H. Jour',
    nighttimeHours: 'H. Nuit',
    simultaneousFactor: 'Simult. %',
    surgeMultiplier: 'Pointe ×',
    dailyWh: 'Wh/jour',
    status: 'État',
    actions: 'Actions',
    enabled: 'Actif',
    disabled: 'Inactif',
    delete: 'Supprimer',
    emptyAppliancesMsg: 'Aucun appareil ajouté. Cliquez sur un modèle ci-dessus ou ajoutez une charge personnalisée.',

    // Day vs Night
    dayVsNight: 'Répartition Jour vs Nuit',
    daytimeUsage: 'Consommation Jour',
    nighttimeUsage: 'Consommation Nuit',
    dayNightHelp: 'Les charges de jour sont alimentées directement par les panneaux solaires sans cycler la batterie. La nuit dépend exclusivement du stockage batterie.',

    // Solar
    solarResource: 'Ressource Solaire & Panneaux',
    country: 'Pays',
    city: 'Ville / Région',
    peakSunHours: 'Heures d’Ensoleillement Crête (HSP)',
    panelOrientation: 'Efficacité d’Orientation',
    panelOrientationHelp: 'Prend en compte l’azimut et l’inclinaison de toiture par rapport au plein sud/nord solaire optimal.',
    efficiency: 'Rendement',
    cloudyDaysBuffer: 'Réserve pour jours nuageux',
    cloudyBufferHelp: 'Augmente la capacité de stockage pour couvrir plusieurs jours consécutifs de mauvais temps ou pluie.',
    none: 'Aucun (0 jour)',
    cloudyDay1: '1 jour nuageux',
    cloudyDays2: '2 jours nuageux',
    cloudyDays3: '3 jours nuageux',
    panelWattage: 'Puissance d’un panneau',
    reserveMargin: 'Marge de sécurité solaire',
    dailySolarGen: 'Production solaire journalière',
    solarMargin: 'Marge de production',

    // Battery
    batteryConfig: 'Configuration du Parc de Batteries',
    chemistry: 'Technologie de batterie',
    systemVoltage: 'Tension DC du système',
    unitCapacity: 'Capacité unitaire (Ah)',
    unitNominalEnergy: 'Énergie unitaire nominale',
    depthOfDischarge: 'Profondeur de décharge max (DoD)',
    dodHelp: 'Pourcentage de la batterie pouvant être déchargé sans dégradation prématurée.',
    backupDays: 'Jours d’autonomie',
    backupDaysDesc: 'Jours pendant lesquels le système peut fonctionner sans apport solaire significatif.',
    usableCapacity: 'Capacité utile',
    nominalCapacity: 'Capacité nominale',
    safeReserveSoc: 'SOC minimal recommandé',

    // Inverter & MPPT
    powerConversion: 'Conversion Onduleur & MPPT',
    continuousPower: 'Puissance simultanée de crête',
    peakSurgePower: 'Pointe de démarrage moteur',
    inverterHeadroom: 'Marge de sécurité onduleur',
    inverterHeadroomHelp: 'Marge de sécurité appliquée pour éviter la surchauffe et les coupures thermiques de l’onduleur.',
    recommendedInverter: 'Taille d’onduleur recommandée',
    selectedInverter: 'Onduleur sélectionné',
    mpptSizing: 'Dimensionnement Régulateur MPPT',
    mpptSafetyCurrent: 'Courant de sécurité NEC (125%)',
    mpptUnitRating: 'Calibre unitaire du MPPT',

    // 24H Graph
    battery24hCycle: 'NIVEAU DE BATTERIE — CYCLE 24 HEURES',
    stateOfCharge: 'État de charge (SOC)',
    solarGeneration: 'Production Solaire',
    loadDemand: 'Consommation',
    safeDodThreshold: 'Seuil DoD sécurisé (SOC min)',
    dangerThreshold: 'Seuil critique de décharge',
    minSoc: 'SOC minimal atteint',
    maxSoc: 'SOC maximal atteint',
    timeHour: 'Heure de la journée',

    // Market Prices & Cost
    marketPrices: 'Tarifs Équipements & Main-d’œuvre',
    currency: 'Devise',
    exchangeRate: 'Taux de change vs USD',
    costBreakdown: 'VOIR LE DÉTAIL DES COÛTS',
    equipmentSubtotal: 'Sous-total Équipements',
    installationSubtotal: 'Installation & Câblage',
    logisticsSubtotal: 'Logistique & Douanes',
    grandTotal: 'Coût Total du Projet',
    item: 'Désignation de l’article',
    unitPrice: 'Prix unitaire',
    subtotal: 'Sous-total',

    // Advanced Settings
    advancedSettings: 'Paramètres Avancés d’Ingénierie',
    systemLosses: 'Pertes système globales',
    cableLoss: 'Pertes en ligne (câblage)',
    tempDerating: 'Déclassement thermique',
    pvDerating: 'Déclassement poussière/salissure',
    batteryRoundtrip: 'Rendement de cycle batterie',
    annualDegradation: 'Dégradation annuelle PV',

    // String Design
    stringDesign: 'Dimensionnement Électrique des Strings',
    vocSTC: 'Voc Panneau (STC)',
    vmpSTC: 'Vmp Panneau (STC)',
    iscSTC: 'Isc Panneau (STC)',
    panelsPerString: 'Panneaux en série par string',
    parallelStrings: 'Strings en parallèle',
    coldVoc: 'Voc grand froid (-10°C)',
    hotVmp: 'Vmp canicule (+50°C)',
    totalArrayCurrent: 'Courant total du champ',
    stringSafetyCheck: 'Vérification de sécurité électrique',

    // Report
    engineeringReport: 'Rapport d’Ingénierie Solaire Hors-Réseau',
    printReport: 'Imprimer / Enregistrer en PDF',
    close: 'Fermer',
    dateGenerated: 'Date de dimensionnement',
    billOfMaterials: 'Nomenclature des équipements',
    engineeringAssumptions: 'Formules & Hypothèses de dimensionnement',
    certifiedNotice: 'Calculs conformes aux normes IEEE 1013, NEC Article 690 et IEC 62124 pour systèmes photovoltaïques autonomes.',
  },
};
