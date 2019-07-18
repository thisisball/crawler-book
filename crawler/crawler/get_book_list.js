/**
 * Created by hp on 2018/6/16.
 */

let Crawler = require("crawler");
const pinyin = require('pinyin')
const mysql = require('mysql')
class Book{
    constructor(options) {
        this.firstUrl = options.firstUrl;
        this.domain = options.domain;
        this.number = options.number;
        this.normalUrl = options.normalUrl;
        this.start = 1;
        this.table = options.table;
        this.pool =  mysql.createPool({
            host: '',
            user: '',
            password: '',
            database: '',
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
    _getBookListInit(res,index){
        let $ = res.$;
        let content = $('.rec_rullist ul');
        let sql = this._bookListModule(content,index,$);
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    // console.log('rest',results.insertId,sql.sql);
                    //update
                    this._commonPromise(sql.url).then( (result)=>{
                        let r = result.$;
                        let intro = r('.intro').text();
                        let img = `${this.domain}${r('.pic img').attr('src')}`;
                        let updateSql = `update ${this.table} set book_detail_intro='${intro}',book_img='${img}' where id=${results.insertId}`;
                        this.pool.getConnection( (err,conns)=>{
                            if(err) console.log(err);
                            conns.query(updateSql,(err,conns)=>{
                                if(err) console.log(err);
                                if(result){
                                    if(++index < content.length){
                                        this._getBookListInit(res,index)
                                    }else{
                                        console.log('finish');
                                        console.log('get next page')
                                        this.start = this.start + 1;
                                        if(this.start > 212){return ;}
                                        this.firstUrl = `${this.normalUrl}/${this.start}/`
                                        console.log('firstUrl',this.firstUrl);
                                        this.init()
                                    }

                                }
                            })
                            conns.release()
                        })

                    }).catch( (err)=>{
                        console.log(err);
                    } )

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
        let obj = {
            sql:`insert into ${this.table}(book_name,book_author,book_word,update_time,book_type,book_table,book_type_des,book_detail_url,book_detail_read_url)
                 values( '${name}','${author}','${word}','${time}',1,'${table}','${type}','${downloadHref}','${readHref}' )`,
            url:downloadHref
        }
        return obj
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

module.exports = Book















