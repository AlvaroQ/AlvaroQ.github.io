export interface Contact {
  email: string;
  location: string;
  linkedinUrl: string;
  linkedinDisplay: string;
  githubUrl: string;
  githubDisplay: string;
}

export const contact: Contact = {
  email: "alvaroquintanapalacios@gmail.com",
  location: "Madrid, Spain (Remote)",
  linkedinUrl: "https://www.linkedin.com/in/alvaro-quintana-palacios/",
  linkedinDisplay: "linkedin.com/in/alvaro-quintana-palacios",
  githubUrl: "https://github.com/AlvaroQ",
  githubDisplay: "github.com/AlvaroQ"
} as const;
