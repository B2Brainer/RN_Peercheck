// assessment.ts

export type Assessment = {
    id?: string;              
    name: string;             
    activity: string;                

    visibility: string;       // "public" | "private"
        
    max: number;         
}
