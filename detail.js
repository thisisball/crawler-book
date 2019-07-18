let Crawler = require("crawler");
let fs = require("fs");
const https = require('https')
const cheerio = require('cheerio')
const request = require('request')
const iconv = require('iconv-lite')
const pinyin = require('pinyin')
const mysql = require('mysql')
let url = 'https://www.duquanben.com/xiaoshuo/10/10584/2179905.html'

class Detail{
    constructor(){
        this.url = 'https://www.duquanben.com/xiaoshuo/9/9456/';
        this.pool =  mysql.createPool({
            host: '',
            user: '',
            password: '',
            database: '',
            port: 3306
        });

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
        // this._commonPromise(this.url).then( (res)=>{
        //     let $ = res.$;
        //     let content = $('.mulu_list ul');
        //     let length = content.length;
        //
        // } )

        this._commonPromise(this.url).then( (res)=>{
            let $ = res.$;
            let content = $('.mulu_list');
            let length = $('.mulu_list li').length;
            let  sql = this._detailInitModule(content,res,$,0);
            this.pool.getConnection( (err,conn)=>{
                if(err) console.log(err);
                conn.query(sql,(err,results)=>{
                    if(err) console.log(err)
                    if(results){
                        if(results ){
                            if(++index <length){
                                this._getBookDetailInit(res,index)
                            }else{
                                console.log('finish');
                            }
                        }
                        conn.release()
                    }
                })
            })





            // console.log('$',$);
            // let title = $('.h1title h1').text();
            // let content = $('.contentbox').text();
            // let createTime = new Date().getTime();
            // let nextLinkHref = $('.next').attr('href');
            // let nextLink = `https://www.duquanben.com${nextLinkHref}`;
            // let status = 0;
            // console.log('next',nextLink);
            // return `insert into book1_detail(title,content,source_link,next_link,create_time,status)
            //      values( '${title}','${content}','${sourceLink}','${nextLink}','${createTime}','${status}'`
        }).catch( (err)=>{

        })


    }

    _getBookDetailInit(res,index){
        let $ = res.$;
        let content = $('.mulu_list');
        let length = $('.mulu_list li').length;
        let sql = this._bookDetailModule(content,index,$);
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    if(results ){
                        if(++index <length){
                            this._getBookDetailInit(res,index)
                        }else{
                            console.log('finish');
                            // console.log('get next page')
                            // this.start = this.start + 1;
                            // if(this.start > 212){return ;}
                            // this.firstUrl = `https://www.duquanben.com/book1/0/${this.start}/`
                            // console.log('firstUrl',this.firstUrl);
                            // this.init()
                        }
                    }
                    conn.release()
                }
            })
        })
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

    _getContentBecomeSql(id){
        return `select * from 'book_list' where id =${id}`
    }

    _getContentHref(){

    }

    _getContentFromHref(){

    }

    _detailInitModule(content,res,$,index){
        // let $ = res.$;
        let title = $(content[index]).text();
        let createTime = new Date().getTime();
        let status = 0;
        let bookName ='321';
        return `insert into book1_detail(title,source_link,create_time,status,book_name)
                 values( '${title}','${sourceLink}','${createTime}','${status}','${bookName}'`
    }



    _detailModule(){
        let $ = res.$;
        let title = $('.h1title h1').text();
        let content = $('.contentbox').text();
        let createTime = new Date().getTime();
        let nextLink = $('.next').attr('href');
        let status = 0;
        let bookName ='321';
        return `insert into book1_detail(title,content,source_link,next_link,create_time,status,book_name)
                 values( '${title}','${content}','${sourceLink}','${nextLink}','${createTime}','${status}','${bookName}'`
    }

}


module.exports = Detail