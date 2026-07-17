// 과제 진행 중에는 true(newsapi.org, 데이터 많음, 하루 100회 제한, 로컬에서만 동작).
// 제출 직전에만 false로 바꿔서 배포 가능한 API로 전환할 것.
const IS_DEV = false;

const NEWS_API_KEY = `de64a150053341d4a649d3b0790737e8`;
const DEV_API_URL = "https://newsapi.org/v2/top-headlines";
const SUBMIT_API_URL =
  "https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines";
const NEWS_API_URL = IS_DEV ? DEV_API_URL : SUBMIT_API_URL;

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

const menus = document.querySelectorAll(".menus button");
menus.forEach((menu) =>
  menu.addEventListener("click", (event) => getNewsByCategory(event))
);

// 검색 URL을 조립하고 뉴스를 가져와 render()까지 실행하는 공통 함수.
// country/category 등은 params로 넘겨서 덮어쓴다.
const fetchNews = async (params = {}) => {
  const url = new URL(NEWS_API_URL);
  url.searchParams.set("country", "us");
  if (IS_DEV) {
    url.searchParams.set("apiKey", NEWS_API_KEY);
  }
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const data = await response.json();
  newsList = data.articles;
  render();
};

const getLatestNews = () => fetchNews();

const getNewsByCategory = (event) => {
  const category = event.target.textContent.toLowerCase();
  fetchNews({ category });
};

const getNewsByKeyword = () => {
  const keyword = document.getElementById("search-input").value;
  fetchNews({ country: "kr", category: keyword });
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
      const source =
        item.source && item.source.name ? item.source.name : "no source";
      const date =
        typeof moment !== "undefined"
          ? moment(item.publishedAt).fromNow()
          : item.publishedAt;

      return ` <div class="row news">
          <div class="col-lg-4">
            <img
              class="news-img-size"
              src="${image}"
            />
          </div>
          <div class="col-lg-8">
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
