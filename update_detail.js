const mysql = require('mysql');
let Crawler = require("crawler");

class UpdateBook{
    constructor(){
        this.fromBook = 'book1'
        this.bookName = 'book1_detail';
        this.index = 1;
        this.pool =  mysql.createPool({
            host: '',
            user: '',
            password: '',
            database: '',
            port: 3306
        });
        this.init()
    }
    init(){
        let sql = `select * from ${this.fromBook} where id=${this.index}`
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err);
                if(results){
                    let url = results[0].book_detail_read_url
                    this._commonPromise(url).then( (res)=>{
                        this._firstWrite(res,0)
                        console.log('res',res);
                    } )

                    // this._updateContent(res,this.index)
                    conn.release()
                }
            })
        })
    }

    _firstWrite(res,index){
        this._writeInitContent(res,index)
    }

    _writeInitContent(res,index){
        let $ = res.$;
        let content = $('.mulu_list');
        let length = $('.mulu_list li').length;
        let title = $(content[index]).text();
        let time = new Date().getTime()
        let sql = `insert into book1_detail values(title,create_time,status) values('${title}','${time}','0')`
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err);
                if(results){
                    if(++index <length){
                        this._firstWrite(res,index)
                    }else{
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
        return `update ${this.bookName} set content='${content}',status='${status}',update_time='${updateTime}' where id =${this.index}`
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

