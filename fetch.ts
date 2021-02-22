import { API_URLS } from "./constants";

export interface FetchParams {
  readonly contentType: string;
  readonly url: API_URLS;
  readonly method?: GoogleAppsScript.URL_Fetch.HttpMethod;
  readonly payload?: GoogleAppsScript.URL_Fetch.Payload;
}
export interface LineDirectionParams {
  readonly color: string;
  readonly fromStopPoint: { [k: string]: string };
  readonly toStopPoint: { [k: string]: string };
}

export function fetchData<T>({
  url,
  ...restOpts
}: FetchParams): { [k: string]: T[] } {
  const data: string = UrlFetchApp.fetch(url, restOpts).getContentText();
  const dataJSON: { [k: string]: T[] } = JSON.parse(data);
  return dataJSON;
}

export function sendData(dbData: { [k: string]: any }): void {
  const token: string = ScriptApp.getOAuthToken();
  const url: string = `${
    API_URLS.RTDB_URL
  }".json?access_token="${encodeURIComponent(token)}`;
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url,
    {
      method: "put",
      payload: JSON.stringify(dbData),
    }
  );
  Logger.log(response.getResponseCode());
}

export function getData() {
  const token: string = ScriptApp.getOAuthToken();
  const url: string = `${
    API_URLS.RTDB_URL
  }"lines.json?print=pretty&access_token="${encodeURIComponent(token)}`;
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url
  );
  const data: [] = JSON.parse(response.getContentText());
  const line: any = data.find((el: any) => el.number === 10);
  const arr = line.courses.firstDirection;

  arr.sort((a, b) => {
    // const { symbol: fromB } = b.fromStopPoint;
    const { symbol: toA } = a.toStopPoint;
    const toAIndex = arr.findIndex((el) => el.toStopPoint.symbol === toA);
    const fromBIndex = arr.findIndex((el) => el.fromStopPoint.symbol === toA);

    console.log({ toAIndex, fromBIndex });

    if (fromBIndex - toAIndex === 1) {
      return 0;
    }
    if (fromBIndex - toAIndex < 0 || toAIndex === -1) {
      return 1;
    }
    return -1;
  });
  console.log(arr);
}

const sortArr = () => {
  const token: string = ScriptApp.getOAuthToken();
  const url: string = `${
    API_URLS.RTDB_URL
  }"lines.json?print=pretty&access_token="${encodeURIComponent(token)}`;
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url
  );
  const data: [] = JSON.parse(response.getContentText());
  const line: any = data.find((el: any) => el.number === 10);
  const arr: LineDirectionParams[] = [...line.courses.firstDirection];
  const sortedArr: LineDirectionParams[] = [];

  const lastBusStops = arr.filter((busStop: LineDirectionParams) => {
    return (
      arr.findIndex(
        (el: LineDirectionParams) =>
          el.fromStopPoint.symbol === busStop.toStopPoint.symbol
      ) === -1
    );
  });

  console.log(arr.length, sortedArr.length);

  if (lastBusStops.length === 1) {
    sortedArr.unshift(...lastBusStops);

    do {
      arr.forEach((el: LineDirectionParams) => {
        if (el.toStopPoint.symbol === sortedArr[0].fromStopPoint.symbol) {
          sortedArr.unshift(el);
        }
      });
    } while (sortedArr.length !== arr.length);
  }

  // arr.forEach((el: LineDirectionParams) => {
  //   if (el.toStopPoint.symbol === sortedArr[0].fromStopPoint.symbol) {
  //     sortedArr.unshift(el);
  //   }
  // });

  console.log(arr.length, sortedArr.length);

  console.log(sortedArr);
};
