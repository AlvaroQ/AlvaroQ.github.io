import { EMAIL, GITHUB_URL, LINKEDIN_URL } from './site';

export interface Contact {
  email: string;
  linkedinUrl: string;
  linkedinDisplay: string;
  githubUrl: string;
  githubDisplay: string;
}

export const contact: Contact = {
  email: EMAIL,
  linkedinUrl: LINKEDIN_URL,
  linkedinDisplay: 'linkedin.com/in/alvaro-quintana-palacios',
  githubUrl: GITHUB_URL,
  githubDisplay: 'github.com/AlvaroQ',
};
