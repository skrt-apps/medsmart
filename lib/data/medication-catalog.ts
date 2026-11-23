import { PDF_DRUG_ENTRIES } from './pdf-drug-list';

export type MedicalSpeciality =
  | 'Cardiology'
  | 'Endocrinology'
  | 'Infectious Disease'
  | 'Pulmonology'
  | 'Neurology & Psychiatry'
  | 'Gastroenterology'
  | 'Pain & Rheumatology'
  | 'Oncology & Hematology'
  | 'Nutrition & Supplements'
  | 'Dermatology & Topicals'
  | 'Allergy & Ophthalmic'
  | 'Critical Care & General';

export interface PdfFormulation {
  sl_no: number;
  label: string;
  form: string;
  strength: string;
  route: string;
}

export interface CatalogMedication {
  id: string;
  generic_name: string;
  aliases: string[];
  therapeutic_category: string;
  speciality: MedicalSpeciality;
  brands_us: string[];
  brands_in: string[];
  pdf_formulations: PdfFormulation[];
  common_dosages: string[];
  default_route: string;
  registries: string[];
}

export interface MedicationMatch {
  generic_name: string;
  matched_label: string;
  match_kind: 'exact_generic' | 'brand_us' | 'brand_in' | 'formulation' | 'fuzzy';
  brands_us: string[];
  brands_in: string[];
  pdf_formulations: PdfFormulation[];
  common_dosages: string[];
  default_route: string;
  therapeutic_category: string;
  speciality: MedicalSpeciality;
  category: string;
  registries: string[];
  score: number;
}

interface BrandOverlay {
  generic_name: string;
  aliases?: string[];
  brands_us: string[];
  brands_in: string[];
  common_dosages: string[];
  default_route: string;
  therapeutic_category: string;
  registries: string[];
}

