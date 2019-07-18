const Detail =  require('./detail.js');
const UpdateBook  = require('./update_detail.js')

const Book = require('./get_book_list.js')

// new Detail();

const config = {

}


// new Book('https://www.duquanben.com/book1/0/1/',212);
new Book(
    {firstUrl:'https://www.duquanben.com/book1/0/1/',
     normalUrl:'https://www.duquanben.com/book1/0',
    number:212,
    table:'book1',
    domain:'https://www.duquanben.com'});




new Detail({
    fromTable:'book1',
    toTable:'book1_detail'
})

// new UpdateBook(config)