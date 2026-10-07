export interface FormularyEntry {
  drugName: string;
  genericName: string;
  drugClass: string;
  tier: number;
  priorAuthRequired: true;
  coveredDiagnoses: Array<{ code: string; description: string }>;
  stepTherapyRequired: string;
  quantityLimit: string;
  ageLimit: string;
  renewalRequirements: string;
  notes: string;
}

const ENTRIES: FormularyEntry[] = [
  {
    drugName: 'Humira',
    genericName: 'adalimumab',
    drugClass: 'Anti-TNF biologic',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'M05.79', description: 'Rheumatoid arthritis with rheumatoid factor, multiple sites' },
      { code: 'K50.90', description: "Crohn's disease, unspecified, without complications" },
      { code: 'L40.0', description: 'Psoriasis vulgaris (plaque psoriasis)' },
      { code: 'M07.3', description: 'Psoriatic arthritis' },
    ],
    stepTherapyRequired:
      'Requires a documented trial of at least 90 days of a conventional DMARD (e.g., methotrexate, sulfasalazine) with inadequate response or intolerance; for plaque psoriasis, a topical therapy trial is acceptable in place of a DMARD trial.',
    quantityLimit: '2 pens per 28 days',
    ageLimit: '4 years and older',
    renewalRequirements: 'Reauthorization every 12 months with documented clinical response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Enbrel',
    genericName: 'etanercept',
    drugClass: 'Anti-TNF biologic',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'M05.79', description: 'Rheumatoid arthritis with rheumatoid factor, multiple sites' },
      { code: 'M07.3', description: 'Psoriatic arthritis' },
      { code: 'L40.0', description: 'Psoriasis vulgaris (plaque psoriasis)' },
      { code: 'M08.00', description: 'Juvenile idiopathic arthritis, unspecified site' },
    ],
    stepTherapyRequired:
      'Requires a documented trial of at least 90 days of a conventional DMARD (e.g., methotrexate, sulfasalazine) with inadequate response or intolerance; for plaque psoriasis, a topical therapy trial is acceptable in place of a DMARD trial.',
    quantityLimit: '4 syringes per 28 days',
    ageLimit: '2 years and older',
    renewalRequirements: 'Reauthorization every 12 months with documented clinical response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Stelara',
    genericName: 'ustekinumab',
    drugClass: 'IL-12/23 inhibitor',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'L40.0', description: 'Psoriasis vulgaris (plaque psoriasis)' },
      { code: 'M07.3', description: 'Psoriatic arthritis' },
      { code: 'K50.90', description: "Crohn's disease, unspecified, without complications" },
      { code: 'K51.90', description: 'Ulcerative colitis, unspecified, without complications' },
    ],
    stepTherapyRequired:
      'Requires a documented trial of at least 90 days of a TNF inhibitor (e.g., Humira, Enbrel) with inadequate response or intolerance before Stelara will be covered.',
    quantityLimit: 'Per weight-based induction dose, then 1 syringe every 8 weeks maintenance',
    ageLimit: '6 years and older (plaque psoriasis); 18 years and older (Crohn’s/UC)',
    renewalRequirements: 'Reauthorization every 12 months with documented clinical response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Skyrizi',
    genericName: 'risankizumab',
    drugClass: 'IL-23 inhibitor',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'L40.0', description: 'Psoriasis vulgaris (plaque psoriasis)' },
      { code: 'M07.3', description: 'Psoriatic arthritis' },
      { code: 'K50.90', description: "Crohn's disease, unspecified, without complications" },
    ],
    stepTherapyRequired:
      'Requires a documented trial of at least 90 days of a TNF inhibitor (e.g., Humira, Enbrel) with inadequate response or intolerance before Skyrizi will be covered.',
    quantityLimit: '1 pen every 12 weeks maintenance, after induction dosing',
    ageLimit: '18 years and older',
    renewalRequirements: 'Reauthorization every 12 months with documented clinical response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Cosentyx',
    genericName: 'secukinumab',
    drugClass: 'IL-17A inhibitor',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'L40.0', description: 'Psoriasis vulgaris (plaque psoriasis)' },
      { code: 'M07.3', description: 'Psoriatic arthritis' },
      { code: 'M45.9', description: 'Ankylosing spondylitis of unspecified sites in spine' },
    ],
    stepTherapyRequired:
      'For plaque psoriasis/psoriatic arthritis: requires a documented trial of at least 90 days of a conventional DMARD or topical therapy with inadequate response. For ankylosing spondylitis: requires a documented NSAID trial of at least 4 weeks with inadequate response.',
    quantityLimit: '2 pens per 28 days maintenance, after loading dose',
    ageLimit: '18 years and older',
    renewalRequirements: 'Reauthorization every 12 months with documented clinical response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Dupixent',
    genericName: 'dupilumab',
    drugClass: 'IL-4/IL-13 inhibitor',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'L20.9', description: 'Atopic dermatitis, unspecified' },
      { code: 'J45.909', description: 'Unspecified asthma, uncomplicated (type 2 phenotype)' },
      { code: 'J30.89', description: 'Other allergic rhinitis (chronic rhinosinusitis with nasal polyps)' },
    ],
    stepTherapyRequired:
      'For atopic dermatitis: requires a documented topical corticosteroid trial of at least 28 days with inadequate response or intolerance. For asthma: requires a documented inhaled corticosteroid/LABA trial with inadequate control.',
    quantityLimit: '2 pens per 28 days',
    ageLimit: '6 months and older',
    renewalRequirements: 'Reauthorization every 12 months with documented clinical response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Xarelto',
    genericName: 'rivaroxaban',
    drugClass: 'Factor Xa inhibitor (anticoagulant)',
    tier: 3,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'I48.91', description: 'Unspecified atrial fibrillation' },
      { code: 'I82.409', description: 'Acute embolism and thrombosis of unspecified deep veins of unspecified lower extremity' },
      { code: 'Z95.811', description: 'Presence of other cardiac implants and grafts (post-orthopedic VTE prophylaxis context)' },
    ],
    stepTherapyRequired:
      'Requires a documented warfarin trial of at least 30 days with inadequate INR control or documented intolerance, EXCEPT when prescribed for VTE prophylaxis following orthopedic surgery (e.g., hip/knee replacement), which is exempt from the warfarin step-therapy requirement.',
    quantityLimit: '30 tablets per 30 days',
    ageLimit: '18 years and older',
    renewalRequirements: 'Reauthorization every 12 months.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Eliquis',
    genericName: 'apixaban',
    drugClass: 'Factor Xa inhibitor (anticoagulant)',
    tier: 3,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'I48.91', description: 'Unspecified atrial fibrillation' },
      { code: 'I82.409', description: 'Acute embolism and thrombosis of unspecified deep veins of unspecified lower extremity' },
      { code: 'Z95.811', description: 'Presence of other cardiac implants and grafts (post-orthopedic VTE prophylaxis context)' },
    ],
    stepTherapyRequired:
      'Requires a documented warfarin trial of at least 30 days with inadequate INR control or documented intolerance, EXCEPT when prescribed for VTE prophylaxis following orthopedic surgery (e.g., hip/knee replacement), which is exempt from the warfarin step-therapy requirement.',
    quantityLimit: '60 tablets per 30 days',
    ageLimit: '18 years and older',
    renewalRequirements: 'Reauthorization every 12 months.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Ozempic',
    genericName: 'semaglutide',
    drugClass: 'GLP-1 receptor agonist',
    tier: 4,
    priorAuthRequired: true,
    coveredDiagnoses: [{ code: 'E11.9', description: 'Type 2 diabetes mellitus without complications' }],
    stepTherapyRequired:
      'Requires a documented metformin trial of at least 90 days AND a documented A1c of 7.0% or higher while on metformin.',
    quantityLimit: '1 pen per 28 days',
    ageLimit: '18 years and older',
    renewalRequirements: 'Reauthorization every 12 months with documented A1c improvement.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Wegovy',
    genericName: 'semaglutide',
    drugClass: 'GLP-1 receptor agonist (weight management)',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [{ code: 'E66.01', description: 'Morbid (severe) obesity due to excess calories (BMI ≥ 30, or ≥ 27 with a weight-related comorbidity)' }],
    stepTherapyRequired:
      'Requires a documented structured diet and exercise program of at least 6 months, with the qualifying BMI threshold met.',
    quantityLimit: '1 pen per 28 days',
    ageLimit: '12 years and older',
    renewalRequirements: 'Reauthorization every 6 months with documented weight loss of at least 5% from baseline.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Repatha',
    genericName: 'evolocumab',
    drugClass: 'PCSK9 inhibitor',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [
      { code: 'E78.01', description: 'Familial hypercholesterolemia' },
      { code: 'I25.10', description: 'Atherosclerotic heart disease of native coronary artery without angina pectoris' },
    ],
    stepTherapyRequired:
      'Requires a documented trial of at least 90 days of a maximally tolerated statin with inadequate LDL response, or documented statin intolerance.',
    quantityLimit: '2 pens per 28 days',
    ageLimit: '18 years and older',
    renewalRequirements: 'Reauthorization every 12 months with documented LDL response.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
  {
    drugName: 'Trikafta',
    genericName: 'elexacaftor/tezacaftor/ivacaftor',
    drugClass: 'CFTR modulator',
    tier: 5,
    priorAuthRequired: true,
    coveredDiagnoses: [{ code: 'E84.9', description: 'Cystic fibrosis, unspecified' }],
    stepTherapyRequired:
      'No step therapy — instead requires confirmed CFTR genetic testing on file showing at least one F508del mutation or another Trikafta-responsive mutation.',
    quantityLimit: '1 carton (56 tablets) per 28 days',
    ageLimit: '6 years and older',
    renewalRequirements: 'Reauthorization every 12 months with continued genetic confirmation on file.',
    notes: 'Illustrative example only — not an actual PostCare Plus or real payer policy excerpt.',
  },
];

export const FORMULARY: Record<string, FormularyEntry> = Object.fromEntries(
  ENTRIES.map((entry) => [entry.drugName.toLowerCase(), entry])
);

export function lookupFormularyEntry(drug: string): FormularyEntry | null {
  return FORMULARY[drug.trim().toLowerCase()] ?? null;
}
