import { User } from './User';  

export interface Bug {
    id: number;
    title: string;
    description: string;
    status: string;
    priority: string;
    createdDate: string;
    resolvedDate?: string;
    closedDate?: string;
    assignedUserId: number;
    assignedUser?: User;  // Reference to the User type
}
