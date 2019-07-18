/**
 * Created by hp on 2018/6/16.
 */

// https://www.duquanben.com/
let Crawler = require("crawler");
let fs = require("fs");
const https = require('https')
const cheerio = require('cheerio')
const request = require('request')
const iconv = require('iconv-lite')
const pinyin = require('pinyin')
const mysql = require('mysql')
let pool = mysql.createPool({
    host: '',
    user: '',
    password: '',
    database: '',
    port: 3306
});


function chineseBecomePinyin(word){
    if(word){
        let temp =  pinyin(word,{
            style:pinyin.STYLE_NORMAL
        })
        let finish = ''
        if(Array.isArray(temp)){
            for(let i=0;i<temp.length;i++){
                finish = finish + temp[i].join('')
            }
            return finish
        }else{
            console.error('here has a error in changing')
        }

    }else{
        console.error('paramers in not corrert')
    }


}

class Book{
    constructor(firstUrl,number) {
        this.firstUrl = firstUrl;
        this.number = number;
        this.start = 1;
        this.pool =  mysql.createPool({
            host: '123.207.149.45',
            user: 'root',
            password: 'ren3068128',
            database: 'book',
            port: 3306
        });
        this.chineseBecomePinyin = function(word){
            if(word){
                let temp =  pinyin(word,{style:pinyin.STYLE_NORMAL})
                let finish = ''
                if(Array.isArray(temp)){
                    for(let i=0;i<temp.length;i++){
                        finish = finish + temp[i].join('')
                    }
                    return finish
                }else{
                    console.error('here has a error in changing')
                }

            }else{
                console.error('paramers in not corrert')
            }


        }
        this.init()
    };
    init(){
        this._getList().then( (res)=>{this._getBookListInit(res,0)}).catch( (err)=>{console.log(err);});
    }

    _commonPromise(url){
        return new Promise( (resolve,reject)=>{
            new Crawler({
                maxConnections: 10,
                callback: function (error, res, done) {
                    if (error) {reject(error); console.log(error)}
                    else { resolve(res) }
                    done();
                }
            }).queue(url);
        })
    }

    _getList(){
        return new Promise( (resolve,reject)=>{
            new Crawler({
                maxConnections: 10,
                callback: function (error, res, done) {
                    if (error) {reject(error); console.log(error)}
                    else { resolve(res) }
                    done();
                }
            }).queue(this.firstUrl);
        })
    }


 _getDetailFromId(url,id){
        this._commonPromise(url).then( (res)=>{
            let $ = res.$;
            let intro = $('.intro').text();
            let  sql = `update book1 set book_detail_url = "${url}", book_detail_intro = "${intro}" where id = ${id}`;
            this.pool.getConnection( (err,conn)=>{
                if(err) console.log(err);
                conn.query(sql,(err,results)=>{
                    if(err) console.log(err)
                    if(results){
                        if(results){

                        }
                        conn.release()
                    }
                })
            })
        })

 }

