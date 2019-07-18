const mysql = require('mysql');
let Crawler = require("crawler");

class UpdateBook{
    constructor(options){
        this.fromTable = options.fromTable;
        this.toTable = options.toTable;
        this.index = options.target || 1;
        this.nowNumber = options.nowNumber;
        this.target = options.target;
        this.pool =  mysql.createPool({
            host: '',
            user: '',
            password: '',
            database: '',
            port: 3306
        });
        this.init()
    }
    init(type){
        // if(!type){
        //    this.index = 1;
        // }else{
        //     this.index  = type + 1;
        // }

        let sql = ''

        if(!type){
            sql = `select * from ${this.fromTable} where id=${this.index}`

        }else{
            sql = this._next_sql()
        }

        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err);
                if(results){
                    // let id = results[0].id;
                    let url = results[0].book_detail_read_url;
                    let name = results[0].book_table;
                    this._commonPromise(url).then( (res)=>{
                        if(this.index == this.target){
                            this._firstWrite(res,(this.nowNumber + 1),name,url)
                        }else{
                            this._firstWrite(res,0,name,url)

                        }
                    } );

                    conn.release()
                }
            })
        })
    }



    _next_sql(){
        return `select * from ${this.fromTable} where id =(select id from ${this.fromTable} where id >${this.index -1 } order by id asc limit 1)`
    }

_firstWrite(res,index,name,url){
        let $ = res.$;
        let content = $('.mulu_list li');
        let length = $('.mulu_list li').length;

        console.log(length);

        let titles = $(content[index]).text() ? $(content[index]).text() : "" ;
        let title = titles.replace(/\“|\”|\"/g,"'");
        let prehref = $(content[index]).find('a').attr('href');
        let href = `${url}${prehref}`
        let time = new Date().getTime();
        let sql = `insert into ${this.toTable} (title,create_time,total,book_name,from_id,source_url) values("${title}","${time}",${length},"${name}",${this.index},"${href}")`
        // let sql = `insert into ${this.toTable} (title) values('1')`;
        this.pool.getConnection( (err,conn)=>{
            if(err){
                // this.index++
                console.log('errr1',err);
            }
            conn.query(sql,(err,results)=>{
                console.log('sss',results);

                let totals = results ? results.insertId : 'next'
                if(err) console.log(err);
                if(results){
                    if(++index <length){
                        this._firstWrite(res,index,name,url)
                    }else{
                        this.index ++
                        this.init(totals)
                        console.log('finish');
                    }
                    conn.release()
                }
            })
        })
    }

    _updateContent(res,index){
        this._commonPromise(url).then( (res)=>{

            let sql = this._detailUpdateModule(res,index)
            this.pool.getConnection( (err,conn)=>{
                if(err) console.log(err);
                conn.query(sql,(err,results)=>{
                    if(err) console.log(err);
                    if(results){
                        if(++index <length){
                            this.init()
                        }else{
                            console.log('finish');
                        }
                        conn.release()
                    }
                })
            })
        }).catch( (err)=>{} );
    }
    _detailInitModule(res,index){
        let $ = res.$;
        let content = $('.mulu_list');
        let length = $('.mulu_list li').length;
        // let sql = this._bookDetailModule(content,index,$);
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
    _detailUpdateModule(res){
        let $ = res.$;
        let content = $('.contentbox').text();
        let updateTime = new Date().getTime();
        let status = 1
        return `update ${this.toTable} set content='${content}',status='${status}',update_time='${updateTime}' where id =${this.index}`
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
}

module.exports = UpdateBook

