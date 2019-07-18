let Crawler = require("crawler");
let fs = require("fs");
const https = require('https');
const cheerio = require('cheerio');
const request = require('request');
const iconv = require('iconv-lite');
const pinyin = require('pinyin');
const mysql = require('mysql');


module.exports = {
    pool:mysql.createPool({
        host: '',
        user: '',
        password: '',
        database: '',
        port:3306
    }),
    chineseBecomePinyin:function(word){
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


},

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
    },




};