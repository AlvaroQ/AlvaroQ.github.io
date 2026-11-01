// Page sections in order: the single source for section ids, their numbered index,
// the navigation label and the heading title.
import type { Strings } from '../i18n';

type StringKey = keyof Strings;

export interface SectionDef {
  id: 'about' | 'career' | 'projects' | 'skills' | 'contact';
  navKey: StringKey;
  titleKey: StringKey;
}

export type SectionId = SectionDef['id'];

const defs: SectionDef[] = [
  { id: 'about', navKey: 'navAbout', titleKey: 'hiImAlvaro' },
  { id: 'career', navKey: 'navCareer', titleKey: 'careerTimeline' },
  { id: 'projects', navKey: 'navProjects', titleKey: 'latestAiProjects' },
  { id: 'skills', navKey: 'navSkills', titleKey: 'skillsMatrix' },
  { id: 'contact', navKey: 'navContact', titleKey: 'connect' },
];

/** Sections with their two-digit index ("01" … "05"). */
export const sections = defs.map((def, i) => ({ ...def, index: String(i + 1).padStart(2, '0') }));

/** Navigation entries: the hero first, then every section. */
export const navItems: { id: string; navKey: StringKey }[] = [{ id: 'header', navKey: 'navHome' }, ...sections];

export function sectionById(id: SectionId) {
  const found = sections.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
}
