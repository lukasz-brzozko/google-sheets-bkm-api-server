import { API_URLS } from "./constants";
export interface BusStop {
    readonly name: string;
    readonly symbol: string;
}
export interface Line {
    readonly courses: LineCourses;
    readonly loid: number;
    readonly name: string;
    readonly number: number;
}
export interface LineCourses {
    readonly firstDirection: LineDirectionParams[];
    readonly secondDiretcion: LineDirectionParams[];
}
export interface LineDirectionParams {
    readonly color: string;
    readonly fromStopPoint: BusStop;
    readonly toStopPoint: BusStop;
}
export interface FetchParams {
    readonly contentType: string;
    readonly url: API_URLS;
    readonly method?: GoogleAppsScript.URL_Fetch.HttpMethod;
    readonly payload?: GoogleAppsScript.URL_Fetch.Payload;
}