const BRAND_OVERLAYS: readonly BrandOverlay[] = [
  {
    generic_name: 'Metformin',
    aliases: ['Metformin Tab'],
    brands_us: ['Glucophage', 'Glumetza', 'Fortamet', 'Riomet'],
    brands_in: ['Glycomet', 'Obimet', 'Gluformin', 'Cetapin'],
    common_dosages: ['250 mg', '500 mg', '850 mg', '1000 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypoglycaemics',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Glimepiride',
    brands_us: ['Amaryl'],
    brands_in: ['Amaryl', 'Glimer', 'Zoryl', 'Glimy'],
    common_dosages: ['1 mg', '2 mg', '4 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypoglycaemics',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Sitagliptin',
    brands_us: ['Januvia'],
    brands_in: ['Januvia', 'Istavel', 'Zita'],
    common_dosages: ['25 mg', '50 mg', '100 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypoglycaemics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Empagliflozin',
    brands_us: ['Jardiance'],
    brands_in: ['Jardiance', 'Gibtulio', 'Empaone'],
    common_dosages: ['10 mg', '25 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypoglycaemics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Gliclazide',
    brands_us: ['Diamicron'],
    brands_in: ['Diamicron', 'Glizid', 'Reclide'],
    common_dosages: ['40 mg', '80 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypoglycaemics',
    registries: ['IN-NLEM'],
  },
  {
    generic_name: 'Pioglitazone',
    brands_us: ['Actos'],
    brands_in: ['Pioglit', 'Pioz', 'Piozone'],
    common_dosages: ['15 mg', '30 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypoglycaemics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Insulin Glargine',
    brands_us: ['Lantus', 'Basaglar', 'Toujeo'],
    brands_in: ['Lantus', 'Basalog', 'Glaritus'],
    common_dosages: ['100 units/ml'],
    default_route: 'subcutaneous',
    therapeutic_category: 'Hormones and Antihormones',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Human Insulin',
    aliases: ['Human Insulin plain', 'Human Insulin NPH', 'Human Insulin Lente', 'Human Insulin analogues'],
    brands_us: ['Humulin R', 'Humulin N', 'Novolin'],
    brands_in: ['Human Actrapid', 'Human Mixtard', 'Insuman'],
    common_dosages: ['100 IU/ml', '40 IU/ml'],
    default_route: 'subcutaneous',
    therapeutic_category: 'Hormones and Antihormones',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Lisinopril',
    brands_us: ['Prinivil', 'Zestril', 'Qbrelis'],
    brands_in: ['Listril', 'Lipril', 'Lisinace'],
    common_dosages: ['5 mg', '10 mg', '20 mg', '40 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Enalapril',
    brands_us: ['Vasotec', 'Epaned'],
    brands_in: ['Envas', 'Enam', 'Nuril'],
    common_dosages: ['2.5 mg', '5 mg', '10 mg', '20 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Ramipril',
    brands_us: ['Altace'],
    brands_in: ['Cardace', 'Ramistar', 'Hopace'],
    common_dosages: ['1.25 mg', '2.5 mg', '5 mg', '10 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Telmisartan',
    brands_us: ['Micardis'],
    brands_in: ['Telma', 'Telmikind', 'Tazloc', 'Cresar'],
    common_dosages: ['20 mg', '40 mg', '80 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Losartan',
    brands_us: ['Cozaar'],
    brands_in: ['Losar', 'Repace', 'Alsartan', 'Tozaar'],
    common_dosages: ['25 mg', '50 mg', '100 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Amlodipine',
    brands_us: ['Norvasc', 'Katerzia'],
    brands_in: ['Amlong', 'Amlopin', 'Stamlo', 'Amlopres'],
    common_dosages: ['2.5 mg', '5 mg', '10 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Metoprolol',
    brands_us: ['Lopressor', 'Toprol XL'],
    brands_in: ['Betaloc', 'Metolar', 'Seloken XL', 'Revelol'],
    common_dosages: ['25 mg', '50 mg', '100 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Atenolol',
    brands_us: ['Tenormin'],
    brands_in: ['Aten', 'Betacard', 'Tenormin'],
    common_dosages: ['25 mg', '50 mg', '100 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Nifedipine',
    brands_us: ['Procardia', 'Adalat CC'],
    brands_in: ['Nicardia', 'Calcigard', 'Depin'],
    common_dosages: ['5 mg', '10 mg', '20 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Labetalol',
    brands_us: ['Trandate'],
    brands_in: ['Lobet', 'Labet', 'Labebet'],
    common_dosages: ['20 mg/4ml', '100 mg'],
    default_route: 'intravenous',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Furosemide',
    aliases: ['Frusemide'],
    brands_us: ['Lasix'],
    brands_in: ['Lasix', 'Frusenex'],
    common_dosages: ['20 mg', '40 mg', '10 mg/5ml'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Torsemide',
    brands_us: ['Demadex', 'Soaanz'],
    brands_in: ['Dytor', 'Tide', 'Torsinex'],
    common_dosages: ['10 mg', '20 mg', '100 mg'],
    default_route: 'oral',
    therapeutic_category: 'Drugs in Heart Failure',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Digoxin',
    brands_us: ['Lanoxin'],
    brands_in: ['Lanoxin', 'Dixina'],
    common_dosages: ['50 mcg/ml', '40 mg', '0.25 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Amiodarone',
    brands_us: ['Cordarone', 'Pacerone'],
    brands_in: ['Cordarone', 'Tachyra', 'Ritebeat'],
    common_dosages: ['100 mg', '200 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiarrhythmic',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Hydrochlorothiazide',
    brands_us: ['Microzide'],
    brands_in: ['Aquazide', 'Hydrazide'],
    common_dosages: ['12.5 mg', '25 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antihypertensive',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Atorvastatin',
    brands_us: ['Lipitor', 'Atorvaliq'],
    brands_in: ['Atorva', 'Tonact', 'Storvas', 'Lipikind'],
    common_dosages: ['5 mg', '10 mg', '20 mg', '40 mg', '80 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypolipidemic',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Rosuvastatin',
    brands_us: ['Crestor', 'Ezallor'],
    brands_in: ['Rosuvas', 'Rozavel', 'Crestor', 'Novastat'],
    common_dosages: ['5 mg', '10 mg', '20 mg', '40 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hypolipidemic',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Aspirin',
    aliases: ['Acetyl salicylic acid', 'Acetylsalicylic acid'],
    brands_us: ['Bayer Aspirin', 'Ecotrin'],
    brands_in: ['Ecosprin', 'Loprin', 'Disprin'],
    common_dosages: ['75 mg', '81 mg', '150 mg', '325 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiplatelet',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Clopidogrel',
    brands_us: ['Plavix'],
    brands_in: ['Clopilet', 'Plavix', 'Deplatt', 'Clopivas'],
    common_dosages: ['75 mg', '300 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiplatelet',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Warfarin',
    aliases: ['Warfarin sodium'],
    brands_us: ['Coumadin', 'Jantoven'],
    brands_in: ['Warf', 'Uniwarfin'],
    common_dosages: ['1 mg', '2 mg', '5 mg'],
    default_route: 'oral',
    therapeutic_category: 'Drugs Acting on Blood',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Apixaban',
    brands_us: ['Eliquis'],
    brands_in: ['Eliquis', 'Apigat'],
    common_dosages: ['2.5 mg', '5 mg'],
    default_route: 'oral',
    therapeutic_category: 'Drugs Acting on Blood',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Levothyroxine',
    aliases: ['L thyroxine', 'Thyroxin', 'L-Thyroxine', 'Eltroxin'],
    brands_us: ['Synthroid', 'Levoxyl', 'Tirosint'],
    brands_in: ['Thyronorm', 'Eltroxin', 'Thyrox'],
    common_dosages: ['25 mcg', '50 mcg', '100 mcg', '200 mcg'],
    default_route: 'oral',
    therapeutic_category: 'Hormones and Antihormones',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Omeprazole',
    brands_us: ['Prilosec'],
    brands_in: ['Omez', 'Ocid', 'Lomac'],
    common_dosages: ['20 mg', '40 mg'],
    default_route: 'oral',
    therapeutic_category: 'Anti-Peptic Ulcer',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Pantoprazole',
    brands_us: ['Protonix'],
    brands_in: ['Pan', 'Pan-40', 'Pantocid', 'Pantop'],
    common_dosages: ['20 mg', '40 mg'],
    default_route: 'oral',
    therapeutic_category: 'Anti-Peptic Ulcer',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Rabeprazole',
    brands_us: ['Aciphex'],
    brands_in: ['Razo', 'Rablet', 'Veloz'],
    common_dosages: ['20 mg'],
    default_route: 'oral',
    therapeutic_category: 'Anti-Peptic Ulcer',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Lansoprazole',
    aliases: ['Lanzoprazole'],
    brands_us: ['Prevacid'],
    brands_in: ['Lanzol', 'Junior Lanzol', 'Lan-15'],
    common_dosages: ['4 mg', '15 mg', '30 mg'],
    default_route: 'oral',
    therapeutic_category: 'Anti-Peptic Ulcer',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Ranitidine',
    brands_us: ['Zantac'],
    brands_in: ['Rantac', 'Aciloc', 'Zinetac'],
    common_dosages: ['50 mg/ml', '150 mg/ml'],
    default_route: 'intravenous',
    therapeutic_category: 'Anti-Peptic Ulcer',
    registries: ['IN-NLEM'],
  },
  {
    generic_name: 'Domperidone',
    brands_us: ['Motilium'],
    brands_in: ['Domstal', 'Vomistop'],
    common_dosages: ['10 mg', '1 mg/ml'],
    default_route: 'oral',
    therapeutic_category: 'Antiemetic',
    registries: ['IN-NLEM'],
  },
  {
    generic_name: 'Ondansetron',
    brands_us: ['Zofran'],
    brands_in: ['Emeset', 'Ondem', 'Vomikind'],
    common_dosages: ['4 mg', '8 mg', '2 mg/ml', '2 mg/5ml'],
    default_route: 'oral',
    therapeutic_category: 'Antiemetic',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Metoclopramide',
    brands_us: ['Reglan'],
    brands_in: ['Perinorm', 'Reggi'],
    common_dosages: ['5 mg', '10 mg/ml'],
    default_route: 'oral',
    therapeutic_category: 'Antivertigo',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Paracetamol / Acetaminophen',
    aliases: ['Paracetamol', 'Acetaminophen', 'PCM'],
    brands_us: ['Tylenol', 'Panadol'],
    brands_in: ['Dolo 650', 'Dolo', 'Crocin', 'Calpol', 'P-650'],
    common_dosages: ['100 mg', '500 mg', '650 mg', '1000 mg'],
    default_route: 'oral',
    therapeutic_category: 'NSAIDs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Ibuprofen',
    brands_us: ['Advil', 'Motrin'],
    brands_in: ['Brufen', 'Ibugesic'],
    common_dosages: ['200 mg', '400 mg', '600 mg'],
    default_route: 'oral',
    therapeutic_category: 'NSAIDs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Diclofenac',
    aliases: ['Diclofenac sodium', 'Diclofenac potassium'],
    brands_us: ['Voltaren', 'Cataflam'],
    brands_in: ['Voveran', 'Dynapar', 'Reactin'],
    common_dosages: ['50 mg', '75 mg', '100 mg', '1%'],
    default_route: 'oral',
    therapeutic_category: 'NSAIDs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Aceclofenac',
    brands_us: ['Airtal'],
    brands_in: ['Zerodol', 'Hifenac', 'Aceclo'],
    common_dosages: ['100 mg', 'Gel'],
    default_route: 'topical',
    therapeutic_category: 'NSAIDs',
    registries: ['IN-CDSCO'],
  },
  {
    generic_name: 'Etoricoxib',
    brands_us: ['Arcoxia'],
    brands_in: ['Nucoxia', 'Etoshine', 'Etorica'],
    common_dosages: ['60 mg', '90 mg', '120 mg'],
    default_route: 'oral',
    therapeutic_category: 'NSAIDs',
    registries: ['IN-CDSCO'],
  },
  {
    generic_name: 'Mefenamic Acid',
    aliases: ['Mefenamic acid'],
    brands_us: ['Ponstel'],
    brands_in: ['Meftal', 'Meftal-Spas', 'Ponstan'],
    common_dosages: ['100 mg/5ml', '250 mg', '500 mg'],
    default_route: 'oral',
    therapeutic_category: 'NSAIDs',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Tramadol',
    brands_us: ['Ultram', 'ConZip'],
    brands_in: ['Tramzac', 'Domadol', 'Contramal'],
    common_dosages: ['50 mg', '100 mg/ml'],
    default_route: 'oral',
    therapeutic_category: 'Opioid Analgesics',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Allopurinol',
    brands_us: ['Zyloprim'],
    brands_in: ['Zyloric', 'Ciploric'],
    common_dosages: ['100 mg', '300 mg'],
    default_route: 'oral',
    therapeutic_category: 'Drugs for Gout',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Febuxostat',
    brands_us: ['Uloric'],
    brands_in: ['Febustat', 'Fabulas', 'Zurig'],
    common_dosages: ['40 mg', '80 mg'],
    default_route: 'oral',
    therapeutic_category: 'Drugs for Gout',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Methotrexate',
    brands_us: ['Trexall', 'Rheumatrex', 'Otrexup'],
    brands_in: ['Folitrax', 'Biotrexate', 'Mexate'],
    common_dosages: ['5 mg', '7.5 mg', '10 mg', '50 mg/2ml'],
    default_route: 'oral',
    therapeutic_category: 'DMARDs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Hydroxychloroquine',
    aliases: ['Hydroxy chloroquine'],
    brands_us: ['Plaquenil'],
    brands_in: ['HCQS', 'Zy-Q', 'Oxychloroquine'],
    common_dosages: ['100 mg', '200 mg', '400 mg'],
    default_route: 'oral',
    therapeutic_category: 'DMARDs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Amoxicillin',
    aliases: ['Amoxycillin'],
    brands_us: ['Amoxil', 'Moxatag'],
    brands_in: ['Mox', 'Novamox', 'Almox'],
    common_dosages: ['250 mg', '500 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Amoxicillin + Clavulanic Acid',
    aliases: ['Amoxycillin + Clavulanic acid', 'Co-amoxiclav'],
    brands_us: ['Augmentin'],
    brands_in: ['Augmentin', 'Augmentin 625 Duo', 'Moxikind-CV', 'Clavam'],
    common_dosages: ['228.5 mg', '457 mg', '625 mg', '1000 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Azithromycin',
    brands_us: ['Zithromax', 'Z-Pak'],
    brands_in: ['Azithral', 'Azee', 'Zady', 'Aziwok'],
    common_dosages: ['200 mg/5ml', '250 mg', '500 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Ciprofloxacin',
    brands_us: ['Cipro'],
    brands_in: ['Ciplox', 'Cifran'],
    common_dosages: ['250 mg', '500 mg', '1 g'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Cefixime',
    brands_us: ['Suprax'],
    brands_in: ['Taxim-O', 'Zifi', 'Mahacef'],
    common_dosages: ['50 mg/5ml', '100 mg', '200 mg', '250 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Cefuroxime',
    brands_us: ['Ceftin', 'Zinacef'],
    brands_in: ['Ceftum', 'Zocef', 'Altacef'],
    common_dosages: ['125 mg/5ml', '250 mg', '500 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Doxycycline',
    brands_us: ['Vibramycin', 'Doryx'],
    brands_in: ['Doxt-SL', 'Doxy-1'],
    common_dosages: ['100 mg', '200 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antibacterials',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Fluconazole',
    brands_us: ['Diflucan'],
    brands_in: ['Forcan', 'Zocon', 'Flucos'],
    common_dosages: ['50 mg', '100 mg', '150 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antifungal',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Acyclovir',
    brands_us: ['Zovirax'],
    brands_in: ['Acivir', 'Zovirax', 'Ocuvir'],
    common_dosages: ['200 mg', '400 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiviral Drugs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Cetirizine',
    brands_us: ['Zyrtec'],
    brands_in: ['Cetzine', 'Okacet', 'Alerid', 'Zyrtec'],
    common_dosages: ['5 mg', '10 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiallergics',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Levocetirizine',
    brands_us: ['Xyzal'],
    brands_in: ['Levocet', 'Xyzal', '1-AL', 'Vozet'],
    common_dosages: ['5 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiallergics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Loratadine',
    brands_us: ['Claritin'],
    brands_in: ['Lorfast', 'Lormeg', 'Alaspan'],
    common_dosages: ['5 mg', '10 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiallergics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Montelukast',
    aliases: ['Monteleukast'],
    brands_us: ['Singulair'],
    brands_in: ['Montair', 'Montek', 'Telekast'],
    common_dosages: ['4 mg', '5 mg', '10 mg'],
    default_route: 'oral',
    therapeutic_category: 'Respiratory Drugs',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Salbutamol / Albuterol',
    aliases: ['Salbutamol', 'Albuterol'],
    brands_us: ['Ventolin', 'ProAir', 'Proventil'],
    brands_in: ['Asthalin', 'Ventorlin'],
    common_dosages: ['2 mg', '2 mg/5ml', '100 mcg'],
    default_route: 'inhaled',
    therapeutic_category: 'Respiratory Drugs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Budesonide',
    brands_us: ['Pulmicort', 'Symbicort'],
    brands_in: ['Budecort', 'Foracort'],
    common_dosages: ['50 mcg', '100 mcg', '200 mcg', '1 mg'],
    default_route: 'inhaled',
    therapeutic_category: 'Respiratory Drugs',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Prednisolone',
    aliases: ['Wysolone'],
    brands_us: ['Orapred', 'Prelone'],
    brands_in: ['Wysolone', 'Omnacortil'],
    common_dosages: ['5 mg', '10 mg', '20 mg/ml'],
    default_route: 'oral',
    therapeutic_category: 'Hormones and Antihormones',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Methylprednisolone',
    aliases: ['Methyl prednisolone'],
    brands_us: ['Medrol', 'Solu-Medrol'],
    brands_in: ['Medrol', 'Solu-Medrol', 'Predmet'],
    common_dosages: ['4 mg', '16 mg', '125 mg'],
    default_route: 'oral',
    therapeutic_category: 'Hormones and Antihormones',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Gabapentin',
    brands_us: ['Neurontin', 'Gralise'],
    brands_in: ['Gabantin', 'Gabapin'],
    common_dosages: ['100 mg', '300 mg', '400 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiepileptics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Levetiracetam',
    brands_us: ['Keppra'],
    brands_in: ['Levexa', 'Levipil', 'Torleva'],
    common_dosages: ['250 mg', '500 mg/2ml'],
    default_route: 'oral',
    therapeutic_category: 'Antiepileptics',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Pregabalin',
    brands_us: ['Lyrica'],
    brands_in: ['Pregalin', 'Lyrica', 'Maxgalin'],
    common_dosages: ['75 mg', '150 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antiepileptics',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Sertraline',
    brands_us: ['Zoloft'],
    brands_in: ['Serlift', 'Serta', 'Daxid'],
    common_dosages: ['25 mg', '50 mg', '100 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antidepressants & CNS',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Escitalopram',
    brands_us: ['Lexapro'],
    brands_in: ['Nexito', 'Stalopam', 'Feliz-S'],
    common_dosages: ['5 mg', '10 mg', '20 mg'],
    default_route: 'oral',
    therapeutic_category: 'Antidepressants & CNS',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Alprazolam',
    brands_us: ['Xanax'],
    brands_in: ['Alprax', 'Restyl', 'Trika'],
    common_dosages: ['0.25 mg', '0.5 mg', '1 mg'],
    default_route: 'oral',
    therapeutic_category: 'Preanaesthetic Medications',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Cholecalciferol (Vitamin D3)',
    aliases: ['Cholecalciferol', 'Vitamin D3', 'Vitamin D', 'Calcirol', 'Calcerol'],
    brands_us: ['Drisdol', 'Vitamin D3'],
    brands_in: ['Uprise-D3', 'D-Rise', 'Calcirol', 'Tayo 60K'],
    common_dosages: ['1000 units', '2000 units', '60000 IU'],
    default_route: 'oral',
    therapeutic_category: 'Vitamins & Supplements',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
  {
    generic_name: 'Tiotropium',
    aliases: ['Thiotropium'],
    brands_us: ['Spiriva'],
    brands_in: ['Tiova', 'Tiate'],
    common_dosages: ['9 mcg', '18 mcg'],
    default_route: 'inhaled',
    therapeutic_category: 'Respiratory Drugs',
    registries: ['US-RxNorm', 'IN-CDSCO'],
  },
  {
    generic_name: 'Clotrimazole',
    brands_us: ['Lotrimin', 'Mycelex'],
    brands_in: ['Candid', 'Clocip', 'Surfaze'],
    common_dosages: ['1%', '2%', '100 mg', '500 mg'],
    default_route: 'topical',
    therapeutic_category: 'Topical Medicines',
    registries: ['US-RxNorm', 'IN-NLEM'],
  },
];

function mapCategoryToSpeciality(category: string): MedicalSpeciality {
  const c = category.toLowerCase();
  if (
    c.includes('hypertens') ||
    c.includes('anginal') ||
    c.includes('platelet') ||
    c.includes('arrhythm') ||
    c.includes('heart failure') ||
    c.includes('lipid') ||
    c.includes('osmotic diuretic') ||
    c.includes('acting on blood') ||
    c.includes('haemorrhoidal')
  ) {
    return 'Cardiology';
  }
  if (
    c.includes('hypoglycaem') ||
    c.includes('hormone') ||
    c.includes('oxytocic') ||
    c.includes('progest') ||
    c.includes('prostaglandin') ||
    c.includes('contraceptive')
  ) {
    return 'Endocrinology';
  }
  if (
    c.includes('antibact') ||
    c.includes('infective') ||
    c.includes('anti-tb') ||
    c.includes('fungal') ||
    c.includes('viral') ||
    c.includes('malarial') ||
    c.includes('helminth') ||
    c.includes('filarial') ||
    c.includes('vaccine')
  ) {
    return 'Infectious Disease';
  }
  if (c.includes('respiratory') || c.includes('broncho')) {
    return 'Pulmonology';
  }
  if (
    c.includes('epilep') ||
    c.includes('parkinson') ||
    c.includes('migraine') ||
    c.includes('antidepressant') ||
    c.includes('muscle relaxant')
  ) {
    return 'Neurology & Psychiatry';
  }
  if (
    c.includes('peptic') ||
    c.includes('ulcer') ||
    c.includes('emetic') ||
    c.includes('vertigo') ||
    c.includes('spasmodic') ||
    c.includes('laxative') ||
    c.includes('diarrhoeal')
  ) {
    return 'Gastroenterology';
  }
  if (
    c.includes('nsaid') ||
    c.includes('opioid') ||
    c.includes('gout') ||
    c.includes('dmard') ||
    c.includes('anaesthetic')
  ) {
    return 'Pain & Rheumatology';
  }
  if (
    c.includes('cancer') ||
    c.includes('immuno') ||
    c.includes('monoclonal') ||
    c.includes('cytokine') ||
    c.includes('sickling') ||
    c.includes('anaemic') ||
    c.includes('blood product') ||
    c.includes('iron chelator')
  ) {
    return 'Oncology & Hematology';
  }
  if (c.includes('vitamin') || c.includes('supplement')) {
    return 'Nutrition & Supplements';
  }
  if (c.includes('topical')) {
    return 'Dermatology & Topicals';
  }
  if (c.includes('allergic') || c.includes('ophthalmic') || c.includes('ear drops')) {
    return 'Allergy & Ophthalmic';
  }
  return 'Critical Care & General';
}

function detectFormAndRoute(label: string): { form: string; route: string; strength: string } {
  const lower = label.toLowerCase();
  let form = 'Formulation';
  let route = 'oral';

  if (/\b(inj|injection|infusion|amp|iv)\b/.test(lower)) {
    form = 'Injection';
    route = 'intravenous / IM';
  } else if (/\b(mdi|dpi|rotacap|rotahaler|inhaler|respules|nebulis|nebuliser|surfactant|powder puff)\b/.test(lower)) {
    form = 'Inhaler / Nebuliser';
    route = 'inhaled';
  } else if (/\bnasal spray|nasal drops\b/.test(lower)) {
    form = 'Nasal Spray';
    route = 'nasal';
  } else if (/\beye drops\b/.test(lower)) {
    form = 'Eye Drops';
    route = 'ophthalmic';
  } else if (/\bear drops\b/.test(lower)) {
    form = 'Ear Drops';
    route = 'otic';
  } else if (/\bvaginal\b/.test(lower)) {
    form = 'Vaginal Tablet';
    route = 'vaginal';
  } else if (/\bsuppository|enema\b/.test(lower)) {
    form = 'Suppository / Rectal';
    route = 'rectal';
  } else if (/\b(ointment|cream|gel|paste|emollients|vaseline|spray)\b/.test(lower)) {
    form = 'Topical / Spray';
    route = 'topical';
  } else if (/\bpatch\b/.test(lower)) {
    form = 'Transdermal Patch';
    route = 'transdermal';
  } else if (/\b(syr|syrup|elixir|suspension|sachet|drops|oral rinse|solution)\b/.test(lower)) {
    form = 'Liquid / Oral';
    route = 'oral';
  } else if (/\b(cap|capsule|capsules)\b/.test(lower)) {
    form = 'Capsule';
    route = 'oral';
  } else if (/\b(tab|tablet|tablets|pill|dt)\b/.test(lower)) {
    form = 'Tablet';
    route = 'oral';
  }

  const strengthMatch = label.match(
    /(\d+(?:\.\d+)?(?:\s*[,/+-]\s*\d+(?:\.\d+)?)*\s*(?:mg\/ml|mg\/5\s*ml|mg\/2\s*ml|mg\/4\s*ml|mg\/100\s*ml|mcg\/ml|mcg\/puff|mg|mcg|gm|g|iu|units\/ml|ml|%|lakh))/i
  );
  const strength = strengthMatch ? strengthMatch[1].replace(/\s+/g, ' ').trim() : '';

  return { form, route, strength };
}

function extractBaseGenericFromPdfLabel(label: string): string {
  const l = label.trim();
  const lower = l.toLowerCase();

  if (lower.startsWith('paracetamol')) return 'Paracetamol / Acetaminophen';
  if (lower.startsWith('amoxycillin + clavulanic')) return 'Amoxicillin + Clavulanic Acid';
  if (lower.startsWith('amoxycillin')) return 'Amoxicillin';
  if (lower.startsWith('acetyl salicylic acid')) return 'Aspirin';
  if (lower.startsWith('l thyroxine') || lower.startsWith('levothyroxine')) return 'Levothyroxine';
  if (lower.startsWith('frusemide')) return 'Furosemide';
  if (lower.startsWith('salbutamol + theophylline')) return 'Salbutamol + Theophylline';
  if (lower === 'salbutamol' || /^salbutamol\s+(tab|rotacaps|inj|respules|nebulis|respiratory)/i.test(l) || /^albuterol\b/i.test(l)) {
    return 'Salbutamol / Albuterol';
  }
  if (lower.startsWith('levosalbutamol + ipratropium') || lower.startsWith('levo salbutamol + ipratropium')) {
    return 'Levosalbutamol + Ipratropium';
  }
  if (lower.startsWith('levosalbutamol')) return 'Levosalbutamol';
  if (lower.startsWith('formoterol + budesonide')) return 'Formoterol + Budesonide';
  if (lower.startsWith('budesonide')) return 'Budesonide';
  if (lower.startsWith('montelukast') || lower.startsWith('monteleukast')) return 'Montelukast';
  if (lower.startsWith('thiotropium') || lower.startsWith('tiotropium')) return 'Tiotropium';
  if (lower.startsWith('lanzoprazole') || lower.startsWith('lansoprazole')) return 'Lansoprazole';
  if (lower.startsWith('tranexamic acid') || lower.startsWith('tranexemic acid')) return 'Tranexamic Acid';
  if (lower.startsWith('human insulin')) return 'Human Insulin';
  if (lower.startsWith('methylprednisolone') || lower.startsWith('methyl prednisolone')) return 'Methylprednisolone';
  if (lower.startsWith('prednisolone')) return 'Prednisolone';
  if (lower.startsWith('cholecalciferol') || lower.startsWith('vitamin d')) return 'Cholecalciferol (Vitamin D3)';
  if (lower.startsWith('alendronate + cholecalciferol')) return 'Alendronate + Cholecalciferol';
  if (lower.startsWith('alendronate')) return 'Alendronate';
  if (lower.startsWith('diclofenac sodium + serratiopeptidase')) return 'Diclofenac + Serratiopeptidase';
  if (lower.startsWith('diclofenac')) return 'Diclofenac';
  if (lower.startsWith('mefenamic acid')) return 'Mefenamic Acid';
  if (lower.startsWith('hydroxy chloroquine') || lower.startsWith('hydroxychloroquine')) return 'Hydroxychloroquine';
  if (lower.startsWith('calcium carbonate')) return 'Calcium Carbonate';
  if (lower.startsWith('b complex')) return 'Vitamin B Complex';
  if (lower.startsWith('vitamin e')) return 'Vitamin E';
  if (lower.startsWith('iv ig')) return 'Intravenous Immunoglobulin (IVIG)';
  if (lower.startsWith('omperazole + domperidone') || lower.startsWith('omeprazole + domperidone')) {
    return 'Omeprazole + Domperidone';
  }
  if (lower.startsWith('rabeprazole + domperidone')) return 'Rabeprazole + Domperidone';
  if (lower.startsWith('phenyl ephrine') || lower.startsWith('phenylephrine')) {
    return lower.includes('pcm') ? 'Phenylephrine + CPM + Paracetamol' : 'Phenylephrine + Pheniramine';
  }
  if (lower.startsWith('paradichlorobenzene')) return 'Paradichlorobenzene Ear Drops';
  if (lower.startsWith('benzydamine')) return 'Benzydamine';
  if (lower.startsWith('erythropoetin')) return 'Erythropoietin Recombinant';
  if (lower.startsWith('alpha hydroxy progesterone')) return 'Hydroxyprogesterone Caproate';
  if (lower.startsWith('natural progesterone')) return 'Progesterone';
  if (lower.startsWith('progesterone + estrogen')) return 'Progesterone + Estrogen';
  if (lower.startsWith('aluminium / mg hydroxide')) return 'Aluminium + Magnesium Hydroxide';
  if (lower.startsWith('leucovorin calcium')) return 'Leucovorin Calcium';
  if (lower.startsWith('6mp')) return 'Mercaptopurine (6-MP)';
  if (lower.startsWith('inh tablet')) return 'Isoniazid (INH)';
  if (lower.startsWith('dec tab')) return 'Diethylcarbamazine (DEC)';
  if (lower.startsWith('warfarin sodium')) return 'Warfarin';
  if (lower.startsWith('zinc sulphate')) return 'Zinc Sulphate';

  let cleaned = l
    .replace(/\([^)]*\)/g, ' ')
    .replace(/\[[^\]]*\]/g, ' ')
    .replace(/\bI\.?P\.?\b/gi, ' ')
    .replace(/\b(ER|SR|LA|DT|MDI|DPI|IV|IV use|s\/c)\b/gi, ' ')
    .replace(
      /\b(tablet|tablets|tab\.?|capsule|capsules|cap\.?|syrup|dry syr|syr\.?|injection|inj\.?|drops|ointment|cream|gel|spray|patch|elixir|solution|respules|rotacaps|rotahaler|inhaler|powder puff|suppository|enema|mouth dissolving|sustained release|vaginal|buccal paste|oral gel|oral rinse|topical cream|powder for inj|sublingual|aqueous|nebulising|nebuliser|respiratory|pill|sachet|amp|bottles|can|powder)\b/gi,
      ' '
    )
    .replace(/\b\d+(?:\.\d+)?(?:\s*[,/+-]\s*\d+(?:\.\d+)?)*\s*(?:mg\/ml|mg\/5\s*ml|mg\/2\s*ml|mg\/4\s*ml|mg\/100\s*ml|mcg\/ml|mcg\/puff|mg|mcg|gm|g|iu|units|ml|%|lakh|w\/v|w\/w|in 1000)?\b/gi, ' ')
    .replace(/[,:;]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  if (!cleaned) cleaned = l;

  return cleaned
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (word === '+') return '+';
      if (word.toUpperCase() === word && word.length <= 4) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .replace(/\s+\+\s+/g, ' + ')
    .trim();
}

function buildMedicationCatalog(): CatalogMedication[] {
  const byKey = new Map<string, CatalogMedication>();

  const makeKey = (name: string) => name.toLowerCase().replace(/[^a-z0-9+]+/g, ' ').trim();

  for (const overlay of BRAND_OVERLAYS) {
    const key = makeKey(overlay.generic_name);
    byKey.set(key, {
      id: key.replace(/\s+/g, '-'),
      generic_name: overlay.generic_name,
      aliases: overlay.aliases ? [...overlay.aliases] : [],
      therapeutic_category: overlay.therapeutic_category,
      speciality: mapCategoryToSpeciality(overlay.therapeutic_category),
      brands_us: [...overlay.brands_us],
      brands_in: [...overlay.brands_in],
      pdf_formulations: [],
      common_dosages: [...overlay.common_dosages],
      default_route: overlay.default_route,
      registries: [...overlay.registries],
    });
  }

  for (const row of PDF_DRUG_ENTRIES) {
    const baseGeneric = extractBaseGenericFromPdfLabel(row.label);
    const key = makeKey(baseGeneric);
    const { form, route, strength } = detectFormAndRoute(row.label);
    const formulation: PdfFormulation = {
      sl_no: row.sl_no,
      label: row.label,
      form,
      strength,
      route,
    };

    const existing = byKey.get(key);
    if (existing) {
      existing.pdf_formulations.push(formulation);
      if (!existing.registries.includes('IN-PDF-500')) {
        existing.registries.push('IN-PDF-500');
      }
      if (strength && !existing.common_dosages.includes(strength)) {
        existing.common_dosages.push(strength);
      }
      if (!existing.therapeutic_category) {
        existing.therapeutic_category = row.therapeutic_category;
        existing.speciality = mapCategoryToSpeciality(row.therapeutic_category);
      }
    } else {
      byKey.set(key, {
        id: key.replace(/\s+/g, '-'),
        generic_name: baseGeneric,
        aliases: [],
        therapeutic_category: row.therapeutic_category,
        speciality: mapCategoryToSpeciality(row.therapeutic_category),
        brands_us: [],
        brands_in: [],
        pdf_formulations: [formulation],
        common_dosages: strength ? [strength] : [],
        default_route: route,
        registries: ['IN-PDF-500'],
      });
    }
  }

  return Array.from(byKey.values()).sort((a, b) =>
    a.generic_name.localeCompare(b.generic_name)
  );
}

export const MEDICATION_CATALOG: readonly CatalogMedication[] = buildMedicationCatalog();

export const CATALOG_STATS = {
  genericCount: MEDICATION_CATALOG.length,
  pdfFormulationCount: PDF_DRUG_ENTRIES.length,
};

export const SPECIALITIES: readonly MedicalSpeciality[] = Array.from(
  new Set(MEDICATION_CATALOG.map((item) => item.speciality))
).sort() as MedicalSpeciality[];

export const THERAPEUTIC_CATEGORIES: readonly string[] = Array.from(
  new Set(MEDICATION_CATALOG.map((item) => item.therapeutic_category))
).sort();

function normalizeToken(value: string): string {
  return value
    .toLowerCase()
    .replace(/\bamoxycillin\b/g, 'amoxicillin')
    .replace(/\bfrusemide\b/g, 'furosemide')
    .replace(/\bmonteleukast\b/g, 'montelukast')
    .replace(/\bthiotropium\b/g, 'tiotropium')
    .replace(/\blanzoprazole\b/g, 'lansoprazole')
    .replace(/\btranexemic\b/g, 'tranexamic')
    .replace(/\bthyroxine\b/g, 'levothyroxine')
    .replace(/\b(tab\.?|tablet|tablets|cap\.?|capsule|capsules|syp\.?|syr\.?|syrup|inj\.?|injection|sr|xr|er|cr|od|bd|dt|i\.p\.?|ip)\b/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;

  const dp = Array.from({ length: a.length + 1 }, () =>
    new Array<number>(b.length + 1).fill(0)
  );
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[a.length][b.length];
}

function similarity(a: string, b: string): number {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 0;
  return 1 - levenshtein(a, b) / maxLen;
}

export function lookupMedications(query: string, limit = 6): MedicationMatch[] {
  const raw = query.trim();
  if (!raw) return [];

  const rawLower = raw.toLowerCase();
  const normalized = normalizeToken(raw) || rawLower;
  const matches: MedicationMatch[] = [];

  for (const item of MEDICATION_CATALOG) {
    let bestMatch: MedicationMatch | null = null;

    const consider = (
      label: string,
      kind: MedicationMatch['match_kind'],
      exactScore: number
    ) => {
      const labelLower = label.toLowerCase();
      const labelNorm = normalizeToken(label) || labelLower;
      let score = 0;

      if (rawLower === labelLower || normalized === labelNorm) {
        score = exactScore;
      } else if (
        labelNorm.length >= 3 &&
        normalized.length >= 3 &&
        (labelNorm.startsWith(normalized) || normalized.startsWith(labelNorm))
      ) {
        score = Math.min(0.92, exactScore - 0.08);
      } else if (
        rawLower.length >= 3 &&
        (labelLower.includes(rawLower) ||
          (normalized.length >= 3 && labelNorm.includes(normalized)))
      ) {
        score = 0.82;
      } else if (normalized.length >= 4 && labelNorm.length >= 4) {
        const sim = similarity(normalized, labelNorm);
        if (sim >= 0.65) {
          score = Number((sim * 0.85).toFixed(3));
        }
      }

      if (score > 0 && (!bestMatch || score > bestMatch.score)) {
        bestMatch = {
          generic_name: item.generic_name,
          matched_label: label,
          match_kind: score >= 0.95 ? kind : 'fuzzy',
          brands_us: item.brands_us,
          brands_in: item.brands_in,
          pdf_formulations: item.pdf_formulations,
          common_dosages: item.common_dosages,
          default_route: item.default_route,
          therapeutic_category: item.therapeutic_category,
          speciality: item.speciality,
          category: item.therapeutic_category,
          registries: item.registries,
          score,
        };
      }
    };

    consider(item.generic_name, 'exact_generic', 1.0);
    for (const part of item.generic_name.split(/[\/+()]/)) {
      const trimmed = part.trim();
      if (trimmed.length >= 3) {
        consider(trimmed, 'exact_generic', 0.99);
      }
    }
    for (const alias of item.aliases) {
      consider(alias, 'exact_generic', 0.985);
    }
    for (const brand of item.brands_in) {
      consider(brand, 'brand_in', 0.98);
    }
    for (const brand of item.brands_us) {
      consider(brand, 'brand_us', 0.98);
    }
    for (const form of item.pdf_formulations) {
      consider(form.label, 'formulation', 0.96);
    }

    if (bestMatch) {
      matches.push(bestMatch);
    }
  }

  return matches.sort((a, b) => b.score - a.score).slice(0, limit);
}

export function matchMedicationName(rawName: string): {
  best: MedicationMatch | null;
  suggestions: MedicationMatch[];
} {
  const suggestions = lookupMedications(rawName, 6);
  return {
    best: suggestions[0] ?? null,
    suggestions,
  };
}

export function getCatalogSpecialityInfo(nameOrGeneric: string): {
  generic_name: string;
  therapeutic_category: string;
  speciality: string;
  catalog_region: string;
} {
  const { best } = matchMedicationName(nameOrGeneric);
  if (!best || best.score < 0.78) {
    return {
      generic_name: '',
      therapeutic_category: 'General / Unlisted',
      speciality: 'Critical Care & General',
      catalog_region: '',
    };
  }
  return {
    generic_name: best.generic_name,
    therapeutic_category: best.therapeutic_category,
    speciality: best.speciality,
    catalog_region: best.registries.join(' / '),
  };
}
