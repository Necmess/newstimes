const API_KEY = `de64a150053341d4a649d3b0790737e8`;

const getLatestNews = async () => {
  //비동기 함수 표현
  const url = new URL(
    `https://newsapi.org/v2/top-headlines?country=us&apiKey=${API_KEY}`
  );
  // 자바스크립 url 작업을 자주 하니까 인스턴스 url을 가져와 이것을 인스턴스라고 한다. 주소를 통해 생성한다. 겍체로 생성한다.
  const response = await fetch(url); //어웨이트는 기다리게 하는 것. 패치는 url을 갖고오는 역할 "나 데이터 내놔!!"
  const data = response.json(); //파일형태의 확장자. 객체처럼 생긴 텍스트.
  let news = data.articles;
  console.log("looking the my ewil eyes", news);
};

getLatestNews();
