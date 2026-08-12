export interface MineralData {
    id: string;
    name: string;
    base64Data?: string;
}

export interface Fundstelle {
    id: string;
    title: string;
    latitude: number;
    longitude: number;
    type?: "aufgegeben";
    description?: string;
    minerals?: string[];
    mineralsData?: MineralData[];
}