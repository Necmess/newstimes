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

const PAGE_SIZE = 10;
let currentPage = 1;
let totalPages = 1;
let lastFetchParams = {}; // 마지막 조회 조건(category/q/country 등, page 제외) - </>버튼이 재사용한다.

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
// country/category/q/page/pageSize 등은 params로 넘겨서 덮어쓴다.
// 응답에 문제가 있거나 결과가 0건이면 에러를 던진다 (호출부에서 try/catch로 처리).
const fetchNews = async (params = {}) => {
  const { page: requestedPage = currentPage, pageSize = PAGE_SIZE, ...restParams } = params;
  // 첫 페이지도 0 이하로 내려가지 않게 최소 1로 고정한다.
  const page = requestedPage <= 0 ? 1 : requestedPage;
  lastFetchParams = restParams;

  const url = new URL(NEWS_API_URL);
  url.searchParams.set("country", "us");
  url.searchParams.set("page", page);
  url.searchParams.set("pageSize", pageSize);
  Object.entries(restParams).forEach(([key, value]) => {
    if (value) url.searchParams.set(key, value);
  });

  const response = await fetch(url);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "뉴스를 불러오지 못했습니다.");
  }

  // totalResults가 0이어도 최소 1페이지는 있는 걸로 취급한다 (첫/마지막 페이지가 0 이하로 내려가지 않게).
  totalPages = Math.max(1, Math.ceil(data.totalResults / pageSize));

  // 요청한 page(마지막 페이지)가 totalPages보다 크면, 실제로 결과가 없는 게 아니라
  // 페이지 번호가 범위를 벗어난 것이므로 totalPages로 다시 계산해서 재요청한다.
  if (page > totalPages) {
    return fetchNews({ ...restParams, pageSize, page: totalPages });
  }

  if (data.articles.length === 0) {
    throw new Error("검색 결과가 없습니다.");
  }

  currentPage = page;
  return data.articles;
};

const getLatestNews = async (page = 1) => {
  try {
    newsList = await fetchNews({ page });
    render();
  } catch (error) {
    error_render(error.message);
  }
};

const getNewsByCategory = async (event, page = 1) => {
  try {
    const category = event.target.textContent.toLowerCase();
    newsList = await fetchNews({ category, page });
    render();
  } catch (error) {
    error_render(error.message);
  }
};

const getNewsByKeyword = async (page = 1) => {
  try {
    const keyword = document.getElementById("search-input").value;
    newsList = await fetchNews({ country: "kr", q: keyword, page });
    render();
  } catch (error) {
    error_render(error.message);
  }
};

// 방금 조회했던 조건(lastFetchParams)을 그대로 유지한 채 페이지만 바꿔서 다시 조회한다.
const goToPage = async (page) => {
  try {
    newsList = await fetchNews({ ...lastFetchParams, page });
    render();
  } catch (error) {
    error_render(error.message);
  }
};

const goToPrevPage = () => {
  if (currentPage <= 1) return; // 이미 첫 페이지면 아무것도 안 함
  goToPage(currentPage - 1);
};

const goToNextPage = () => {
  if (currentPage >= totalPages) return; // 이미 마지막 페이지면 아무것도 안 함
  goToPage(currentPage + 1);
};

const MAX_PAGE_BUTTONS = 5; // 한 번에 보여줄 페이지 번호 버튼 개수

// currentPage를 중심으로 최대 MAX_PAGE_BUTTONS개의 페이지 번호 버튼을 그린다.
const renderPageNumbers = () => {
  let firstPage = Math.max(1, currentPage - Math.floor(MAX_PAGE_BUTTONS / 2));
  let lastPage = Math.min(totalPages, firstPage + MAX_PAGE_BUTTONS - 1);
  // 뒤쪽이 짧게 잘리면(마지막 페이지 근처) 앞쪽 시작점을 당겨서 최대한 5개를 채운다.
  firstPage = Math.max(1, lastPage - MAX_PAGE_BUTTONS + 1);

  let buttonsHTML = "";
  for (let i = firstPage; i <= lastPage; i++) {
    const activeClass = i === currentPage ? "active" : "";
    buttonsHTML += `<button class="page-number-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
  }

  document.getElementById("page-numbers").innerHTML = buttonsHTML;
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
  renderPageNumbers();
};

const error_render = (errorMessage) => {
  const errorHTML = ` <div class="alert alert-danger" role="alert">
  ${errorMessage}
</div>`;

  document.getElementById("news-board").innerHTML = errorHTML;
};

getLatestNews();
