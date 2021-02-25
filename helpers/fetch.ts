import { API_URLS } from "./constants";
import { FetchParams, Line, LineDirectionParams } from "./fetch.interfaces";

const objectsAreSame = (x, y) => {
  let objectsAreSame = true;
  for (let propertyName in x) {
    if (x[propertyName] !== y[propertyName]) {
      objectsAreSame = false;
      break;
    }
  }
  return objectsAreSame;
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
  const data: Line[] = JSON.parse(response.getContentText());
  const line: (Line | null) = data.find((el: Line) => el.number === 10);
  const direction = line.courses.firstDirection;
}

const sortBusStops = (course: LineDirectionParams[], lastBusStops: LineDirectionParams[],) => {
  const sortedArr: LineDirectionParams[] = [];
  const courseCopy: LineDirectionParams[] = [...course];
  sortedArr.unshift(...lastBusStops);
  do {
    courseCopy.forEach((el: LineDirectionParams, i) => {
      if (el.toStopPoint.symbol === sortedArr[0].fromStopPoint.symbol) {
        sortedArr.unshift(el);
      }
    });
  } while (sortedArr.length !== courseCopy.length);

  return sortedArr;
}

const sortArr = () => {
  const token: string = ScriptApp.getOAuthToken();
  const url: string = `${API_URLS.RTDB_URL
    }lines.json?print=pretty&access_token=${encodeURIComponent(token)}`;
  const response: GoogleAppsScript.URL_Fetch.HTTPResponse = UrlFetchApp.fetch(
    url
  );
  const data: Line[] = JSON.parse(response.getContentText());
  const line: (Line | null) = data.find((el: Line) => el.number === 24);
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

  if (firstBusStops.length === 1 && lastBusStops.length === 1) {
    const sortedArr = sortBusStops(direction, lastBusStops);
    console.log(sortedArr);
  } else {
    console.log("jest wiecej niż jeden przystanków pocz./koń.");
    console.log(JSON.stringify({ firstBusStops, lastBusStops }, null, 2))

    const variants = firstBusStops.map((firstBusStop, i) => {
      const variantDirection = [...direction];
      const variantWithoutFirstBusStop = variantDirection.filter(el => el.fromStopPoint.symbol !== firstBusStop.fromStopPoint.symbol);
      let variantWithoutFirstAndNextBusStops: LineDirectionParams[] = [];
      let filteredVariantWithoutFirstAndNextBusStops: LineDirectionParams[] = [];
      do {
        variantWithoutFirstAndNextBusStops = [...filteredVariantWithoutFirstAndNextBusStops];
        const arrayToFilter = variantWithoutFirstAndNextBusStops.length === 0 ? variantWithoutFirstBusStop : variantWithoutFirstAndNextBusStops;
        filteredVariantWithoutFirstAndNextBusStops = arrayToFilter.filter((busStop) => {
          const busStopIndex = arrayToFilter.findIndex(
            (el: LineDirectionParams) => {
              return busStop.fromStopPoint.symbol === el.toStopPoint.symbol
            }
          );
          const isAlternateFirstBusStop = firstBusStops.some(el => objectsAreSame(el, busStop));

          return ((busStopIndex !== -1) || (isAlternateFirstBusStop))
        })
      } while (variantWithoutFirstAndNextBusStops.length !== filteredVariantWithoutFirstAndNextBusStops.length);
      return variantWithoutFirstAndNextBusStops;
    })
    variants.forEach(variant => console.log(sortBusStops(variant, lastBusStops)));
  }
};
