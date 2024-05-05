const MAX_BTNS = 7
window.paginator = {
  total: 0,
  per_page: 10,
  cur_page: 1,
  callback: undefined,

  init: function (callback) {
    paginator.callback = callback
    paginator.total = 0;
    $("#per_page").val(paginator.per_page)
    paginator.cur_page = 1;

    $("#search-btn").click(function () {
      paginator.update()
    })

    $("#search").on('keypress', function (event) {
      if (event.key == 'Enter')
        paginator.update()
    })

    $("#per_page").on('change', function () {
      paginator.per_page = $("#per_page").val()
      paginator.update()
    })

    paginator.update()
  },

  prev: function () {
    if (paginator.cur_page == 1)
      return;

    paginator.cur_page--
    paginator.update()
  },

  next: function () {
    if (this.cur_page == Math.ceil(total / per_page))
      return;

    paginator.cur_page++
    paginator.update()
  },

  navigate: function (li) {
    if (paginator.cur_page == $(li).find('a').text())
      return;

    paginator.cur_page = $(li).find('a').text()
    paginator.update()
  },

  update: function () {
    paginator.updateBar()
    paginator.callback()
  }.bind(this),

  updateBar: function () {
    let first_page = Math.max(1, paginator.cur_page - Math.floor(MAX_BTNS / 2))
    let last_page = first_page + Math.min(MAX_BTNS, Math.ceil(paginator.total / paginator.per_page) - first_page + 1)

    $("#pagination_bar").html(`
      <li onclick="paginator.prev()" class="paginate_button page-item previous ${first_page != paginator.cur_page ? 'disabled' : ''}" id="dtBasicExample_previous">
        <a href="#" class="page-link">Previous
        </a>
      </li>
    `)

    for (let i = first_page; i < last_page; i++)
      $("#pagination_bar").append(`
        <li onclick="paginator.navigate(this)" class="paginate_button page-item ${i == paginator.cur_page ? 'active' : ''}">
          <a href="#" class="page-link">${i}</a>
        </li>
      `)

    if (last_page == first_page)
      $("#pagination_bar").append(`
        <li onclick="paginator.navigate(this)" class="paginate_button page-item active">
          <a href="#" class="page-link">1</a>
        </li>
      `)

    $("#pagination_bar").append(`
      <li onclick="paginator.next()" class="paginate_button page-item next ${last_page != paginator.cur_page ? 'disabled' : ''}" id="dtBasicExample_next">
        <a href="#" class="page-link">Next</a>
      </li>
    `)

    $("#first_of_page").text((paginator.cur_page - 1) * paginator.per_page + 1)
    $("#last_of_page").text(paginator.cur_page * paginator.per_page)
    $("#all_count").text(paginator.total)
  }
}