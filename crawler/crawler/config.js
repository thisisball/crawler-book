const mysql = require('mysql')
let pool = mysql.createPool({
    host: '',
    user: '',
    password: '',
    database: '',
    port: 3306
});