import { API_URLS } from "./constants";
import { fetchData, FetchParams, sendData } from "./fetch";

const fetchOptions: { [k: string]: FetchParams } = {
  linesParams: {
    contentType: "application/json",
    url: API_URLS.LINES,
  },

  directionParams: {
    contentType: "application/json",
    url: API_URLS.DIRECTION,
    method: "post",
  },
};

function init() {
  try {
    const { lines } = fetchData(fetchOptions.linesParams);
    lines.forEach((line: { [k: string]: any }) => {
      const [{ segments: firstDirection }, { segments: secondDirection }] = [
        "firstDirection",
        "secondDirection",
      ].map((direction, index) => {
        return fetchData({
          ...fetchOptions.directionParams,
          payload: JSON.stringify({
            line,
            thereDirection: index === 0 ? true : false,
          }),
        });
      });
      line.courses = { firstDirection, secondDirection };
    });
    console.log({ ...lines });

    // sendData({ lines });
  } catch (error) {
    console.log(error);
  }
}
