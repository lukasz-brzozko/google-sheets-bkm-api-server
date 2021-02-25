import { API_URLS } from "./constants";

export interface FetchParams {
  readonly contentType: string;
  readonly url: API_URLS;
  readonly method?: GoogleAppsScript.URL_Fetch.HttpMethod;
  readonly payload?: GoogleAppsScript.URL_Fetch.Payload;
}
export interface BusStop {
  readonly name: string;
  readonly symbol: string;
}
export interface LineDirectionParams {
  readonly color: string;
  readonly fromStopPoint: BusStop;
  readonly toStopPoint: BusStop;
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
  const url: string = `${API_URLS.RTDB_URL
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
  const url: string = `${API_URLS.RTDB_URL
    }"lines.json?print=pretty&access_token="${encodeURIComponent(token)}`;
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url
  );
  const data: [] = JSON.parse(response.getContentText());
  const line: any = data.find((el: any) => el.number === 10);
  const direction = line.courses.firstDirection;

  direction.sort((a, b) => {
    // const { symbol: fromB } = b.fromStopPoint;
    const { symbol: toA } = a.toStopPoint;
    const toAIndex = direction.findIndex((el) => el.toStopPoint.symbol === toA);
    const fromBIndex = direction.findIndex((el) => el.fromStopPoint.symbol === toA);

    console.log({ toAIndex, fromBIndex });

    if (fromBIndex - toAIndex === 1) {
      return 0;
    }
    if (fromBIndex - toAIndex < 0 || toAIndex === -1) {
      return 1;
    }
    return -1;
  });
  console.log(direction);
}

const sortArr = () => {
  const token: string = ScriptApp.getOAuthToken();
  const url: string = `${API_URLS.RTDB_URL
    }lines.json?print=pretty&access_token=${encodeURIComponent(token)}`;
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url
  );
  const data: [] = JSON.parse(response.getContentText());
  const line: any = data.find((el: any) => el.number === 24);
  const direction: LineDirectionParams[] = [...line.courses.firstDirection];
  // const direction: LineDirectionParams[] = [...line.courses.secondDirection];
  const sortedArr: LineDirectionParams[] = [];

  const lastBusStops = direction.filter((busStop: LineDirectionParams) => {
    return (
      direction.findIndex(
        (el: LineDirectionParams) =>
          el.fromStopPoint.symbol === busStop.toStopPoint.symbol
      ) === -1
    );
  });
  const firstBusStops = direction.filter((busStop: LineDirectionParams) => {
    return (
      direction.findIndex(
        (el: LineDirectionParams) =>
          busStop.fromStopPoint.symbol === el.toStopPoint.symbol
      ) === -1
    );
  });

  // console.log(direction.length, sortedArr.length);



  if (firstBusStops.length === 1 && lastBusStops.length === 1) {
    sortedArr.unshift(...lastBusStops);

    do {
      direction.forEach((el: LineDirectionParams) => {

        // console.log({
        //   previous:sortedArr[0].fromStopPoint,
        //   from: el.fromStopPoint,
        //   to: el.toStopPoint,
        // })

        if (el.toStopPoint.symbol === sortedArr[0].fromStopPoint.symbol) {
          sortedArr.unshift(el);
        }
      });
    } while (sortedArr.length !== direction.length);
    console.log(sortedArr);

  } else {
    console.log("jest wiecej niż jeden przystanków pocz./koń.");
    console.log(JSON.stringify({ firstBusStops, lastBusStops }, null, 2))

    const variants = firstBusStops.map((firstBusStop) => {
      const variantDirection = [...direction];
      const variantWithoutFirstBusStop = variantDirection.filter(el => el.fromStopPoint.symbol !== firstBusStop.fromStopPoint.symbol)
      const variantWithoutFirstAndNextBusStops = variantWithoutFirstBusStop.filter((busStop) => {
        const busStopIndex = variantWithoutFirstBusStop.findIndex(
          (el: LineDirectionParams) => {
            return busStop.fromStopPoint.symbol === el.toStopPoint.symbol
          }
        );    
        const isAlternateFirstBusStop = firstBusStops.some(el => objectsAreSame(el, busStop));

        return ((busStopIndex !== -1) || (isAlternateFirstBusStop))
      })

      console.log(variantWithoutFirstAndNextBusStops)


    })

  }
  function objectsAreSame(x, y) {
    let objectsAreSame = true;
    for (let propertyName in x) {
      if (x[propertyName] !== y[propertyName]) {
        objectsAreSame = false;
        break;
      }
    }
    return objectsAreSame;
  }
  // direction.forEach((el: LineDirectionParams) => {
  //   if (el.toStopPoint.symbol === sortedArr[0].fromStopPoint.symbol) {
  //     sortedArr.unshift(el);
  //   }
  // });



};