    _getBookListInit(res,index){
        let $ = res.$;
        let content = $('.rec_rullist ul');
        let sql = this._bookListModule(content,index,$)
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    console.log('rest',results.insertId,sql);
                    if(results ){
                        if(++index < content.length){
                            this._getBookListInit(res,index)
                        }else{
                            console.log('finish');
                            console.log('get next page')
                            this.start = this.start + 1;
                            if(this.start > 212){return ;}
                            this.firstUrl = `https://www.duquanben.com/book1/0/${this.start}/`
                            console.log('firstUrl',this.firstUrl);
                            this.init()
                        }
                    }
                    conn.release()
                }
            })
        })
    }
    _bookListModule(content,index,$){
        let v = content[index]
        let title = $(v).find('.two').text()
        let name = title.substring(0,title.length-4)
        let downloadHref = $(v).find('.three a').attr('href');
        let readHref = $(v).find('.two a').attr('href');
        let author = $(v).find('.four').text()
        let word = $(v).find('.five').text()
        let time = $(v).find('.six').text()
        let type= $(v).find('.sev').text()
        let table = this.chineseBecomePinyin(name)
        return `insert into book1(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des,book_detail_url,book_detail_read_url)
                 values( '${name}','${author}','${word}','${time}',1,'${table}','${type}','${downloadHref}','${readHref}' )`
    }
    _loop(index,content){
        var arr = ["a","b","c"];
        const that = this
        setTimeout(function(){
            console.log(arr[index]);
            if (++index<arr.length) {
                _loop(index);
            } else {
                console.log("全部执行完毕");
            }
        }, 500);
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    console.log('rest',results.insertId);
                    if(results ){
                        if(++index < length){
                            this._loop(index)
                        }else{
                            console.log('finish');
                        }
                    }
                    conn.release()
                }
            })
        })

    }

    _getDetailContentPromise(detailUrl){
        return new Promise( (resolve,reject)=>{
            new Crawler({
                maxConnections: 10,
                callback: function (error, res, done) {
                    if (error) {reject(error); console.log(error)}
                    else { resolve(res) }
                    done();
                }
            }).queue(detailUrl);
        })
    }

    _getDetailContent(){
        this._getDetailContentPromise(url).then( (res)=>{
              let $ = res.$
              let intro = $('.intro').text();
              let sql = this._bookDetailHrefModule(intro,id)
        })
    }
    _bookDetailHrefModule(intro,id){
        return `update book_lists(book_detail_url) values("${intro}") where id =${id}`
    }

    _bookDetailList(res){
        let $ = res.$;
        let content = $('.mulu_list ul');
        let length = content.lenght;
    }



    _getBookListContent(res){
        let $ = res.$;
        let content = $('.rec_rullist ul');
        let length = content.length
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    console.log('rest',results.insertId);
                    if(results ){
                        console.log('rst',results.insertId);
                        this._getDetail(detailUrl,results.insertId);
                        if(index ==  length -1 ){
                            this.start = this.start + 1;
                            console.log('start',this.start);
                            if(this.start > 212){return ;}
                            this.firstUrl = `https://www.duquanben.com/book1/0/${this.start}/`
                            console.log('firstUrl',this.firstUrl);
                            this.init()
                        }
                    }
                    conn.release()
                }
            })
        })


        content.each( (i,v)=>{
            let title = $(v).find('.two').text()
            let name = title.substring(0,title.length-4)
            let author = $(v).find('.four').text()
            let word = $(v).find('.five').text()
            let time = $(v).find('.six').text()
            let type= $(v).find('.sev').text()
            let table = this.chineseBecomePinyin(name)
            let detailUrl = ''
            let sql = `insert into book_lists(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des)
                 values( '${name}','${author}','${word}','${time}',1,'${table}','${type}' )`
            this._writeData(sql,detailUrl,length,i)
        } )
    }

    _getDetail(url,id){
        return  new Crawler({
            maxConnections: 10,
            callback:  (error, res, done)=> {
                if (error) {console.log(error);}
                else {
                    var $ = res.$;
                    let content = $('.rec_rullist ul')
                    // let sql = `update book_list(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des)
                    //  values( '${name}','${author}','${word}','${time}',1,'${table}','${type}' ) where id=${id}`
                    // this._writeData(sql)
                    //     .then( (res)=>{
                    //     console.log(res);
                    // } ).catch( (err)=>{
                    //     console.log(err);
                    // } );
                }
                done();
            }
        }).queue(url)
    }


    _writeData(sql,detailUrl,length,index){
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    console.log('rest',results.insertId);
                        if(results ){
                            console.log('rst',results.insertId);
                            this._getDetail(detailUrl,results.insertId);
                            if(index ==  length -1 ){
                                this.start = this.start + 1;
                                console.log('start',this.start);
                                if(this.start > 212){return ;}
                                this.firstUrl = `https://www.duquanben.com/book1/0/${this.start}/`
                                console.log('firstUrl',this.firstUrl);
                                this.init()
                            }
                        }
                    conn.release()
                }
            })
        })
    }


}

new Book('https://www.duquanben.com/book1/0/1/',212);


class Detail{
    constructor(){
        this.pool =  mysql.createPool({
            host: '123.207.149.45',
            user: 'root',
            password: 'ren3068128',
            database: 'book',
            port: 3306
        })

        this.init()
    }
    _commonPromise(url){
        return new Promise( (resolve,reject)=>{
            new Crawler({
                maxConnections: 10,
                callback: function (error, res, done) {
                    if (error) {reject(error); console.log(error)}
                    else { resolve(res) }
                    done();
                }
            }).queue(url);
        })
    }
    init(){
        this._commonPromise().then( (res)=>{
            let $ = res.$;
            let content = $('.mulu_list ul');
            let length = content.length;

        } )
    }

