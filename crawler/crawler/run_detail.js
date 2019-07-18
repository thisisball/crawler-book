const UpdateBook  = require('./update_detail.js')

new UpdateBook({
    fromTable:'book1',
    toTable:'book1_detail',
    nowNumber:782,
    target:3023, //id
})

