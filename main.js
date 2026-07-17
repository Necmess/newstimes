const NEWS_API_URL =
  "https://noona-times-be-5ca9402f90d9.herokuapp.com/top-headlines";

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

// 검색 URL을 조립해서 뉴스 목록을 가져오는 공통 함수.
// country/category/q 등은 params로 넘겨서 덮어쓴다.
// 응답에 문제가 있거나 결과가 0건이면 에러를 던진다 (호출부에서 try/catch로 처리).
const fetchNews = async (params = {}) => {
  const url = new URL(NEWS_API_URL);
  url.searchParams.set("country", "us");
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "뉴스를 불러오지 못했습니다.");
  }
  if (data.articles.length === 0) {
    throw new Error("검색 결과가 없습니다.");
  }

  return data.articles;
};

const getLatestNews = async () => {
  try {
    newsList = await fetchNews();
    render();
  } catch (error) {
    error_render(error.message);
  }
};

const getNewsByCategory = async (event) => {
  try {
    const category = event.target.textContent.toLowerCase();
    newsList = await fetchNews({ category });
    render();
  } catch (error) {
    error_render(error.message);
  }
};

const getNewsByKeyword = async () => {
  try {
    const keyword = document.getElementById("search-input").value;
    newsList = await fetchNews({ country: "kr", q: keyword });
    render();
  } catch (error) {
    error_render(error.message);
  }
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

const error_render = (errorMessage) => {
  const errorHTML = ` <div class="alert alert-danger" role="alert">
  ${errorMessage}
</div>`;

  document.getElementById("news-board").innerHTML = errorHTML;
};

getLatestNews();
