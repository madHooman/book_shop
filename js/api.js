$(function () {
  let bookData = null;
  let allBooks = null;
  let filteredBooks = null;
  let priceSlider = null;
  let booksArray = [];


  // 📦 دریافت XML
  $.ajax({
    url: "xml/bookList.xml",
    type: "GET",
    dataType: "xml",
    success: function (data) {
      bookData = data;
      allBooks = $(bookData).find("book");
      if(window.location.href.toLowerCase().indexOf("product") == -1){

      
      filteredBooks = allBooks;

      createBookList(1);
      createPageItem();
      addSubjectMenu();
      setPriceRange();
      }
      else{
        ShowBook()
    
      }
    },
    error: function () {
      console.error("❌ خطا در بارگذاری فایل bookList.xml");
    }
  });


  function ShowBook() {
        let ID =window.location.href.split("?")[1].split("=")[1];

       var filteredBooks = $(bookData).find("book[id='"+ID+"']")



       
  // 🟢 استخراج اطلاعات از XML
  let title = filteredBooks.find("title").text();
  let author = filteredBooks.find("author").text();
  let price = filteredBooks.find("price").text();
  let category = filteredBooks.find("subject").text();


    $("#product-image").attr("src", "bookImages/" + ID + ".jpg");
  $("#product-title").text(title);
  $("#product-author").text("نویسنده: " + author);
  $("#product-price").text(Number(price).toLocaleString("fa-IR") + " تومان");
  $("#product-category").text("موضوع: " + category);
  
      //  console.log(booksArray[0].title);
// 
       return filteredBooks;
 

  }

  // 🔹 تنظیم اسلایدر قیمت
  function setPriceRange() {
    let Max = null;
    let Min = null;

    $(filteredBooks).find("price").each(function (_, el) {
      let price = Number($(el).text());
      if (Max === null || price > Max) Max = price;
      if (Min === null || price < Min) Min = price;
    });

    if (priceSlider) {
      priceSlider.update({ min: Min, max: Max, from: Min, to: Max });
      return;
    }

    $(".priceSlider").ionRangeSlider({
      type: "double",
      min: Min || 0,
      max: Max || 500000,
      from: Min || 0,
      to: Max || 500000,
      postfix: " تومان",
      onFinish: function (data) {
        let from = data.from;
        let to = data.to;
        filteredBooks = allBooks.filter(function () {
          let price = Number($(this).find("price").text());
          return price >= from && price <= to;
        });
        createBookList(1);
        createPageItem();
      }
    });

    priceSlider = $(".priceSlider").data("ionRangeSlider");
  }

  // 🔹 ساخت منوی موضوعات
  function addSubjectMenu() {
    let subjects = [];
    $(".navbar .subjects").empty();
    $(".navbar .subjects").append(
      `<a class="dropdown-item fw-bold" href="#">همه موضوعات</a><hr>`
    );

    $(allBooks).find("subject").each(function () {
      let sub = $(this).text().trim();
      if (!subjects.includes(sub)) {
        subjects.push(sub);
        $(".navbar .subjects").append(`<a class="dropdown-item" href="#">${sub}</a>`);
      }
    });

    $(".navbar .subjects a").click(function () {
      let selectedSubject = $(this).text().trim();

      if (selectedSubject === "همه موضوعات") {
        filteredBooks = allBooks;
      } else {
        filteredBooks = allBooks.filter(function () {
          return $(this).find("subject").text().trim() === selectedSubject;
        });
      }

      setPriceRange();
      createBookList(1);
      createPageItem();
    });
  }

  // 🔹 ساخت لیست کتاب‌ها
  function createBookList(pageCurrentNum) {
    let bookItem = filteredBooks;
    $(".bookShowList").empty().append("<div class='row'></div>");
  booksArray = []; 
    let maxItemNumber = Math.min(pageCurrentNum * 9, bookItem.length);

    for (let i = (pageCurrentNum - 1) * 9; i < maxItemNumber; i++) {
      let book = $(bookItem).eq(i);
      let id = book.attr("id");
      let title = book.find("title").text();
      let author = book.find("author").text();
      let price = book.find("price").text();


        booksArray.push({
      id: id,
      title: title,
      author: author,
      price: price
    });

      $(".bookShowList .row").append(`
        <div class="col-md-4">
          <div class="card m-2 shadow-sm h-100">
            <img src="bookImages/${id}.jpg" class="card-img-top" alt="${title}">
            <div class="card-body text-center">
              <h5 class="card-title text-muted" style="font-size: 1rem;">${title}</h5>
              <p class="card-text small text-secondary">${author}</p>
            </div>
            <div class="card-footer text-center bg-white">
              <a href="product.html?id=${id}" class="btn btn-outline-primary btn-sm rounded-pill">
                مشاهده جزئیات | ${price} تومان
              </a>
            </div>
          </div>
        </div>
      `);
    }
  }

  // 🔹 صفحه‌بندی
  function createPageItem() {
    let bookItem = filteredBooks;
    let roundPageCount = Math.ceil(bookItem.length / 9);

    $(".pageBlock .pagination .page-item a.page-link:not([aria-label])")
      .parent()
      .remove();

    for (let pageNum = 1; pageNum <= roundPageCount; pageNum++) {
      $(".pageBlock ul li")
        .last()
        .before(
          `<li class="page-item"><a href="#" class="page-link" data-page="${pageNum}">${pageNum}</a></li>`
        );
    }

    function setPage(pageNumber) {
      createBookList(pageNumber);
      $(".pageBlock .pagination .page-item.active").removeClass("active");
      $(`.pageBlock .pagination .page-item a[data-page='${pageNumber}']`)
        .parent()
        .addClass("active");
    }

    $(".pageBlock ul li.page-item a.page-link")
      .not("[aria-label]")
      .parent()
      .first()
      .addClass("active");

    $(".pageBlock ul.pagination li.page-item a")
      .not("[aria-label]")
      .click(function (e) {
        e.preventDefault();
        let page = Number($(this).data("page"));
        setPage(page);
      });

    $(".pageBlock ul.pagination li.page-item a[aria-label='Previous']").click(
      function (e) {
        e.preventDefault();
        let currentPage = Number(
          $(".pageBlock .pagination li.page-item.active a").data("page")
        );
        let prevPage = currentPage - 1;
        if (prevPage >= 1) setPage(prevPage);
      }
    );

    $(".pageBlock ul.pagination li.page-item a[aria-label='Next']").click(
      function (e) {
        e.preventDefault();
        let currentPage = Number(
          $(".pageBlock .pagination li.page-item.active a").data("page")
        );
        let nextPage = currentPage + 1;
        if (nextPage <= roundPageCount) setPage(nextPage);
      }
    );
  }
});
 