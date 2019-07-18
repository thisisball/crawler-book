var formidable = require('formidable');
var fs = require('fs');
const path =require('path')
const fileDir = path.resolve(__dirname,'./temp' )
const COS = require('cos-nodejs-sdk-v5');
const router = new require('koa-router')();
const modules = require('../module/index.js');
const cheerio = require('cheerio');
const iconv = require('iconv-lite');
const utils = require('../script/uils.js');
const user = require('./user.js');
const jwt = require('jsonwebtoken');
const koaBody = require('koa-body');
let params = {
    AppId: '',
    SecretId: '',
    SecretKey: '',
};
const cos = new COS(params);

router.post('/upload', async(ctx,next)=>{
    const file = ctx.request.files;
    // console.log('123',file);
    if(!file){
        ctx.body = {
            code:100,
            msg:'fail'
        }
    }else{
        const ext = file.files.name.split('.').pop();
        var rr = fs.createReadStream(file.files.path)
            .pipe(iconv.decodeStream('gbk'))
            .pipe(iconv.encodeStream('utf8'))
        // .pipe(fs.createWriteStream(__dirname + `/temp/${Math.random().toString()}.${ext}` ) );

        let name = '213';
        let time = new Date().getTime();
        let type =1;
        let article_index =1;
        let keyUrl = `/book/${name}/${time}_${type}_${article_index}.txt`
        var a = {
            Bucket:'',
            Region:'',
            Key:keyUrl,
            Body:rr,
            // Body:fs.readFileSync(__dirname + `/temp/0.20074587023906942.txt`),
            // ContentLength:fs.statSync(__dirname + `/temp/0.20074587023906942.txt`).size,
            ContentLength:rr.size,
            onProgress : function(progressData) {
            }
        };

        function ups(){
            return new Promise( (resolve,reject)=>{
                cos.putObject(a,function(err,data){
                    if(err) reject(err)
                    if(data) resolve(data)
                })
            })
        }
        let upSuccess = await ups();
        if(upSuccess.statusCode == 200){
            ctx.body = {
                code:0,
                url:``,
                msg:'success'
            };
        }else{
            ctx.body = {
                code:1001,
                msg:'fail'
            }
        }

    }

})



