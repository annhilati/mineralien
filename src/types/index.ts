export interface MineralData {
    id: string;
    name: string;
    base64Data?: string;
}

export interface Fundstelle {
    id: string;
    title: string;
    description: string;
    latitude: number;
    longitude: number;
    minerals?: string[];
    mineralsData?: MineralData[];
}