export interface Participant {
  id: string;
  name: string;
}

export interface Restriction {
  participantId: string;
  cannotGiveTo: string[];
}

export interface Assignment {
  giver: string;
  receiver: string;
  token: string;
  accessed: boolean;
}

export interface DrawConfig {
  participants: Participant[];
  restrictions: Restriction[];
}

export interface DrawResult {
  id: string;
  assignments: Assignment[];
  createdAt: Date;
}
