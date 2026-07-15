// 과제 진행 중에는 true(newsapi.org, 데이터 많음, 하루 100회 제한, 로컬에서만 동작).
// 제출 직전에만 false로 바꿔서 배포 가능한 API로 전환할 것.
const IS_DEV = false;

const NEWS_API_KEY = `de64a150053341d4a649d3b0790737e8`;
const DEV_API_URL = "https://newsapi.org/v2/top-headlines";
const SUBMIT_API_URL = "https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines";

const SUMMARY_MAX_LENGTH = 200;
const FALLBACK_IMAGE =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' width='400' height='250'><rect width='100%' height='100%' fill='#e0e0e0'/><text x='50%' y='50%' dominant-baseline='middle' text-anchor='middle' fill='#888' font-family='sans-serif' font-size='24'>Image Not Available</text></svg>`
  );

const truncate = (text, max) =>
  text.length > max ? text.slice(0, max) + "..." : text;

let newsList = [];

const openNav = () => {
  document.getElementById("mySidenav").style.width = "250px";
};

const closeNav = () => {
  document.getElementById("mySidenav").style.width = "0";
};

const toggleSearch = () => {
  document.getElementById("searchBox").classList.toggle("active");
};

const getLatestNews = async () => {
  //비동기 함수 표현
  const url = new URL(IS_DEV ? DEV_API_URL : SUBMIT_API_URL);
  url.searchParams.set("country", "us");
  if (IS_DEV) {
    url.searchParams.set("apiKey", NEWS_API_KEY);
  }
  // 자바스크립 url 작업을 자주 하니까 인스턴스 url을 가져와 이것을 인스턴스라고 한다. 주소를 통해 생성한다. 겍체로 생성한다.
  const response = await fetch(url); //어웨이트는 기다리게 하는 것. 패치는 url을 갖고오는 역할 "나 데이터 내놔!!"
  const data = await response.json(); //파일형태의 확장자. 객체처럼 생긴 텍스트.
  newsList = data.articles;
  render();
  console.log("looking the my ewil eyes", newsList);
};

let render = () => {
  let newsHTML = ``;

  if (typeof moment !== "undefined") {
    moment.locale("ko");
  }

  newsHTML = newsList
    .map((item) => {
      const image = item.urlToImage || FALLBACK_IMAGE;
      const description = item.description
        ? truncate(item.description, SUMMARY_MAX_LENGTH)
        : "내용없음";
      const source = item.source && item.source.name ? item.source.name : "no source";
      const date =
        typeof moment !== "undefined"
          ? moment(item.publishedAt).fromNow()
          : item.publishedAt;

      return ` <div class="row news align-items-center">
          <div class="col-4">
            <img
              class="news-img-size"
              src="${image}"
            />
          </div>
          <div class="col-8">
            <h2>${item.title}</h2>
            <p>${description}</p>
            <div>${source} * ${date}</div>
          </div>
        </div>`;
    })
    .join("");

  document.getElementById("news-board").innerHTML = newsHTML;
};

getLatestNews();
