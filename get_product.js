let Crawler = require("crawler");
let fs = require("fs");
const mysql = require('mysql')
let pool = mysql.createPool({
    host: '',
    user: '',
    password: '',
    database: '',
    port: 3306
});

let pageMin = 1;
let pageMax = 147;
let queueUrl = [];

for (let i = pageMin; i <= pageMax; i++) {
    queueUrl.push(`http://www.cgi.gov.cn/Products/List/?1=${i}&page=1&Category=&Area=&key=`);
}

var c = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);
        } else {
            var $ = res.$;
            let pageProduct = $('.ProItemTableTitle a');
            let pageArea = $('.ProItemTableArea a');
            let img = $('.ProItemTableImg img');
            let productList = [];
            console.log(pageProduct,pageArea,img,productList);

            pageProduct.each((i, el) => {
                let text = pageArea[i].firstChild.data.replace(/^\s+|\s+$/g, "");
                productList.push({
                    id: el.attribs.href.split('/')[3],
                    detail_href: 'http://www.cgi.gov.cn'+  el.attribs.href,
                    product: el.firstChild.data,
                    area: text.slice(1, text.length - 1),
                    img: 'http://www.cgi.gov.cn' + img[i].attribs.src,
                    img_src:'image.fbarrel.com' + img[i].attribs.src
                });


                // pool.getConnection(function(err,conn) {
                //     if(err) console.log(err);
                //     let sql = `insert into native_product_list(product_name,product_detail_url,product_area,product_img_source_url,product_img_show_url) values('${el.firstChild.data}','${'http://www.cgi.gov.cn'+  el.attribs.href}','${text.slice(1, text.length - 1)}','${'http://www.cgi.gov.cn' + img[i].attribs.src}','${'image.fbarrel.com' + img[i].attribs.src}')`
                //     conn.query(sql,function(err,results){
                //         if(err) console.log(err);
                //         if(results){
                //             console.log(results);
                //             conn.release()
                //
                //         }
                //     })
                // })
            });
            // fs.appendFile('./files/product.text', productList.map(p => `${p.id}\t${p.product}\t${p.area}\t${p.img}`).join('\r\n') + '\r\n', (err) => {
            //     if (err) throw err;
            //     console.log('The "data to append" was appended to file!');
            // });
        }
        done();
    }
});
c.queue(queueUrl);



function getDetail(res){
    var $ =res.$;
   let  title = $('.TableTitle').text();
   let content = $('.TableContent p').text();
   let intro = $('#tag_1').text(); //简介
   let intro_info = $('#area_1').text();  // 1-5
    let qutity = $('#tag_3').text(); //质量要求
}
