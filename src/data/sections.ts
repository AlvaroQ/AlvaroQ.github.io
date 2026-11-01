// Page sections in order: the single source for section ids, the navigation label
// and the heading title.
import type { Strings } from '../i18n';

type StringKey = keyof Strings;

export interface SectionDef {
  id: 'about' | 'career' | 'projects' | 'skills' | 'contact';
  navKey: StringKey;
  titleKey: StringKey;
}

export type SectionId = SectionDef['id'];

export const sections: SectionDef[] = [
  { id: 'about', navKey: 'navAbout', titleKey: 'hiImAlvaro' },
  { id: 'career', navKey: 'navCareer', titleKey: 'careerTimeline' },
  { id: 'projects', navKey: 'navProjects', titleKey: 'latestAiProjects' },
  { id: 'skills', navKey: 'navSkills', titleKey: 'skillsMatrix' },
  { id: 'contact', navKey: 'navContact', titleKey: 'connect' },
];

/** Navigation entries: the hero first, then every section. */
export const navItems: { id: string; navKey: StringKey }[] = [{ id: 'header', navKey: 'navHome' }, ...sections];

export function sectionById(id: SectionId) {
  const found = sections.find((s) => s.id === id);
  if (!found) throw new Error(`Unknown section: ${id}`);
  return found;
}
