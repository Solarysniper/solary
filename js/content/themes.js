// Thèmes de révision (inspirés des UE du référentiel IFSI)
export const THEMES = [
  { id: 'anat', name: 'Anatomie & physiologie' },
  { id: 'pharma', name: 'Pharmacologie' },
  { id: 'calc', name: 'Calculs de doses' },
  { id: 'bio', name: 'Biologie & normes' },
  { id: 'soins', name: 'Soins & techniques' },
  { id: 'hyg', name: 'Hygiène & infectiologie' },
  { id: 'urg', name: 'Urgences & réanimation' },
  { id: 'cardio', name: 'Cardiologie' },
  { id: 'pneumo', name: 'Pneumologie' },
  { id: 'neuro', name: 'Neurologie' },
  { id: 'endoc', name: 'Endocrinologie & diabète' },
  { id: 'nephro', name: 'Néphrologie & urologie' },
  { id: 'dig', name: 'Digestif' },
  { id: 'pedia', name: 'Pédiatrie & maternité' },
  { id: 'geria', name: 'Gériatrie' },
  { id: 'psy', name: 'Santé mentale' },
  { id: 'onco', name: 'Oncologie & soins palliatifs' },
  { id: 'douleur', name: 'Douleur' },
  { id: 'legal', name: 'Législation & éthique' },
  { id: 'sp', name: 'Santé publique' },
  { id: 'vocab', name: 'Vocabulaire médical' },
];

export const themeName = (id) => (THEMES.find((t) => t.id === id) || { name: id }).name;
