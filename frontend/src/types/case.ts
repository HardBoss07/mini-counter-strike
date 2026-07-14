export interface CaseTemplate {
  id: number;
  title: string;
  imageUrl: string;
}

export interface UserCaseInstance {
  id: number;
  caseTemplate: CaseTemplate;
}

export interface OpenCaseResponse {
  weaponName: string;
  rarity: string;
  imageUrl: string;
}