    _detailModule(){

    }
    _poolConnection(){
        let sql =  `select * from book1 where id=${this.id}`
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    console.log('rest',results.insertId,sql);
                    if(results ){
                        if(++index < content.length){
                            this._getBookListInit(res,index)
                        }else{
                            console.log('finish');
                            console.log('get next page')
                            this.start = this.start + 1;
                            if(this.start > 212){return ;}
                            this.firstUrl = `https://www.duquanben.com/book1/0/${this.start}/`
                            console.log('firstUrl',this.firstUrl);
                            this.init()
                        }
                    }
                    conn.release()
                }
            })
        })
    }


    _getHref(){
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){

                }
            })
        })
    }

    _idBecomeSql(id){
        return `select * from 'book_list' where id =${id}`
    }

    _getContentHref(){

    }

    _getContentFromHref(){

    }

}


class Product{

}







// new Detail()







var c = new Crawler({
    maxConnections: 10,
    callback: function (error, res, done) {
        if (error) {
            console.log(error);

        } else {
            var $ = res.$;

            let content = $('.rec_rullist ul')
            // console.log(title);

            content.each( (i,v)=>{
                let title = $(v).find('.two').text()
                let name = title.substring(0,title.length-4)
                let author = $(v).find('.four').text()
                let word = $(v).find('.five').text()
                let time = $(v).find('.six').text()
                let type= $(v).find('.sev').text()
                let table = chineseBecomePinyin(name)
                let detailUrl = ''
                pool.getConnection(function(err,conn) {
                    if(err) console.log(err);
                    let sql = `insert into book_list(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des)
                     values( '${name}','${author}','${word}','${time}',1,'${table}','${type}' )`
                    conn.query(sql,function(err,results){
                        if(err) console.log('err',err);
                        if(results){

                            console.log('thisi is ',results);
                            conn.release()

                        }
                    })
                })



                // console.log($(v).index(i).text() );

            } )

            // console.log(content);



        }
        done();
    }
});








const getList = function(){
    return new Promise( (resolve,reject)=>{
        new Crawler({
            maxConnections: 10,
            callback: function (error, res, done) {
                if (error) {reject(error); console.log(error)}
                else { resolve(res) }
                done();
            }
        }).queue(startUrl);
    })
};


function getDetail(url,id){
    return  new Crawler({
        maxConnections: 10,
        callback: function (error, res, done) {
            if (error) {console.log(error);}
            else {
                var $ = res.$;
                let content = $('.rec_rullist ul')
                pool.getConnection(function(err,conn) {
                    if(err) console.log(err);
                    let sql = `update book_list(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des)
                     values( '${name}','${author}','${word}','${time}',1,'${table}','${type}' ) where id=${id}`
                    conn.query(sql,function(err,results){
                        if(err) console.log(err);
                        if(results){
                            console.log(results);
                            conn.release()
                        }
                    })
                })

            }
            done();
        }
    }).queue(url)
}






let getContent = {
    getList:function(){
        return new Promise( (resolve,reject)=>{
            new Crawler({
                maxConnections: 10,
                callback: function (error, res, done) {
                    if (error) {reject(error); console.log(error)}
                    else { resolve(res) }
                    done();
                }
            }).queue(startUrl);
        })
    }
};

    let next = function(){
        getList().then( (res)=>{
            var $ = res.$;
            let content = $('.rec_rullist ul');
            // console.log('res',res);
            content.each( (i,v)=>{
                let title = $(v).find('.two').text()
                let name = title.substring(0,title.length-4)
                let author = $(v).find('.four').text()
                let word = $(v).find('.five').text()
                let time = $(v).find('.six').text()
                let type= $(v).find('.sev').text()
                let table = chineseBecomePinyin(name)

                pool.getConnection(function(err,conn) {
                    if(err) console.log(err);
                    let sql = `insert into book_lists(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des)
                     values( '${name}','${author}','${word}','${time}',1,'${table}','${type}' )`
                    conn.query(sql,function(err,results){
                        if(err) console.log(err);
                        if(results){
                            console.log('result',results.insertId);
                            getDetail(detailUrL,results.insertId)



                            // console.log(results);
                            // start = start + 1;
                            // startUrl = `https://www.duquanben.com/book1/0/${start}/`
                            // console.log(start);
                            // console.log(startUrl);
                            conn.release()
                            if(i == content.length -1 ){
                                start = start + 1;
                                if(start > 212){
                                    return ;
                                }
                                startUrl = `https://www.duquanben.com/book1/0/${start}/`
                                next()
                            }

                        }
                    })
                })

            } )

            // let content = $('.rec_rullist ul')
            // console.log(content);

        }).catch( (err)=>{
            console.log(err);
        });
    };


    let start = 1;
    let startUrl = `https://www.duquanben.com/book1/0/${start}/`
    // next()
    // for(let i=0;i<211;i++){

        // let url = `https://www.duquanben.com/book1/0/${i}/`

    // }

// c.queue(queueUrl);















