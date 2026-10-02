// Education, experience, and publications shown on the About page.
// Entries render in the order listed here — put the most recent first.
// Text fields marked "inline markdown" accept [links](https://…) and **bold**.

export interface Education {
  school: string;
  degree: string;
  years: string;
  location?: string;
  details?: string[];
}

export interface Experience {
  org: string;
  roles: string[]; // Most recent first; earlier titles are shown as "Previously …"
  years: string;
  location?: string;
  summary?: string; // inline markdown
}

export interface Publication {
  title: string;
  authors: string; // inline markdown — wrap your name in ** to bold it
  venue?: string;
  year: string;
  url?: string;
}

export const education: Education[] = [
  {
    school: 'Cornell University',
    degree: 'Ph.D., Genetics, Genomics & Development',
    years: '2009 – 2015',
    location: 'Ithaca, NY',
    details: ['Department of Molecular Biology & Genetics', 'Minor in Biometry'],
  },
  {
    school: 'The School of the Art Institute of Chicago',
    degree: 'B.A., Visual and Critical Studies',
    years: '2005',
    location: 'Chicago, IL',
  },
];

export const experience: Experience[] = [
  {
    org: 'DNAnexus',
    roles: ['Director, Engineering (2022)', 'Principal Scientist (2020)', 'Senior Scientist (2019)'],
    years: '2019 – 2026',
    location: 'Mountain View, CA',
    summary:
      '[DNAnexus](https://www.dnanexus.com/) provides a cloud-based platform to help integrate molecular and clinical data for downstream, scalable compute and production-grade monitoring and delivery of data. I worked with a team of scientists and engineers to deliver a variety of products on the platform.',
  },
  {
    org: '23andMe',
    roles: ['Senior Data Scientist (2018)', 'Data Scientist'],
    years: '2015 – 2018',
    location: 'Mountain View, CA',
    summary:
      'If you believe in the power of large-scale genetic research, which I do, then [23andMe](https://www.23andme.com/) should already be on your radar! 23andMe is a direct-to-consumer company that helps customers access and understand their own genetic information. I helped with various projects at the company.',
  },
  {
    org: 'Insight Data Science',
    roles: ['Data Science Fellow'],
    years: '2015',
    location: 'Palo Alto, CA',
    summary:
      'Insight Data Science is an intensive 7-week postdoctoral training fellowship bridging the gap between academia and industry. Just prior to earning a Ph.D., I was a Fellow in the SV 2015A session at Insight. Here, I created a novel data project and used that project to interview with data-centric companies.',
  },
  {
    org: 'Cornell University',
    roles: ['Graduate Research Assistant'],
    years: '2009 – 2015',
    location: 'Ithaca, NY',
    summary:
      "I was fortunate to be advised by [Dr. Andrew G. Clark](https://blogs.cornell.edu/andyclarklab/home/), a population geneticist and member of the National Academy of Sciences. My Ph.D. work involved understanding the natural genetic architecture underlying Position Effect Variegation (PEV), a proxy for epigenetic context in a genome. To this end, I generated experimental data and performed end-to-end analysis of whole-genome sequence data and RNA-seq from over 100 individuals. During this time, I was also a Teaching Assistant for Andy's course, Human Genetics, and for [Chip Aquadro](https://mbg.cornell.edu/people/charles-aquadro)'s course, Personalized Genomics and Medicine.",
  },
  {
    org: 'University of Iowa Hospitals and Clinics',
    roles: ['Research Assistant'],
    years: '2005 – 2009',
    location: 'Iowa City, IA',
    summary:
      'Prior to starting my Ph.D., I spent four years in the lab of [Dr. Jeffrey C. Murray](https://www.linkedin.com/in/jeff-murray-02344729) studying associations between genetic factors and preterm birth, a common, complex disease that impacts roughly 1 in every 8 babies born in the United States. Mentorship from Jeff (University of Iowa, past president of ASHG, Gates Foundation), a sense of discovery, potential impact, and a love for problem solving were all strong reasons I developed a passion for research and the sciences. Here, I performed genetic and statistical analysis of preterm birth (work that resulted in four publications), assisted in sample collection, sample processing, and database management for a University-wide biorepository, and performed general lab procedures including PCR, TaqMan assays, Sanger sequencing, and gel electrophoresis.',
  },
];

export const publications: Publication[] = [
  {
    title:
      'Interactions between PDA-associated polymorphisms and genetic ancestry alter ductus arteriosus gene expression',
    authors: 'Clyman RI, Hills NK, Dagle JM, Murray JC, **Kelsey K**',
    venue: 'Pediatric Research 91(4): 903–911',
    year: '2022',
    url: 'https://pmc.ncbi.nlm.nih.gov/articles/PMC8501158/',
  },
  {
    title: 'Functional consequences of variation in Y chromosome heterochromatin in Drosophila',
    authors: '**Kelsey KJP**, Clark AG',
    venue: 'In preparation',
    year: '2018',
  },
  {
    title: 'Variation in Position Effect Variegation within a natural population',
    authors: '**Kelsey KJP**, Clark AG',
    venue: 'Genetics 207(3): 1157–1166',
    year: '2017',
    url: 'https://academic.oup.com/genetics/article/207/3/1157/5930708',
  },
  {
    title:
      'Candidate genetic modifiers of retinitis pigmentosa identified by exploiting natural variation in Drosophila',
    authors: 'Chow CY, **Kelsey KJ**, Wolfner MF, Clark AG',
    venue: 'Human Molecular Genetics 25(4): 651–659',
    year: '2016',
    url: 'https://pubmed.ncbi.nlm.nih.gov/26662796/',
  },
  {
    title:
      'Polymorphisms in the fetal progesterone receptor and a calcium-activated potassium channel isoform are associated with preterm birth in an Argentinian population',
    authors:
      'Mann PC, Cooper ME, Ryckman KK, Comas B, Gili J, Crumley S, Bream EN, Byers HM, Piester T, Schaefer A, Christine PJ, Lawrence A, Schaa KL, **Kelsey KJ**, Berends SK, Momany AM, Gadow E, Cosentino V, Castilla EE, López Camelo J, Saleme C, Day LJ, England SK, Marazita ML, Dagle JM, Murray JC',
    venue: 'Journal of Perinatology 33(5): 336–340',
    year: '2013',
    url: 'https://pubmed.ncbi.nlm.nih.gov/23018797/',
  },
  {
    title:
      'Genetic associations of surfactant protein D and angiotensin-converting enzyme with lung disease in preterm neonates',
    authors: 'Ryckman KK, Dagle JM, **Kelsey K**, Momany AM, Murray JC',
    venue: 'Journal of Perinatology 32(5): 349–355',
    year: '2012',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21960125/',
  },
  {
    title:
      'Replication of genetic associations in the inflammation, complement, and coagulation pathways with intraventricular hemorrhage in LBW preterm neonates',
    authors: 'Ryckman KK, Dagle JM, **Kelsey K**, Momany AM, Murray JC',
    venue: 'Pediatric Research 70(1): 90–95',
    year: '2011',
    url: 'https://pubmed.ncbi.nlm.nih.gov/21659962/',
  },
  {
    title: 'Determination of genetic predisposition to patent ductus arteriosus in preterm infants',
    authors:
      'Dagle JM, Lepp NT, Cooper ME, Schaa KL, **Kelsey KJ**, Orr KL, Caprau D, Zimmerman CR, Steffen KM, Johnson KJ, Marazita ML, Murray JC',
    venue: 'Pediatrics 123(4): 1116–1123',
    year: '2009',
    url: 'https://pubmed.ncbi.nlm.nih.gov/19336370/',
  },
];
