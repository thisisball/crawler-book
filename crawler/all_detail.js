let Crawler = require("crawler");
const pinyin = require('pinyin')
const mysql = require('mysql')

class All {
    constructor(options){
        this.table = options.table;
        this.index = options.startIndex;
        this.pool =  mysql.createPool({
            host: '',
            user: '',
            password: '',
            database: '',
            port: 3306
        });
        this.init();
    }

    _detailUpdateModule(res){
        let $ = res.$;
        let content = $('.contentbox').text();
        let updateTime = new Date().getTime();
        let status = 1
        return `update ${this.table} set content='${content}',status='${status}',update_time='${updateTime}' where id =${this.index}`
    }

    init(){
        let sql = `select * from ${this.table} where id=${this.index}`
        this.pool.getConnection( (err,conn)=>{
            if(err) console.log(err);
            conn.query(sql,(err,results)=>{
                if(err) console.log(err)
                if(results){
                    // console.log(results);
                    let url = results[0].source_url;
                    this._commonPromise(url).then(  (res)=>{
                        let sql = this._detailUpdateModule(res);
                        this.pool.getConnection( (errs,conns)=>{
                            if(errs){
                                this.index++;
                                this.init();
                                console.log(errs);

                            }
                            conns.query(sql, (error,ress)=>{
                                if(error) console.log(error);
                                if(ress){
                                    console.log('log',ress);
                                    this.index ++;
                                    this.init();
                                }else{
                                    console.log('finish');
                                }
                            }  )
                            conns.release();
                        } )
                    }).catch( (err)=>{
                        console.log(err);
                    } )
                    conn.release()
                }
            })
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
}


module.exports = All